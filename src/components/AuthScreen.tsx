import React, { useState } from "react";
import { GraduationCap, Sparkles, Key, Mail, User, ShieldAlert, Cpu } from "lucide-react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";

interface AuthScreenProps {
  onAuthSuccess: (userObj: {
    uid: string;
    email: string;
    name: string;
    role: "user" | "admin";
    plan: "free" | "pro";
    streakCount: number;
    lastActiveAt: string;
    createdAt: string;
  }) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [emailInp, setEmailInp] = useState("");
  const [pwdInp, setPwdInp] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [nameInp, setNameInp] = useState("");
  const [errorText, setErrorText] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setErrorText("");
    try {
      const provider = new GoogleAuthProvider();
      // Enforce custom parameters if needed
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        onAuthSuccess({
          uid: result.user.uid,
          email: result.user.email || "",
          name: result.user.displayName || result.user.email?.split("@")[0].toUpperCase() || "Google Tutor Student",
          role: "user",
          plan: "free",
          streakCount: 1,
          lastActiveAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.error("Google Authentication error:", err);
      setErrorText("Google Sign-In failed or was closed. Please try again or use Sandbox Mode.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleStandardAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInp.trim() || !pwdInp.trim() || (isRegister && !nameInp.trim())) {
      setErrorText("Kindly fill out all relevant authentication forms.");
      return;
    }

    // Standard sandbox/credential session callback
    onAuthSuccess({
      uid: `sandbox_${Math.random().toString(36).substr(2, 9)}`,
      email: emailInp,
      name: isRegister ? nameInp : emailInp.split("@")[0].toUpperCase(),
      role: "user",
      plan: "free",
      streakCount: 1,
      lastActiveAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
  };

  const handleSandboxOverrideSubmit = () => {
    // Deliver predefined sandbox profile
    onAuthSuccess({
      uid: "sandbox_math_learner_77",
      email: "sandbox.student@example.com",
      name: "Sandbox Math Explorer",
      role: "user",
      plan: "free",
      streakCount: 3,
      lastActiveAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white border border-slate-100 rounded-3xl shadow-xl space-y-6 text-center" id="auth-shell-dialog">
      <div className="space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
          <GraduationCap className="w-9 h-9" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">AI Mathematics Tutor</h2>
        <p className="text-xs text-slate-500 leading-relaxed px-4">
          Master counting tables, algebra formulas, multiplication charts, trigonometry ratios with a step-by-step AI coach.
        </p>
      </div>

      {/* Primary Google Login */}
      <div className="space-y-2">
        <button
          onClick={handleGoogleSignIn}
          disabled={authLoading}
          className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs ring-1 ring-slate-200 rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 mr-1 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.05,3.1l3.2,2.5c1.87,-1.73 2.95,-4.27 2.95,-7.2C21.48,11.73 21.43,11.4 21.35,11.1z" fill="#4285F4" />
              <path d="M12,20.6c2.43,0 4.47,-0.8 5.96,-2.2l-3.2,-2.5c-0.89,0.6 -2.03,0.96 -3.42,0.96 -2.63,0 -4.86,-1.78 -5.66,-4.17l-3.32,2.57C3.86,17.93 7.64,20.6 12,20.6z" fill="#34A853" />
              <path d="M6.34,12.7c-0.2,-0.6 -0.31,-1.24 -0.31,-1.9s0.11,-1.3 0.31,-1.9L3.02,6.33c-0.66,1.32 -1.02,2.8 -1.02,4.37s0.36,3.05 1.02,4.37z" fill="#FBBC05" />
              <path d="M12,5.24c1.32,0 2.51,0.45 3.44,1.35l2.58,-2.58C16.46,2.5 14.42,1.7 12,1.7c-4.36,0 -8.14,2.67 -9.7,6.43l3.32,2.58C6.34,6.72 8.57,5.24 12,5.24z" fill="#EA4335" />
            </g>
          </svg>
          {authLoading ? "Authenticating Google Account..." : "Sign in with Google"}
        </button>
      </div>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-400 font-extrabold tracking-widest text-[9px]">OR PASSWORD / SANDBOX</span>
        </div>
      </div>

      <form onSubmit={handleStandardAuthSubmit} className="space-y-4 text-left">
        {isRegister && (
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Your display name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={nameInp}
                onChange={(e) => setNameInp(e.target.value)}
                placeholder="Math Wizard"
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-700 font-sans"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="email"
              value={emailInp}
              onChange={(e) => setEmailInp(e.target.value)}
              placeholder="you@school.edu"
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-700 font-sans"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Password</label>
          <div className="relative">
            <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="password"
              value={pwdInp}
              onChange={(e) => setPwdInp(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-700 font-sans"
            />
          </div>
        </div>

        {errorText && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs font-semibold">
            {errorText}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow cursor-pointer text-center uppercase tracking-wider"
        >
          {isRegister ? "Register Sandbox Account" : "Access Sandbox Station"}
        </button>
      </form>

      <div className="text-xs text-slate-500 font-sans">
        {isRegister ? (
          <span>Already registered? <button onClick={() => { setIsRegister(false); setErrorText(""); }} className="text-indigo-600 hover:underline font-bold cursor-pointer">Log in here</button></span>
        ) : (
          <span>New student? <button onClick={() => { setIsRegister(true); setErrorText(""); }} className="text-indigo-600 hover:underline font-bold cursor-pointer">Register account</button></span>
        )}
      </div>

      <div className="space-y-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={handleSandboxOverrideSubmit}
          className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-2xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" /> Explore instantly as Sandbox Math Student
        </button>
        <div className="text-[10px] text-slate-400 px-4 leading-relaxed font-sans flex items-center gap-1 justify-center">
          <Cpu className="w-3.5 h-3.5 text-slate-300" />
          Supports offline persistent local state if Firestore permissions is unset.
        </div>
      </div>
    </div>
  );
}

