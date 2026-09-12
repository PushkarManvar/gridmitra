export function Settings() {
  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex flex-col gap-1">
        <h1 className="text-headline-md font-headline-md text-primary tracking-tight">Settings</h1>
        <p className="text-body-md text-secondary">
          Manage your account, display preferences, and integration settings.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0">
          <button className="px-4 py-2 text-left text-sm font-semibold text-primary bg-primary/10 rounded-lg">General</button>
          <button className="px-4 py-2 text-left text-sm font-medium text-secondary hover:bg-surface-container-low rounded-lg transition-colors">Notifications</button>
          <button className="px-4 py-2 text-left text-sm font-medium text-secondary hover:bg-surface-container-low rounded-lg transition-colors">Security</button>
          <button className="px-4 py-2 text-left text-sm font-medium text-secondary hover:bg-surface-container-low rounded-lg transition-colors">Integrations</button>
        </div>

        <div className="flex-1 flex flex-col gap-6 max-w-2xl">
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-4">Profile Information</h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-secondary">Full Name</label>
                <input type="text" className="px-3 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:ring-1 focus:ring-primary outline-none" defaultValue="Operator User" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-secondary">Email Address</label>
                <input type="email" className="px-3 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:ring-1 focus:ring-primary outline-none" defaultValue="operator@gridmitra.org" readOnly />
              </div>
              <button className="mt-2 bg-primary hover:bg-primary-container text-on-primary py-2 px-4 rounded-lg text-sm font-semibold transition-colors self-start">
                Save Changes
              </button>
            </div>
          </section>

          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-4">Application Preferences</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-on-surface">Dark Mode</h4>
                  <p className="text-xs text-secondary">Adjust the interface color scheme.</p>
                </div>
                <button className="w-11 h-6 bg-outline-variant rounded-full relative">
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                </button>
              </div>
              <div className="h-px bg-outline-variant/50 w-full"></div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-on-surface">Metric Units</h4>
                  <p className="text-xs text-secondary">Use standard SI units for energy (kWh, kW).</p>
                </div>
                <button className="w-11 h-6 bg-primary rounded-full relative">
                  <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
