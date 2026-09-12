import { useAuth } from "../context/AuthContext";

export function Settings() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-surface-container-lowest">
      <main className="max-w-[900px] mx-auto p-8 flex flex-col gap-5">
        <div className="pb-1 border-b border-secondary-fixed">
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Settings</h1>
          <p className="text-xs text-secondary">Your account and preferences.</p>
        </div>

        {user && (
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
            <h2 className="text-base font-bold text-on-surface">Profile</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono uppercase text-secondary font-semibold">Display name</span>
                <span className="font-medium text-on-surface">{user.displayName ?? "—"}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono uppercase text-secondary font-semibold">Email</span>
                <span className="font-medium text-on-surface">{user.email ?? "—"}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono uppercase text-secondary font-semibold">UID</span>
                <span className="font-mono text-xs text-secondary">{user.uid.slice(0, 12)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono uppercase text-secondary font-semibold">Provider</span>
                <span className="font-medium text-on-surface">
                  {user.providerData?.[0]?.providerId ?? "firebase"}
                </span>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-outline-variant">
              <button
                onClick={() => void signOut()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface-container-low border border-outline-variant text-xs font-semibold rounded-lg hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign out</span>
              </button>
            </div>
          </section>
        )}

        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
          <h2 className="text-base font-bold text-on-surface">About the prototype</h2>
          <p className="mt-2 text-sm text-secondary leading-relaxed">
            GridMitra recommends an hourly dispatch plan over the next 24 hours. Results are simulated
            estimates for the selected scenario — not field measurements, and the app does not control
            physical equipment.
          </p>
        </section>
      </main>
    </div>
  );
}