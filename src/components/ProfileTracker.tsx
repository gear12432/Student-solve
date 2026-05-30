import { useState } from "react";
import { UserProfile, BookmarkRecord, ProgressRecord } from "../types";
import { Flame, ShieldCheck, CreditCard, LayoutDashboard, Bookmark, History, RotateCcw, Activity, ShieldAlert, Cpu } from "lucide-react";

interface ProfileTrackerProps {
  user: UserProfile | null;
  bookmarks: BookmarkRecord[];
  progress: ProgressRecord[];
  onRemoveBookmark: (bookmarkId: string) => void;
  onUpgradePlan: () => void;
  onSetDemoAdmin: () => void;
}

export default function ProfileTracker({
  user,
  bookmarks,
  progress,
  onRemoveBookmark,
  onUpgradePlan,
  onSetDemoAdmin
}: ProfileTrackerProps) {
  const [activeTab, setActiveTab] = useState<"streaks" | "bookmarks" | "history" | "admin">("streaks");

  // Mock diagnostics for admin dashboard panel
  const ADMIN_USERS_MOCK = [
    { email: "student.alpha@example.com", streak: 5, plan: "pro" },
    { email: "user.trig@example.com", streak: 0, plan: "free" },
    { email: "algebra.geek@example.com", streak: 12, plan: "pro" },
    { email: "geometry.lover@example.com", streak: 3, plan: "free" }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" id="profile-tracker-frame">
      {/* Tab select row */}
      <div className="bg-slate-50 border-b border-slate-100 p-4 flex flex-wrap gap-2 justify-between items-center">
        <div className="flex gap-2">
          {[
            { id: "streaks", label: "Streaks & Subscriptions", icon: Flame },
            { id: "bookmarks", label: "Saved Formulas", icon: Bookmark },
            { id: "history", label: "Study Logs", icon: History },
            { id: "admin", label: "Admin Dashboard", icon: LayoutDashboard },
          ].map((itm) => {
            const Icon = itm.icon;
            return (
              <button
                key={itm.id}
                onClick={() => setActiveTab(itm.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  activeTab === itm.id
                    ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                    : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {itm.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {/* TAB 1: Streaks & Subscriptions */}
        {activeTab === "streaks" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="dashboard-tab-streaks">
            {/* Streak card */}
            <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-100/60 flex items-center justify-between">
              <div className="space-y-1 font-sans">
                <span className="text-[10px] uppercase font-extrabold text-amber-600 tracking-wider">Consistency Engine</span>
                <h3 className="text-xl font-bold text-amber-950">Daily Math Streak</h3>
                <p className="text-xs text-amber-800 leading-relaxed max-w-xs">
                  Study jeden tag! Consistency unlocks specialized neural pathways for math reasoning.
                </p>
                <span className="text-sm font-semibold text-slate-500 block pt-1">
                  Last Active: {user?.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString() : "Just now"}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Flame className="w-16 h-16 text-orange-500 fill-current animate-pulse justify-center flex" />
                  <span className="absolute inset-0 flex items-center justify-center font-bold text-lg text-white font-mono pt-2">
                    {user?.streakCount || 1}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mt-1">Days Stretched</span>
              </div>
            </div>

            {/* Subscription Manager card */}
            <div className="p-6 bg-slate-900 text-slate-50 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Subscription Membership</span>
                <h3 className="text-lg font-bold">Plan status: <span className="text-emerald-400 uppercase font-mono font-black">{user?.plan || "FREE"}</span></h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {user?.plan === "pro" 
                    ? "Unlocked: Supreme server bandwidth, premium Gemini reasoning depth, and complete step solvers."
                    : "Standard constraints: Basic flash-model solving limits. Upgrade to enable absolute math clarity."}
                </p>
              </div>

              {user?.plan !== "pro" ? (
                <button
                  onClick={onUpgradePlan}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <CreditCard className="w-4 h-4" /> Upgrade to premium pro tier ($0/mo Demo)
                </button>
              ) : (
                <span className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-semibold self-start border border-emerald-500/30">
                  <ShieldCheck className="w-4 h-4" /> Infinite Pro active (Developer Demo)
                </span>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Bookmarks */}
        {activeTab === "bookmarks" && (
          <div id="dashboard-bookmarks">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1">
              <Bookmark className="w-4 h-4 text-indigo-600" />
              Bookmarked Math References ({bookmarks.length})
            </h3>

            {bookmarks.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-sans border border-slate-100 rounded-2xl bg-slate-50/50">
                <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-1" />
                <span className="text-xs font-bold">No saved formulas yet</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Bookmarks are compiled across math sheets & tables interactively.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bookmarks.map((bm) => (
                  <div key={bm.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-extrabold text-indigo-600 tracking-wider block">{bm.category}</span>
                      <strong className="text-sm font-bold text-slate-800 font-sans">{bm.title}</strong>
                      <span className="block text-[10px] text-slate-400 font-mono">Key: {bm.itemKey}</span>
                    </div>
                    <button
                      onClick={() => onRemoveBookmark(bm.id)}
                      className="text-xs bg-white text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-3 py-1 rounded-lg transition-colors font-bold cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Study Log history */}
        {activeTab === "history" && (
          <div id="dashboard-history">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1">
              <History className="w-4 h-4 text-indigo-600" />
              Completed Homework & Drill History ({progress.length})
            </h3>

            {progress.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-sans border border-slate-100 rounded-2xl bg-slate-50/50">
                <History className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-1" />
                <span className="text-xs font-bold font-sans">No completed activities yet</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Solve questions or drill exercises to record your growth log.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {progress.map((p) => (
                  <div key={p.id} className="p-3 border border-slate-100 hover:border-slate-200 transition-colors rounded-xl bg-white flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-600">{p.category}</span>
                      <h4 className="text-xs font-bold text-slate-800 mt-0.5 font-sans justify-start flex">{p.activityName}</h4>
                      <span className="text-[9px] text-slate-400 font-sans mt-0.5 block">{new Date(p.completedAt).toLocaleString()}</span>
                    </div>
                    {p.score !== undefined && p.total !== undefined && (
                      <div className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-mono font-bold text-emerald-800">
                        Score: {p.score}/{p.total}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Admin Dashboard Panel */}
        {activeTab === "admin" && (
          <div className="space-y-6" id="dashboard-tab-admin shadow-inner">
            <div className="p-4 bg-indigo-900 text-indigo-100 rounded-xl flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-indigo-300" />
              <div>
                <strong className="block text-xs font-black uppercase text-indigo-300 tracking-wider">Academic Admin Panel Override</strong>
                <p className="text-xs leading-relaxed">
                  Administrator console viewable for sandbox evaluations. Toggle permissions or audit global database registries.
                </p>
              </div>
            </div>

            {/* Stats layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border border-slate-100 bg-slate-50 rounded-xl p-4">
                <span className="text-[10px] uppercase text-slate-400 font-black">CPU index</span>
                <span className="block text-xl font-mono font-black text-slate-700">92.4%</span>
              </div>
              <div className="border border-slate-100 bg-slate-50 rounded-xl p-4">
                <span className="text-[10px] uppercase text-slate-400 font-black">active math instances</span>
                <span className="block text-xl font-mono font-black text-slate-700">3,490</span>
              </div>
              <div className="border border-slate-100 bg-slate-50 rounded-xl p-4">
                <span className="text-[10px] uppercase text-slate-400 font-black">Total solved queries</span>
                <span className="block text-xl font-mono font-black text-slate-700">482,889</span>
              </div>
              <div className="border border-slate-100 bg-slate-50 rounded-xl p-4">
                <span className="text-[10px] uppercase text-slate-400 font-black">Database Snapshots</span>
                <span className="block text-xl font-mono font-black text-slate-700">Healthy</span>
              </div>
            </div>

            {/* Registry table */}
            <div className="border border-slate-200/60 rounded-xl overflow-hidden">
              <h4 className="text-xs font-bold text-slate-600 bg-slate-50 p-2 border-b border-slate-200">Active User Registry Metrics</h4>
              <div className="overflow-x-auto text-xs font-sans">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500 font-bold">
                      <th className="p-2">User Email</th>
                      <th className="p-2">Streak Count</th>
                      <th className="p-2">Plan</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ADMIN_USERS_MOCK.map((m, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="p-2 font-mono">{m.email}</td>
                        <td className="p-2 font-bold text-orange-600">{m.streak} days</td>
                        <td className="p-2 uppercase font-mono font-bold text-indigo-700">{m.plan}</td>
                        <td className="p-2">
                          <button
                            onClick={onSetDemoAdmin}
                            className="bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[9px] hover:bg-indigo-100 font-bold cursor-pointer"
                          >
                            Set Admin Permissions
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
