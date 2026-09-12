import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { demoLogin, login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    void login(email, password).catch(() => undefined);
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface-container-low border border-outline-variant rounded-xl p-8 shadow-sm">
        <div className="w-12 h-12 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold mx-auto mb-4 shadow-sm">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
        </div>
        <h1 className="text-2xl font-bold text-primary tracking-tight text-center mb-1">GridMitra</h1>
        <p className="text-center text-body-md text-secondary mb-6">
          Sign in to open your microgrid workspace. Offline-ready — no internet required.
        </p>

        <button
          onClick={() => void demoLogin().catch(() => undefined)}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary py-3 px-4 rounded-lg text-body-md font-semibold transition-colors shadow-sm disabled:opacity-60 mb-4"
        >
          <span className="material-symbols-outlined text-[18px]">location_on</span>
          {loading ? "Signing in…" : "One-click demo sign-in"}
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-outline-variant" />
          <span className="text-[10px] font-mono uppercase text-secondary">or</span>
          <div className="h-px flex-1 bg-outline-variant" />
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-mono text-secondary uppercase text-[10px] font-semibold">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:ring-1 focus:ring-primary"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-mono text-secondary uppercase text-[10px] font-semibold">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
              className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:ring-1 focus:ring-primary"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary-container text-on-primary text-sm font-semibold rounded-lg hover:bg-primary transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-xs text-error bg-error/10 border border-error/30 rounded-lg p-3">{error}</p>
        )}
      </div>
    </div>
  );
}