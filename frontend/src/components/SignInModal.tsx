import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function SignInModal({ onClose }: { onClose: () => void }) {
  const { signInWithGoogle, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      onClose();
    } catch {
      setError("Google sign-in failed. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      onClose();
    } catch {
      setError("Email sign-in failed. Check the credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-on-surface">Sign in to GridMitra</h2>
          <button onClick={onClose} className="text-secondary hover:text-on-surface" aria-label="Close">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <p className="text-xs text-secondary mb-4">
          Optional — the demo works without signing in. Signing in saves your runs and scenarios under your account.
        </p>

        <button
          onClick={() => void handleGoogle()}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-sm font-semibold hover:bg-surface-container transition-colors disabled:opacity-60"
        >
          <span className="text-base">G</span>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px flex-1 bg-outline-variant" />
          <span className="text-[10px] font-mono uppercase text-secondary">or</span>
          <div className="h-px flex-1 bg-outline-variant" />
        </div>

        <form onSubmit={handleEmail} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            required
            className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:ring-1 focus:ring-primary"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            required
            className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-on-primary text-sm font-semibold rounded-lg hover:bg-primary-container transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in with email"}
          </button>
        </form>

        {error && (
          <p className="mt-3 text-xs text-error bg-error/10 border border-error/30 rounded-lg p-2.5">{error}</p>
        )}
      </div>
    </div>
  );
}