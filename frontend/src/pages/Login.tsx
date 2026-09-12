import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "firebase/auth";

import { useAuth } from "../context/AuthContext";
import { auth } from "../lib/firebase";
import heroBg from "../assets/hero-bg.jpg";

const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Invalid email or password. Check your credentials and try again.",
  "auth/user-not-found": "No account found with this email. Sign up first.",
  "auth/wrong-password": "Incorrect password. Try again or reset your password.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/email-already-in-use": "An account already exists for this email. Sign in instead.",
  "auth/weak-password": "Password is too weak. Use at least 6 characters.",
  "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  "auth/network-request-failed": "Network error. Check your internet connection and try again.",
};

function firebaseErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: string }).code);
    return FIREBASE_ERROR_MESSAGES[code] ?? "Authentication failed. Try again.";
  }
  return "Authentication failed. Try again.";
}

export function Login() {
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sign In State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up State
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirm, setSignUpConfirm] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [aboutOpen, setAboutOpen] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      setSuccessMessage("Sign in successful! Entering workspace...");
      setTimeout(() => navigate("/overview"), 700);
    } catch (caught) {
      setError(firebaseErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(signInEmail, signInPassword);
      setSuccessMessage("Sign in successful! Entering workspace...");
      setTimeout(() => navigate("/overview"), 700);
    } catch (caught) {
      setError(firebaseErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (signUpPassword !== signUpConfirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreeTerms) {
      setError("You must agree to the terms.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signUpWithEmail(signUpEmail, signUpPassword);
      if (signUpName.trim()) {
        const current = auth.currentUser;
        if (current) await updateProfile(current, { displayName: signUpName.trim() });
      }
      setSuccessMessage("Account created successfully! Preparing workspace...");
      setTimeout(() => navigate("/overview"), 700);
    } catch (caught) {
      setError(firebaseErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-3 md:p-6 lg:p-8 flex flex-col items-center justify-start bg-[#FAF7F2] text-[#1F2937] font-sans overflow-x-hidden" id="top">
      <div className="w-full max-w-[1520px] rounded-2xl shadow-xl border border-[#E5E0D8] flex flex-col relative overflow-hidden bg-white" data-purpose="desktop-app-frame">
        {/* Header */}
        <header className="w-full border-b border-[#E5E0D8] bg-white px-6 py-3.5 flex items-center justify-between z-20" data-purpose="main-navigation">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#065F46] p-1.5 flex items-center justify-center shadow-sm">
              <img alt="GridMitra Emblem" className="w-full h-full object-contain rounded filter brightness-110 invert" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDe6zcje8Xy6Lh8Cf_5B4G8D9iewA0ydS4Ma8e89CsPBfsWcxFrYImSQS_Mbu4ExqiPUgrvfVQ26vcvqBxtVFtXcVkbn_EycMfOzF4ot34BhKy_tn4Efk8Y-Bh9YJ2EsMgJoj-eBL8MEr7EZiCrxj3ZP7_f8FOaNMIEJ_gPMGEWNDJqH1bEBFcYm5y-QAxZdPvZJE4X0PjOcmqRlFqianUbQYnxq-5CDBI5exZmsnkkKqcCCdZSrILbgmQvDn8GJj7Urg"/>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold tracking-wider text-base text-neutral-900">GRIDMITRA</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-50 text-[#065F46] border border-emerald-200">v2.4 PRO</span>
                <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded bg-[#F5F1E9] text-neutral-600 border border-[#E5E0D8]">MICROGRID CORE</span>
              </div>
              <span className="text-xs text-neutral-500 font-normal">Reliability-First Energy Optimization Platform</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-600"></span>
            <span className="hidden sm:inline font-medium text-neutral-600">Operations Node Active</span>
          </div>
        </header>

        {/* Hero Section */}
        <div className="relative w-full flex flex-col justify-between bg-cover bg-center bg-no-repeat" style={{
          backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.32) 40%, rgba(6, 40, 30, 0.38) 75%, rgba(4, 30, 22, 0.48) 100%), url(${heroBg})`
        }}>
          <main className="w-full p-6 lg:p-8 grid grid-cols-12 gap-8 items-center z-10 min-h-[640px]">
            {/* Left Auth Panel */}
            <section className="col-span-12 lg:col-span-5 xl:col-span-5 flex flex-col justify-center">
              <div className="bg-white text-neutral-900 rounded-2xl p-6 lg:p-7 shadow-xl shadow-neutral-900/10 border border-[#E5E0D8] flex flex-col gap-3.5 transition-all">
                <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full bg-[#E6F4EA] border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#065F46]"></span>
                  <span className="text-[11px] font-semibold text-[#065F46] tracking-wide uppercase">GRIDMITRA ACCOUNT</span>
                </div>
                
                <div>
                  <h1 className="text-2xl font-display font-bold leading-tight text-neutral-900">
                    {activeTab === "signin" ? "Welcome back" : "Create your account"}
                  </h1>
                  <p className="text-xs text-neutral-600 leading-relaxed mt-0.5">
                    {activeTab === "signin" ? "Sign in to continue to your GridMitra workspace." : "Set up your account to access the microgrid workspace."}
                  </p>
                </div>

                {/* Tab Switcher */}
                <div className="p-1 bg-[#F5F1E9] rounded-xl flex items-center border border-[#E5E0D8]">
                  <button 
                    type="button"
                    onClick={() => { setActiveTab("signin"); setSuccessMessage(null); setError(null); }}
                    className={`flex-1 py-1.5 text-xs rounded-lg shadow-sm transition-all duration-150 ${activeTab === "signin" ? "bg-[#065F46] text-white font-semibold" : "bg-transparent text-neutral-700 hover:text-neutral-900 font-medium"}`}>
                    Sign In
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setActiveTab("signup"); setSuccessMessage(null); setError(null); }}
                    className={`flex-1 py-1.5 text-xs rounded-lg shadow-sm transition-all duration-150 ${activeTab === "signup" ? "bg-[#065F46] text-white font-semibold" : "bg-transparent text-neutral-700 hover:text-neutral-900 font-medium"}`}>
                    Sign Up
                  </button>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-[#065F46] text-xs font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-[#065F46]">check_circle</span>
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Sign In Form */}
                {activeTab === "signin" && (
                  <form className="flex flex-col gap-3" onSubmit={handleSignIn}>
                    <button
                      type="button"
                      onClick={() => void handleGoogle()}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white border border-[#E5E0D8] hover:bg-[#F5F1E9] transition-colors text-neutral-700 font-medium text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <span className="text-sm">G</span>
                      <span>Continue with Google</span>
                    </button>
                    <div className="flex items-center gap-3 my-0.5">
                      <div className="h-px flex-1 bg-[#E5E0D8]" />
                      <span className="text-[10px] font-mono uppercase text-neutral-500">or</span>
                      <div className="h-px flex-1 bg-[#E5E0D8]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-neutral-700 uppercase tracking-wider block">Email Address</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="operator@gridmitra.org"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#E5E0D8] focus:outline-none focus:border-[#065F46] focus:ring-1 focus:ring-[#065F46] text-neutral-800 placeholder-neutral-400 bg-white"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-neutral-700 uppercase tracking-wider block">Password</label>
                      <div className="relative flex items-center">
                        <input 
                          type={showPassword ? "text" : "password"}
                          required 
                          placeholder="Enter password"
                          className="w-full text-xs px-3 py-2 pr-9 rounded-lg border border-[#E5E0D8] focus:outline-none focus:border-[#065F46] focus:ring-1 focus:ring-[#065F46] text-neutral-800 placeholder-neutral-400 bg-white"
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 text-neutral-400 hover:text-neutral-600">
                          <span className="material-symbols-outlined text-base">{showPassword ? "visibility_off" : "visibility"}</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-600 pt-0.5">
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input type="checkbox" defaultChecked className="rounded border-[#E5E0D8] text-[#065F46] focus:ring-[#065F46] h-3.5 w-3.5" />
                        <span>Remember me</span>
                      </label>
                      <button type="button" onClick={() => alert("Password reset function not implemented in demo")} className="font-medium text-[#065F46] hover:text-[#047857] hover:underline">
                        Forgot password?
                      </button>
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full mt-1 py-3 px-4 rounded-xl bg-[#065F46] hover:bg-[#047857] active:scale-[0.99] text-white font-medium text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed">
                      <span>{loading ? "Signing in..." : "Sign In"}</span>
                      {!loading && <span className="text-emerald-200">→</span>}
                    </button>
                  </form>
                )}

                {/* Sign Up Form */}
                {activeTab === "signup" && (
                  <form className="flex flex-col gap-2.5" onSubmit={handleSignUp}>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-neutral-700 uppercase tracking-wider block">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Dr. Ananya Sharma"
                        className="w-full text-xs px-3 py-1.5 rounded-lg border border-[#E5E0D8] focus:outline-none focus:border-[#065F46] focus:ring-1 focus:ring-[#065F46] text-neutral-800 placeholder-neutral-400 bg-white"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-neutral-700 uppercase tracking-wider block">Email Address</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="operator@gridmitra.org"
                        className="w-full text-xs px-3 py-1.5 rounded-lg border border-[#E5E0D8] focus:outline-none focus:border-[#065F46] focus:ring-1 focus:ring-[#065F46] text-neutral-800 placeholder-neutral-400 bg-white"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-neutral-700 uppercase tracking-wider block">Password</label>
                        <div className="relative flex items-center">
                          <input 
                            type={showSignupPassword ? "text" : "password"}
                            required 
                            placeholder="Create password"
                            className="w-full text-xs px-3 py-1.5 pr-8 rounded-lg border border-[#E5E0D8] focus:outline-none focus:border-[#065F46] focus:ring-1 focus:ring-[#065F46] text-neutral-800 placeholder-neutral-400 bg-white"
                            value={signUpPassword}
                            onChange={(e) => setSignUpPassword(e.target.value)}
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                            className="absolute right-2 text-neutral-400 hover:text-neutral-600">
                            <span className="material-symbols-outlined text-[15px]">{showSignupPassword ? "visibility_off" : "visibility"}</span>
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-neutral-700 uppercase tracking-wider block">Confirm</label>
                        <input 
                          type="password"
                          required 
                          placeholder="Confirm password"
                          className="w-full text-xs px-3 py-1.5 rounded-lg border border-[#E5E0D8] focus:outline-none focus:border-[#065F46] focus:ring-1 focus:ring-[#065F46] text-neutral-800 placeholder-neutral-400 bg-white"
                          value={signUpConfirm}
                          onChange={(e) => setSignUpConfirm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex items-start gap-2 pt-1">
                      <input 
                        type="checkbox" 
                        id="signup-terms" 
                        required 
                        className="rounded border-[#E5E0D8] text-[#065F46] focus:ring-[#065F46] h-3.5 w-3.5 mt-0.5"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                      />
                      <label htmlFor="signup-terms" className="text-[11px] text-neutral-600 leading-snug cursor-pointer">
                        I agree to the GridMitra terms and privacy policy.
                      </label>
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full mt-1.5 py-3 px-4 rounded-xl bg-[#065F46] hover:bg-[#047857] active:scale-[0.99] text-white font-medium text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed">
                      <span>{loading ? "Creating..." : "Create Account"}</span>
                      {!loading && <span className="text-emerald-200">→</span>}
                    </button>
                    <div className="text-center text-[11px] text-neutral-500 pt-0.5">
                        Already have an account? <button type="button" onClick={() => setActiveTab("signin")} className="font-semibold text-[#065F46] hover:underline">Sign In</button>
                    </div>
                  </form>
                )}
                <div className="pt-2 border-t border-[#E5E0D8] text-[10px] text-neutral-500 leading-snug">
                  By continuing, you agree to the GridMitra terms and privacy policy.
                </div>
              </div>
            </section>

            {/* Right Showcase */}
            <section className="col-span-12 lg:col-span-7 xl:col-span-7 flex flex-col justify-center space-y-6 lg:pl-4">
              <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-white/95 border border-[#E5E0D8] backdrop-blur-sm shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#065F46]"></span>
                <span className="text-xs font-semibold text-[#065F46] tracking-wide">24-Hour Lookahead Optimization</span>
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-white leading-tight tracking-tight drop-shadow-md">
                  Know what your microgrid<br/>
                  needs before the demand<br/>
                  arrives.
                </h2>
                <p className="text-xs lg:text-sm text-neutral-100 max-w-xl leading-relaxed font-medium drop-shadow-md">
                  Forecast renewable generation, protect critical community services, and choose the most efficient energy mix across changing weather and tariffs.
                </p>
              </div>

              {/* Energy Flow */}
              <div className="space-y-2 pt-2">
                <div className="text-[10px] uppercase font-bold tracking-widest text-white/95 drop-shadow-md flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  DYNAMIC MULTI-SOURCE DISPATCH ARCHITECTURE
                </div>
                <div className="grid grid-cols-5 gap-2.5">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2.5 flex flex-col items-center justify-center text-center border-t-2 border-t-[#D97706] border-x border-b border-[#E5E0D8] shadow-sm">
                    <span className="text-[9px] uppercase font-bold text-[#D97706]">SOLAR</span>
                    <span className="text-[10px] font-medium text-neutral-700">Primary PV</span>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2.5 flex flex-col items-center justify-center text-center border-t-2 border-t-[#0D9488] border-x border-b border-[#E5E0D8] shadow-sm">
                    <span className="text-[9px] uppercase font-bold text-[#0D9488]">WIND</span>
                    <span className="text-[10px] font-medium text-neutral-700">Turbine Base</span>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2.5 flex flex-col items-center justify-center text-center border-t-2 border-t-[#2563EB] border-x border-b border-[#E5E0D8] shadow-sm">
                    <span className="text-[9px] uppercase font-bold text-[#2563EB]">BATTERY</span>
                    <span className="text-[10px] font-medium text-neutral-700">BESS Buffer</span>
                  </div>
                  <div className="bg-gradient-to-b from-[#065F46] to-[#047857] border-2 border-emerald-300 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-lg scale-105">
                    <span className="text-[9px] uppercase font-extrabold tracking-wide text-white">COMMUNITY</span>
                    <span className="text-[10px] font-medium text-emerald-100">P1 Critical Load</span>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2.5 flex flex-col items-center justify-center text-center border-t-2 border-t-[#EA580C] border-x border-b border-[#E5E0D8] shadow-sm">
                    <span className="text-[9px] uppercase font-bold text-[#EA580C]">DIESEL</span>
                    <span className="text-[10px] font-medium text-neutral-700">Emergency AUX</span>
                  </div>
                </div>
              </div>

              {/* Lower Cards */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3.5 border-l-4 border-l-[#065F46] border-y border-r border-[#E5E0D8] shadow-sm">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#065F46] mb-1">RELIABILITY-FIRST</h4>
                  <p className="text-[11px] text-neutral-700 leading-snug">Prioritizes medical clinics, water pumps, and essential services.</p>
                </div>
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3.5 border-l-4 border-l-amber-600 border-y border-r border-[#E5E0D8] shadow-sm">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">COST-AWARE</h4>
                  <p className="text-[11px] text-neutral-700 leading-snug">Dispatches diesel only when renewable limits and storage constraints require it.</p>
                </div>
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3.5 border-l-4 border-l-[#0D9488] border-y border-r border-[#E5E0D8] shadow-sm">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#0D9488] mb-1">CARBON-AWARE</h4>
                  <p className="text-[11px] text-neutral-700 leading-snug">Maximizes clean solar and wind utilization to reduce avoidable emissions.</p>
                </div>
              </div>
            </section>
          </main>

          <div className="w-full pb-4 px-6 flex justify-center z-10">
            <button 
              type="button"
              onClick={() => {
                setAboutOpen(!aboutOpen);
                if (!aboutOpen) {
                  setTimeout(() => document.getElementById("about")?.scrollIntoView({ behavior: 'smooth' }), 50);
                }
              }}
              className="bg-white/95 hover:bg-white border border-[#E5E0D8] text-neutral-800 shadow-sm rounded-full px-6 py-2 flex items-center gap-2 cursor-pointer transition-all duration-200 group hover:border-[#065F46]">
              <span className="text-xs font-semibold text-neutral-800 group-hover:text-[#065F46]">About GridMitra</span>
              <span className={`material-symbols-outlined text-base text-neutral-600 group-hover:text-[#065F46] transition-transform duration-300 ${aboutOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
          </div>
        </div>

        {/* About Section */}
        {aboutOpen && (
          <section id="about" className="w-full bg-[#FAF7F2] border-t border-[#E5E0D8] p-8 lg:p-12 text-neutral-900 shadow-inner transition-all duration-500">
            <div className="max-w-[1400px] mx-auto">
              <div className="max-w-3xl mb-10 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4EA] border border-emerald-200 text-[#065F46] text-xs font-semibold uppercase tracking-wider">
                  ABOUT GRIDMITRA
                </div>
                <h2 className="text-2xl lg:text-4xl font-display font-bold text-neutral-900 tracking-tight leading-tight">
                  Smarter energy for communities that can't afford uncertainty.
                </h2>
                <p className="text-sm lg:text-base text-neutral-600 leading-relaxed">
                  GridMitra helps off-grid communities plan how solar, wind, battery storage and diesel backup should work together across the next 24 hours.
                </p>
              </div>

              <div className="mb-12 rounded-xl p-6 bg-[#F5F1E9] border border-[#E5E0D8]">
                <h3 className="text-xs uppercase font-bold tracking-widest text-[#065F46] mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">warning</span> THE CHALLENGE
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed max-w-4xl">
                  Off-grid communities often combine renewable energy with battery storage and diesel backup. Renewable generation changes with weather and time, demand changes throughout the day, and fuel costs can make backup generation expensive.
                </p>
              </div>

              <div className="mb-12 space-y-4">
                <h3 className="text-xs uppercase font-bold tracking-widest text-[#065F46] flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">alt_route</span> HOW GRIDMITRA WORKS
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { num: "01", title: "Forecast", desc: "Predict solar, wind, and demand across rolling 24-hour windows." },
                    { num: "02", title: "Prioritize", desc: "Protect critical loads, clinics, and clean water supplies first." },
                    { num: "03", title: "Optimize", desc: "Calculate the best dispatch plan for each hour." },
                    { num: "04", title: "Explain", desc: "Show why important generation and battery decisions were made." },
                    { num: "05", title: "Compare", desc: "Evaluate cost, emissions, and reliability trade-offs against reactive operation." }
                  ].map(step => (
                    <div key={step.num} className="bg-white rounded-xl p-4 border border-[#E5E0D8] shadow-sm hover:border-[#065F46]/60 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-[#FAF7F2] border border-[#E5E0D8] text-[#065F46] font-bold text-xs flex items-center justify-center mb-3">{step.num}</div>
                      <h4 className="text-sm font-semibold text-neutral-900 mb-1">{step.title}</h4>
                      <p className="text-xs text-neutral-600 leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-12 space-y-4">
                <h3 className="text-xs uppercase font-bold tracking-widest text-[#065F46] flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">hub</span> BALANCED ENERGY MIX
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-white border-t-4 border-t-[#D97706] border-x border-b border-[#E5E0D8] shadow-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#D97706]">Solar PV</span>
                    <p className="text-xs text-neutral-600 mt-1">Zero marginal cost daylight generation prioritized for direct load coverage and charging.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white border-t-4 border-t-[#0D9488] border-x border-b border-[#E5E0D8] shadow-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">Wind Turbine</span>
                    <p className="text-xs text-neutral-600 mt-1">Complementary nocturnal and seasonal generation buffering evening power demand.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white border-t-4 border-t-[#2563EB] border-x border-b border-[#E5E0D8] shadow-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">Battery Storage</span>
                    <p className="text-xs text-neutral-600 mt-1">Smart state-of-charge management preventing unnecessary deep discharge cycles.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white border-t-4 border-t-[#EA580C] border-x border-b border-[#E5E0D8] shadow-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">Diesel Backup</span>
                    <p className="text-xs text-neutral-600 mt-1">Last-resort automated reserve ensuring 100% critical uptime during prolonged deficits.</p>
                  </div>
                </div>
              </div>

              <div className="mb-12 space-y-4">
                <h3 className="text-xs uppercase font-bold tracking-widest text-[#065F46] flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">verified</span> WHY GRIDMITRA
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-white border-l-4 border-l-[#065F46] border-y border-r border-[#E5E0D8] shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#065F46] mb-1">Reliability-First</h4>
                    <p className="text-xs text-neutral-600 leading-relaxed">Protect critical community services before flexible loads during supply constraints.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white border-l-4 border-l-amber-600 border-y border-r border-[#E5E0D8] shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">Cost-Aware</h4>
                    <p className="text-xs text-neutral-600 leading-relaxed">Reduce unnecessary dependence on diesel generation.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white border-l-4 border-l-[#0D9488] border-y border-r border-[#E5E0D8] shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D9488] mb-1">Carbon-Aware</h4>
                    <p className="text-xs text-neutral-600 leading-relaxed">Increase intelligent use of renewable energy and reduce avoidable emissions.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white border-l-4 border-l-indigo-600 border-y border-r border-[#E5E0D8] shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1">Explainable</h4>
                    <p className="text-xs text-neutral-600 leading-relaxed">Show why important dispatch decisions were made.</p>
                  </div>
                </div>
              </div>

              <div className="mb-10 p-4 rounded-xl bg-[#F5F1E9] border border-[#E5E0D8] flex flex-wrap items-center justify-between gap-2.5 text-xs text-neutral-700">
                <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#065F46]">memory</span> Engine Capabilities:
                </span>
                <div className="flex flex-wrap gap-2">
                  {["24-Hour Optimization", "Priority-Aware Dispatch", "Battery Reserve Protection", "Baseline Comparison", "Rule-Based Explainability"].map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded bg-white border border-[#E5E0D8] font-medium text-neutral-700">{tag}</span>
                  ))}
                  <span className="px-2.5 py-1 rounded bg-white border border-[#E5E0D8] font-medium text-[#065F46]">Decision Support — Not Direct Control</span>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E5E0D8] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="material-symbols-outlined text-base text-neutral-500">info</span>
                  <span>GridMitra is a decision-support platform. Recommended dispatch plans remain subject to operator review and do not directly control physical equipment.</span>
                </div>
                <button type="button" onClick={() => { setAboutOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-[#065F46] font-medium transition-colors bg-transparent border-0 cursor-pointer p-0">
                  <span>Close section</span>
                  <span>↑</span>
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
