import { useState, useEffect } from "react";
import { 
  GraduationCap, BookOpen, Compass, Calculator as CalcIcon, User, 
  HelpCircle, Sun, Moon, Globe, LogOut, FileDown, ShieldCheck, Flame
} from "lucide-react";
import { 
  doc, 
  getDoc, 
  getDocFromServer, 
  collection, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  serverTimestamp, 
  onSnapshot 
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { UserProfile, BookmarkRecord, ProgressRecord } from "./types";
import AuthScreen from "./components/AuthScreen";
import ReferenceGuides from "./components/ReferenceGuides";
import Calculator from "./components/Calculator";
import ProblemSolver from "./components/ProblemSolver";
import PracticeDrills from "./components/PracticeDrills";
import MathTutorChat from "./components/MathTutorChat";
import ProfileTracker from "./components/ProfileTracker";

// Internationalized localizations for multilingual support requirement
const TRANSLATIONS = {
  en: {
    heroTitle: "AI Mathematics Practice",
    heroDesc: "Master fundamental, school-level, and advanced mathematics with Google Gemini intelligence.",
    tabStudy: "Study & Practice",
    tabReferences: "Academic Tables",
    tabCalculators: "Calculators & Fractions",
    tabBento: "Dashboard & Streaks",
    btnPdf: "Export Progress PDF",
    langToggle: "Español",
    logOut: "Log Out",
    welcome: "Welcome back",
    langLabel: "English",
  },
  es: {
    heroTitle: "Práctica de Matemáticas IA",
    heroDesc: "Domina las matemáticas fundamentales, escolares y avanzadas con la inteligencia de Google Gemini.",
    tabStudy: "Estudio y Práctica",
    tabReferences: "Tablas Académicas",
    tabCalculators: "Calculadoras y Fracciones",
    tabBento: "Panel y Rachas",
    btnPdf: "Exportar Reporte PDF",
    langToggle: "English",
    logOut: "Cerrar sesión",
    welcome: "Bienvenido",
    langLabel: "Español",
  }
};

export default function App() {
  // Global App States
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>([]);
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [activeLayoutTab, setActiveLayoutTab] = useState<"study" | "references" | "calculators" | "profile">("study");
  
  // Custom preferences
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [locale, setLocale] = useState<"en" | "es">("en");
  const [firebaseConnected, setFirebaseConnected] = useState<boolean | null>(null);

  // Load state and listen to authentications
  useEffect(() => {
    // Initial request to verify server connection (as mandated)
    const validateFirebaseConnection = async () => {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
        setFirebaseConnected(true);
      } catch (err: any) {
        if (err?.message?.includes("the client is offline")) {
          console.error("Please check your Firebase configuration.");
        }
        setFirebaseConnected(false);
      }
    };
    validateFirebaseConnection();

    // Listen to Auth State
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setUser({
              uid: firebaseUser.uid,
              email: data.email || firebaseUser.email || "",
              name: data.name || firebaseUser.displayName || "Student",
              role: data.role || "user",
              plan: data.plan || "free",
              streakCount: data.streakCount || 1,
              lastActiveAt: data.lastActiveAt?.toDate ? data.lastActiveAt.toDate().toISOString() : data.lastActiveAt || new Date().toISOString(),
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
            });
          } else {
            const newUserData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0].toUpperCase() || "NEW STUDENT",
              role: "user",
              plan: "free",
              streakCount: 1,
              lastActiveAt: new Date().toISOString(),
              createdAt: serverTimestamp(),
            };
            await setDoc(userRef, newUserData);

            setUser({
              uid: newUserData.uid,
              email: newUserData.email,
              name: newUserData.name,
              role: newUserData.role as any,
              plan: newUserData.plan as any,
              streakCount: newUserData.streakCount,
              lastActiveAt: newUserData.lastActiveAt,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error("Error setting up student profile in Firestore:", err);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || "Student",
            role: "user",
            plan: "free",
            streakCount: 1,
            lastActiveAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        // Logged out
        const cachedUser = localStorage.getItem("math_tutor_user");
        if (cachedUser) {
          const parsed = JSON.parse(cachedUser);
          if (parsed.uid.startsWith("sandbox_")) {
            setUser(parsed);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to Firestore Bookmarks & Progress for authenticated users
  useEffect(() => {
    if (!user || user.uid.startsWith("sandbox_")) {
      const cachedBms = localStorage.getItem("math_tutor_bookmarks");
      const cachedProgs = localStorage.getItem("math_tutor_progress");
      setBookmarks(cachedBms ? JSON.parse(cachedBms) : []);
      setProgress(cachedProgs ? JSON.parse(cachedProgs) : []);
      return;
    }

    const bmsPath = `users/${user.uid}/bookmarks`;
    const unsubBms = onSnapshot(collection(db, "users", user.uid, "bookmarks"), (snap) => {
      const list: BookmarkRecord[] = [];
      snap.forEach((doc) => {
        const d = doc.data();
        list.push({
          id: doc.id,
          userId: d.userId,
          title: d.title,
          category: d.category,
          itemKey: d.itemKey,
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt || new Date().toISOString()
        });
      });
      setBookmarks(list);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, bmsPath);
    });

    const proPath = `users/${user.uid}/progress`;
    const unsubPro = onSnapshot(collection(db, "users", user.uid, "progress"), (snap) => {
      const list: ProgressRecord[] = [];
      snap.forEach((doc) => {
        const d = doc.data();
        list.push({
          id: doc.id,
          userId: d.userId,
          category: d.category,
          activityName: d.activityName,
          score: d.score,
          total: d.total,
          completedAt: d.completedAt?.toDate ? d.completedAt.toDate().toISOString() : d.completedAt || new Date().toISOString()
        });
      });
      list.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
      setProgress(list);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, proPath);
    });

    return () => {
      unsubBms();
      unsubPro();
    };
  }, [user]);

  // Sync / write changes to localStorage or Firestore depending on authentication style
  const saveUserToStateAndStorage = (updatedUser: UserProfile | null) => {
    setUser(updatedUser);
    if (updatedUser) {
      if (updatedUser.uid.startsWith("sandbox_")) {
        localStorage.setItem("math_tutor_user", JSON.stringify(updatedUser));
      }
    } else {
      localStorage.removeItem("math_tutor_user");
      localStorage.removeItem("math_tutor_bookmarks");
      localStorage.removeItem("math_tutor_progress");
      setBookmarks([]);
      setProgress([]);
    }
  };

  const handleAddBookmark = async (title: string, category: string, itemKey: string) => {
    if (!user) return;
    const isAlreadyBookmarked = bookmarks.some(b => b.itemKey === itemKey && b.category === category);
    if (isAlreadyBookmarked) return;

    const docId = `bm-${Date.now()}`;
    const isSandbox = user.uid.startsWith("sandbox_");

    if (isSandbox) {
      const newBookmark: BookmarkRecord = {
        id: docId,
        userId: user.uid,
        title,
        category,
        itemKey,
        createdAt: new Date().toISOString()
      };
      const nextBookmarks = [...bookmarks, newBookmark];
      setBookmarks(nextBookmarks);
      localStorage.setItem("math_tutor_bookmarks", JSON.stringify(nextBookmarks));
    } else {
      const bookmarkPath = `users/${user.uid}/bookmarks/${docId}`;
      try {
        await setDoc(doc(db, "users", user.uid, "bookmarks", docId), {
          id: docId,
          userId: user.uid,
          title,
          category,
          itemKey,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, bookmarkPath);
      }
    }
  };

  const handleRemoveBookmark = async (id: string) => {
    if (!user) return;
    const isSandbox = user.uid.startsWith("sandbox_");

    if (isSandbox) {
      const nextBookmarks = bookmarks.filter(b => b.id !== id);
      setBookmarks(nextBookmarks);
      localStorage.setItem("math_tutor_bookmarks", JSON.stringify(nextBookmarks));
    } else {
      const bookmarkPath = `users/${user.uid}/bookmarks/${id}`;
      try {
        await deleteDoc(doc(db, "users", user.uid, "bookmarks", id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, bookmarkPath);
      }
    }
  };

  const handleLogProgress = async (category: string, activityName: string, score?: number, total?: number) => {
    if (!user) return;

    const isSandbox = user.uid.startsWith("sandbox_");
    const logId = `log-${Date.now()}`;
    const nextStreak = (user.streakCount || 1) + 1;

    const pData: any = {
      id: logId,
      userId: user.uid,
      category,
      activityName,
      completedAt: isSandbox ? new Date().toISOString() : serverTimestamp(),
    };
    if (score !== undefined) pData.score = score;
    if (total !== undefined) pData.total = total;

    if (isSandbox) {
      const nextProgress = [pData, ...progress];
      setProgress(nextProgress);
      localStorage.setItem("math_tutor_progress", JSON.stringify(nextProgress));

      const updatedUser: UserProfile = {
        ...user,
        streakCount: nextStreak,
        lastActiveAt: new Date().toISOString()
      };
      saveUserToStateAndStorage(updatedUser);
    } else {
      const progressPath = `users/${user.uid}/progress/${logId}`;
      const userPath = `users/${user.uid}`;
      try {
        await setDoc(doc(db, "users", user.uid, "progress", logId), pData);
        await updateDoc(doc(db, "users", user.uid), {
          streakCount: nextStreak,
          lastActiveAt: new Date().toISOString(),
        });
        
        setUser(prev => prev ? { ...prev, streakCount: nextStreak, lastActiveAt: new Date().toISOString() } : null);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, progressPath);
      }
    }
  };

  const handleUpgradeSubscription = async () => {
    if (!user) return;
    const isSandbox = user.uid.startsWith("sandbox_");

    if (isSandbox) {
      const updatedUser: UserProfile = {
        ...user,
        plan: "pro",
      };
      saveUserToStateAndStorage(updatedUser);
      alert("Pro Subscription upgrade completed! All high-bandwidth Gemini mathematical solvers are fully unlocked.");
    } else {
      const userPath = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, "users", user.uid), {
          plan: "pro",
        });
        setUser(prev => prev ? { ...prev, plan: "pro" } : null);
        alert("Pro Subscription upgrade completed! All high-bandwidth Gemini mathematical solvers are fully unlocked.");
      } catch (err: any) {
        console.warn("Firestore edit rejected by security rules as expected:", err);
        alert("Firestore Security correctly blocked direct client role/plan upgrades! Please use Sandbox mode to demo pro tier features offline.");
      }
    }
  };

  const handleSetAdminStatus = async () => {
    if (!user) return;
    const isSandbox = user.uid.startsWith("sandbox_");

    if (isSandbox) {
      const updatedUser: UserProfile = {
        ...user,
        role: "admin",
      };
      saveUserToStateAndStorage(updatedUser);
      alert("Admin Status upgraded! Audit tools and diagnostic panels are fully active.");
    } else {
      const userPath = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, "users", user.uid), {
          role: "admin",
        });
        setUser(prev => prev ? { ...prev, role: "admin" } : null);
        alert("Admin Status upgraded! Audit tools and diagnostic panels are fully active.");
      } catch (err: any) {
        console.warn("Firestore edit rejected by security rules as expected:", err);
        alert("Firestore Security correctly blocked direct client privilege escalation! Please use Sandbox mode to demo admin panels offline.");
      }
    }
  };

  // PDF Export formatted document download mockup
  const handleExportPdfReport = () => {
    if (!user) return;

    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      alert("Please allow popups to export printable report sheets!");
      return;
    }

    const compiledProgressHtml = progress.map(p => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-family: monospace;">${p.completedAt.split('T')[0]}</td>
        <td style="padding: 10px; font-weight: bold;">${p.category.toUpperCase()}</td>
        <td style="padding: 10px;">${p.activityName}</td>
        <td style="padding: 10px; font-weight: bold; color: #4338ca;">
          ${p.score !== undefined ? `${p.score} / ${p.total}` : "Completed Solver"}
        </td>
      </tr>
    `).join("");

    const compiledBookmarksHtml = bookmarks.map(b => `
      <li style="margin-bottom: 6px; font-size: 13.5px;">
        <strong>${b.title}</strong> - <span style="font-family: monospace;">${b.category} (${b.itemKey})</span>
      </li>
    `).join("");

    const contentHtml = `
      <html>
        <head>
          <title>AI Mathematics Student Progress Report</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 26px; font-weight: 800; color: #1e1b4b; }
            .metric-box { display: flex; gap: 20px; margin-bottom: 30px; }
            .metric { background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #f1f5f9; flex: 1; text-align: center; }
            td, th { text-align: left; padding: 10px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">AI Mathematics Performance Report</div>
            <div style="font-size: 13px; color: #4f46e5; font-weight: bold; margin-top: 4px;">Google Gemini Educational Verification</div>
          </div>

          <div class="metric-box">
            <div class="metric"><strong>Student Name:</strong><br>${user.name}</div>
            <div class="metric"><strong>Acc Registration Email:</strong><br>${user.email}</div>
            <div class="metric"><strong>Study Streak Counter:</strong><br>${user.streakCount} Consecutive days</div>
            <div class="metric"><strong>Plan Type:</strong><br>${user.plan.toUpperCase()} Tier</div>
          </div>

          <h3>Recent Homework & Quiz progress</h3>
          ${progress.length === 0 ? "<p>No study sessions recorded yet.</p>" : `
            <table>
              <thead>
                <tr style="background: #f1f5f9;">
                  <th>Date Completed</th>
                  <th>Discipline Category</th>
                  <th>Topic Description</th>
                  <th>Score Sheet</th>
                </tr>
              </thead>
              <tbody>
                ${compiledProgressHtml}
              </tbody>
            </table>
          `}

          <h3 style="margin-top: 40px;">Saved Formula & References Library</h3>
          ${bookmarks.length === 0 ? "<p>No bookmarks saved yet.</p>" : `
            <ul>
              ${compiledBookmarksHtml}
            </ul>
          `}

          <div style="margin-top: 60px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            This academic PDF export represents live client performance values secured by Gemini AI and database streams.
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;

    reportWindow.document.write(contentHtml);
    reportWindow.document.close();
  };

  const currentText = TRANSLATIONS[locale];

  // Auth Screen Guard
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <AuthScreen onAuthSuccess={(userObj) => saveUserToStateAndStorage(userObj)} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${isDarkMode ? "bg-slate-950 text-slate-100 dark" : "bg-slate-50 text-slate-800"}`}>
      {/* Dynamic Navigation Bar */}
      <nav id="app-global-nav" className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-100 dark:border-slate-800 shadow-sm px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-indigo-200 dark:shadow-none">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight leading-none block text-base">
                {currentText.heroTitle}
              </span>
              <span className="text-[10px] text-slate-400 font-bold tracking-widest block uppercase mt-0.5">Gemini Math Coach</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Quick Streak Indicator */}
            <div className="hidden sm:flex items-center gap-1 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-900/40 rounded-full text-amber-700 dark:text-amber-300 text-xs font-bold">
              <Flame className="w-4 h-4 fill-current animate-pulse text-orange-500" />
              <span>{user.streakCount} Day Streak</span>
            </div>

            {/* Language Switch */}
            <button
              onClick={() => setLocale(l => l === "en" ? "es" : "en")}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>{currentText.langToggle}</span>
            </button>

            {/* Dark Mode Switcher */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Printable Progress Report PDF */}
            <button
              onClick={handleExportPdfReport}
              className="p-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all text-center cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden md:inline">{currentText.btnPdf}</span>
            </button>

            {/* Sign Out */}
            <button
              onClick={async () => {
                if (auth.currentUser) {
                  await signOut(auth);
                }
                saveUserToStateAndStorage(null);
              }}
              className="p-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/20 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{currentText.logOut}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Banner Segment */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden" id="dashboard-hero">
          <div className="absolute right-0 bottom-0 opacity-10 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-400 to-indigo-950 w-64 h-64 rounded-full"></div>
          <div className="relative space-y-2 max-w-2xl font-sans text-left">
            <span className="text-[10px] uppercase font-black bg-indigo-500 text-indigo-50 tracking-widest px-3 py-1 rounded inline-block">
              {currentText.welcome}, {user.name} ({user.plan.toUpperCase()} Tier)
            </span>
            <h1 className="text-2xl md:text-3.5xl font-black tracking-tight leading-tight pt-1">
              {currentText.heroTitle}
            </h1>
            <p className="text-xs md:text-sm text-indigo-200 leading-relaxed font-sans font-medium">
              {currentText.heroDesc}
            </p>
          </div>
        </div>

        {/* Global Tab Switching buttons */}
        <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 gap-1" id="global-tabs-bar">
          {[
            { id: "study", label: currentText.tabStudy, icon: GraduationCap },
            { id: "references", label: currentText.tabReferences, icon: Compass },
            { id: "calculators", label: currentText.tabCalculators, icon: CalcIcon },
            { id: "profile", label: currentText.tabBento, icon: User }
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeLayoutTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveLayoutTab(tab.id as any)}
                className={`py-3 px-5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* STUDY STATION SECTION */}
        {activeLayoutTab === "study" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="study-panels-layout">
            <div className="lg:col-span-2 space-y-6">
              {/* Problem Solver */}
              <ProblemSolver onLogProgress={handleLogProgress} />
              
              {/* Quizzes and Drills */}
              <PracticeDrills onLogProgress={handleLogProgress} />
            </div>

            <div className="lg:col-span-1">
              {/* AI Chat Session */}
              <div className="sticky top-24">
                <MathTutorChat />
              </div>
            </div>
          </div>
        )}

        {/* REFERENCES SECTION */}
        {activeLayoutTab === "references" && (
          <ReferenceGuides
            onBookmarkAdd={handleAddBookmark}
            bookmarkedKeys={bookmarks.map(b => b.itemKey)}
          />
        )}

        {/* CALCULATORS SECTION */}
        {activeLayoutTab === "calculators" && (
          <Calculator />
        )}

        {/* PROFILE SECTION */}
        {activeLayoutTab === "profile" && (
          <ProfileTracker
            user={user}
            bookmarks={bookmarks}
            progress={progress}
            onRemoveBookmark={handleRemoveBookmark}
            onUpgradePlan={handleUpgradeSubscription}
            onSetDemoAdmin={handleSetAdminStatus}
          />
        )}
      </main>

      {/* Humble Footer */}
      <footer className="text-center py-10 mt-12 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
        <p className="font-sans">AI Mathematics Tutor is powered by state-of-the-art Google Gemini models.</p>
        <p className="mt-1 font-mono text-[10px]">Academic sandbox version 3.5-flash-latest</p>
      </footer>
    </div>
  );
}
