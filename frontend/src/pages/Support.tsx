export function Support() {
  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex flex-col gap-1">
        <h1 className="text-headline-md font-headline-md text-primary tracking-tight">Support Center</h1>
        <p className="text-body-md text-secondary">
          Need help? Reach out to the GridMitra team or check our troubleshooting guides.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">contact_support</span>
            Contact Support
          </h3>
          <p className="text-sm text-secondary">
            Our engineering team is available 24/7 for critical deployment issues.
          </p>
          <form className="flex flex-col gap-3 mt-2" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-secondary">Subject</label>
              <input type="text" className="px-3 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:ring-1 focus:ring-primary outline-none" placeholder="How can we help?" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-secondary">Message</label>
              <textarea className="px-3 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:ring-1 focus:ring-primary outline-none min-h-[120px]" placeholder="Describe the issue you're facing..."></textarea>
            </div>
            <button className="mt-2 bg-primary hover:bg-primary-container text-on-primary py-2 px-4 rounded-lg text-sm font-semibold transition-colors self-start">
              Submit Ticket
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:border-primary/50 transition-colors cursor-pointer">
            <h4 className="font-semibold text-on-surface mb-1 text-sm">System Status</h4>
            <p className="text-xs text-secondary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              All systems operational
            </p>
          </div>
          
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:border-primary/50 transition-colors cursor-pointer">
            <h4 className="font-semibold text-on-surface mb-1 text-sm">Community Forum</h4>
            <p className="text-xs text-secondary">
              Discuss optimization strategies and share custom configurations with other microgrid operators.
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:border-primary/50 transition-colors cursor-pointer">
            <h4 className="font-semibold text-on-surface mb-1 text-sm">Troubleshooting Guide</h4>
            <p className="text-xs text-secondary">
              Common issues with CBC solver integrations, weather data fetching, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
