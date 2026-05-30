# Security Specification

## 1. Data Invariants
- **Identity Isolation**: A user's profile document (`/users/{userId}`) can only be retrieved, created, updated, or deleted by the authenticated user whose `uid` matches `{userId}` exactly.
- **Verification Requirement**: A user must have a verified email (`request.auth.token.email_verified == true`) to write or modify any records unless explicitly exempted.
- **Relational Integrity**: A bookmark or progress log nested under a user path `/users/{userId}/bookmarks/{bookmarkId}` or `/users/{userId}/progress/{progressId}` can only be read or written by the parent user who matches `{userId}`.
- **Field Immutability**: Values like `uid` and `createdAt` must never change once written.
- **Temporal Locking**: All created/updated records must utilize server-generated timestamps (`request.time`) instead of user-reported times.
- **System-Only Exemption**: Roles and subscription plan tiers (the `role` and `plan` fields on user document) must be immutable to standard client-side requests and only set via secure backends or predefined admin-level entries. Users cannot self-escalate from `role: 'user'` to `role: 'admin'` or fields like `plan: 'free'` to `plan: 'pro'`.

---

## 2. The "Dirty Dozen" Payloads
These payloads attempt to exploit access gaps, bypass validation, or perform privilege escalation, and must return `PERMISSION_DENIED`.

1. **Identity Spoofing - Profile Theft**:
   - *Exploit*: Authenticated user `hacker123` attempts to create block `/users/victim456` with `/users/victim456` data holding `uid: 'victim456'`.
   - *Result*: Denied because `request.auth.uid != 'victim456'`.

2. **Privilege Escalation - Self-Assigned Admin**:
   - *Exploit*: User `user789` creates profile under `/users/user789` with `role: 'admin'`.
   - *Result*: Denied since normal sign-ups can only register with `role: 'user'`.

3. **Subscription Theft - Plan Upgrade Grab**:
   - *Exploit*: User `user789` updates their own profile to set `plan: 'pro'` without making a payment.
   - *Result*: Denied since `plan` changes are blocked for client updates.

4. **Creation Temporal Bypass**:
   - *Exploit*: Submitting user profile with `createdAt: "2010-01-01T00:00:00Z"` to pretend they are a long-time member.
   - *Result*: Denied because `createdAt` must match server time (`request.time`).

5. **Update Temporal Hijacking**:
   - *Exploit*: Submitting a progress log update with client time modification `completedAt: "2030-01-01T00:00:00Z"`.
   - *Result*: Denied since update timestamps must match `request.time`.

6. **Relational Theft - Cross-User Bookmark Injection**:
   - *Exploit*: Authenticated User `alice` attempts to write `bookmarks` under `/users/bob/bookmarks/b1` with `userId: 'alice'`.
   - *Result*: Denied because alice cannot access `/users/bob/*` collection files.

7. **Cross-User Progress Reading**:
   - *Exploit*: Authenticated User `alice` attempts to list resource records under `/users/bob/progress/` or fetch a single record.
   - *Result*: Denied because Alice's UID does not match Bob's UID path variable.

8. **Unverified Email Sandbox Breach**:
   - *Exploit*: A user signs up but does not verify their email (`email_verified: false`) and attempts to write to progress data.
   - *Result*: Denied since `email_verified == true` is required for writes.

9. **Ghost Fields Injection**:
   - *Exploit*: Attempting to insert a custom unvalidated field `isPremiumCheater: true` during update or creation of User document.
   - *Result*: Denied due to strict keys verification in the `isValidUser` helper and `affectedKeys().hasOnly()` during updates.

10. **Resource Poisoning - Huge String IDs**:
    - *Exploit*: Creating a bookmark document with a document ID of 10,000 characters to bloat database indexes.
    - *Result*: Denied due to `isValidId` and document-size boundaries constraints.

11. **Bookmark Mutation - Path Mismatch**:
    - *Exploit*: In `/users/alice/bookmarks/b1`, sending a body with `userId: 'bob'` mismatching the actual logical hierarchy.
    - *Result*: Denied because internal bookmark body fields must point to the parent userId path exactly.

12. **Subversive Progress Modification**:
    - *Exploit*: Modifying historical quiz progress scores directly to set high score: `score: 100` on a total count of `10`.
    - *Result*: Denied since historic score records are immutable or only updated under extremely constrained gates.

---

## 3. Test Cases (TDD specifications)
We ensure security bounds are fully established on the draft and final ruleset files. All rogue operations must trigger Firestore's security engine and be blocked permanently.
