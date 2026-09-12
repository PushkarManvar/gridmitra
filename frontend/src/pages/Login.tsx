import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "firebase/auth";

import { useAuth } from "../context/AuthContext";
import heroBg from "../assets/hero-bg.jpg";
import { auth } from "../lib/firebase";

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

const fieldClass = "w-full rounded-lg border border-[#D7E1DC] bg-white px-3 py-2.5 text-sm text-[#19342E] outline-none transition placeholder:text-[#91A19B] focus:border-[#0D5748] focus:ring-2 focus:ring-[#0D5748]/15";
const fieldLabelClass = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#52605D]";

export function Login() {
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirm, setSignUpConfirm] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const switchTab = (tab: "signin" | "signup") => {
    setActiveTab(tab);
    setError(null);
    setSuccessMessage(null);
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      setSuccessMessage("Sign in successful. Opening your workspace…");
      setTimeout(() => navigate("/overview"), 700);
    } catch (caught) {
      setError(firebaseErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(signInEmail, signInPassword);
      setSuccessMessage("Sign in successful. Opening your workspace…");
      setTimeout(() => navigate("/overview"), 700);
    } catch (caught) {
      setError(firebaseErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (event: FormEvent) => {
    event.preventDefault();
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
      if (signUpName.trim() && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: signUpName.trim() });
      }
      setSuccessMessage("Account created. Opening your workspace…");
      setTimeout(() => navigate("/overview"), 700);
    } catch (caught) {
      setError(firebaseErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F6F4] text-[#19342E] lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <section className="flex min-h-screen flex-col bg-[#FCFDFB]">
        <header className="flex items-center justify-between border-b border-[#DCE6E1] px-6 py-5 lg:px-10">
          <button type="button" onClick={() => navigate("/")} className="flex items-center gap-3 text-left">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#0D5748] text-lg font-bold text-white shadow-sm">ϟ</span>
            <span className="text-sm font-bold tracking-[0.08em] text-[#173E35]">GRIDMITRA</span>
          </button>
          <button type="button" onClick={() => navigate("/about")} className="text-xs font-medium text-[#52605D] transition hover:text-[#0D5748] hover:underline">About</button>
        </header>

        <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:py-16">
          <div className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0D5748]">Operator access</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#19342E]">{activeTab === "signin" ? "Sign in to GridMitra" : "Create your workspace account"}</h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#5C6B66]">
              {activeTab === "signin" ? "Access saved scenarios, dispatch plans, and historical decisions." : "Create an account to start planning your next operating day."}
            </p>
          </div>

          <div className="mb-7 flex border-b border-[#DCE6E1]" role="tablist" aria-label="Account access">
            <button type="button" role="tab" aria-selected={activeTab === "signin"} onClick={() => switchTab("signin")} className={`-mb-px border-b-2 px-1 pb-3 pr-5 text-sm font-semibold transition ${activeTab === "signin" ? "border-[#0D5748] text-[#0D5748]" : "border-transparent text-[#7A8984] hover:text-[#19342E]"}`}>Sign in</button>
            <button type="button" role="tab" aria-selected={activeTab === "signup"} onClick={() => switchTab("signup")} className={`-mb-px border-b-2 px-1 pb-3 pl-5 text-sm font-semibold transition ${activeTab === "signup" ? "border-[#0D5748] text-[#0D5748]" : "border-transparent text-[#7A8984] hover:text-[#19342E]"}`}>Create account</button>
          </div>

          {error && <div className="mb-5 rounded-lg border border-[#F1C7C2] bg-[#FFF5F3] px-3 py-2.5 text-sm text-[#A33124]">{error}</div>}
          {successMessage && <div className="mb-5 rounded-lg border border-[#B8DCC9] bg-[#F1FBF5] px-3 py-2.5 text-sm text-[#17633F]">{successMessage}</div>}

          {activeTab === "signin" ? (
            <form className="space-y-5" onSubmit={handleSignIn}>
              <button type="button" onClick={() => void handleGoogle()} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#C9D6D0] bg-white px-4 py-3 text-sm font-semibold text-[#2E4540] transition hover:border-[#91AAA1] hover:bg-[#F6F9F7] disabled:cursor-not-allowed disabled:opacity-60">
                <span className="grid h-5 w-5 place-items-center rounded-full border border-[#DCE6E1] text-xs font-bold text-[#4285F4]">G</span>
                Continue with Google
              </button>
              <div className="flex items-center gap-3" aria-hidden="true"><span className="h-px flex-1 bg-[#DCE6E1]" /><span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#8A9893]">or</span><span className="h-px flex-1 bg-[#DCE6E1]" /></div>
              <div>
                <label className={fieldLabelClass} htmlFor="signin-email">Email address</label>
                <input id="signin-email" type="email" required autoComplete="email" placeholder="you@example.com" className={fieldClass} value={signInEmail} onChange={(event) => setSignInEmail(event.target.value)} />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between"><label className={fieldLabelClass.replace("mb-1.5 ", "mb-0 ")} htmlFor="signin-password">Password</label><button type="button" className="text-xs font-semibold text-[#0D5748] hover:underline">Forgot password?</button></div>
                <div className="relative">
                  <input id="signin-password" type={showPassword ? "text" : "password"} required autoComplete="current-password" placeholder="Enter your password" className={`${fieldClass} pr-11`} value={signInPassword} onChange={(event) => setSignInPassword(event.target.value)} />
                  <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)} className="absolute inset-y-0 right-0 px-3 text-[#6C7B76] hover:text-[#0D5748]"><span className="material-symbols-outlined text-[19px]">{showPassword ? "visibility_off" : "visibility"}</span></button>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-[#52605D]"><input type="checkbox" className="h-4 w-4 rounded border-[#B9CBC3] text-[#0D5748] focus:ring-[#0D5748]" />Keep me signed in on this device</label>
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center rounded-lg bg-[#0D5748] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#09483C] focus:outline-none focus:ring-2 focus:ring-[#0D5748] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Signing in…" : "Sign in"}</button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleSignUp}>
              <div><label className={fieldLabelClass} htmlFor="signup-name">Name</label><input id="signup-name" type="text" autoComplete="name" placeholder="Your name" className={fieldClass} value={signUpName} onChange={(event) => setSignUpName(event.target.value)} /></div>
              <div><label className={fieldLabelClass} htmlFor="signup-email">Email address</label><input id="signup-email" type="email" required autoComplete="email" placeholder="you@example.com" className={fieldClass} value={signUpEmail} onChange={(event) => setSignUpEmail(event.target.value)} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={fieldLabelClass} htmlFor="signup-password">Password</label><div className="relative"><input id="signup-password" type={showSignupPassword ? "text" : "password"} required autoComplete="new-password" placeholder="6+ characters" className={`${fieldClass} pr-10`} value={signUpPassword} onChange={(event) => setSignUpPassword(event.target.value)} /><button type="button" aria-label={showSignupPassword ? "Hide password" : "Show password"} onClick={() => setShowSignupPassword((visible) => !visible)} className="absolute inset-y-0 right-0 px-3 text-[#6C7B76] hover:text-[#0D5748]"><span className="material-symbols-outlined text-[18px]">{showSignupPassword ? "visibility_off" : "visibility"}</span></button></div></div>
                <div><label className={fieldLabelClass} htmlFor="signup-confirm">Confirm password</label><input id="signup-confirm" type="password" required autoComplete="new-password" placeholder="Repeat password" className={fieldClass} value={signUpConfirm} onChange={(event) => setSignUpConfirm(event.target.value)} /></div>
              </div>
              <label className="flex items-start gap-2 pt-1 text-sm leading-5 text-[#52605D]"><input type="checkbox" required checked={agreeTerms} onChange={(event) => setAgreeTerms(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-[#B9CBC3] text-[#0D5748] focus:ring-[#0D5748]" />I agree to the GridMitra terms and privacy policy.</label>
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center rounded-lg bg-[#0D5748] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#09483C] focus:outline-none focus:ring-2 focus:ring-[#0D5748] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Creating account…" : "Create account"}</button>
            </form>
          )}

          <p className="mt-8 border-t border-[#E5ECE8] pt-5 text-xs leading-5 text-[#788781]">GridMitra provides decision support. Operators review and approve every dispatch plan.</p>
        </main>
      </section>

      <aside className="relative hidden min-h-screen overflow-hidden bg-[#0B3029] lg:flex lg:flex-col" aria-label="GridMitra planning overview">
        <img src={heroBg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-[linear-gradient(150deg,rgba(7,42,35,0.94),rgba(9,62,51,0.80)_58%,rgba(7,31,27,0.94))]" />
        <div className="relative z-10 flex h-full flex-col p-10 xl:p-14">
          <div className="flex items-center gap-3 text-white/75"><span className="h-px w-8 bg-[#9FD0BC]" /><span className="text-[11px] font-semibold uppercase tracking-[0.16em]">24-hour operating plan</span></div>
          <div className="my-auto max-w-xl">
            <h2 className="text-4xl font-bold leading-[1.1] tracking-tight text-white xl:text-5xl">A clearer plan for every operating day.</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#D0E0D9]">Bring expected generation, demand, storage limits, and critical-load priorities into one dispatch plan before the shift begins.</p>
            <figure className="mt-12 border border-white/20 bg-[#0A2823]/65 p-6 backdrop-blur-sm">
              <figcaption className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-[#B6D5C7]"><span>Planning horizon</span><span className="font-mono font-medium tracking-normal text-white/65">00:00 → 24:00</span></figcaption>
              <div className="relative mt-8 border-t border-white/35"><span className="absolute -top-1.5 left-0 h-3 w-px bg-[#D2E9DD]" /><span className="absolute -top-1.5 left-1/4 h-3 w-px bg-[#D2E9DD]" /><span className="absolute -top-1.5 left-1/2 h-3 w-px bg-[#D2E9DD]" /><span className="absolute -top-1.5 left-3/4 h-3 w-px bg-[#D2E9DD]" /><span className="absolute -top-1.5 right-0 h-3 w-px bg-[#D2E9DD]" /></div>
              <div className="mt-3 grid grid-cols-4 gap-2 text-[11px] leading-4 text-[#E1EEE8]"><div><span className="block font-mono text-[#A8CDBD]">00–06</span>Reserve check</div><div><span className="block font-mono text-[#F4C97B]">06–14</span>Solar window</div><div><span className="block font-mono text-[#A8CDBD]">14–20</span>Demand handoff</div><div><span className="block font-mono text-[#8DB8ED]">20–24</span>Battery reserve</div></div>
            </figure>
          </div>
          <div className="flex items-center gap-3 border-t border-white/15 pt-6 text-xs text-[#B6D5C7]"><span className="h-2 w-2 rounded-full bg-[#91D1AE]" />Decision support only — operators stay in control.</div>
        </div>
      </aside>
    </div>
  );
}
