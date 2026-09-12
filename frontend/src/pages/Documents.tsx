export function Documents() {
  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex flex-col gap-1">
        <h1 className="text-headline-md font-headline-md text-primary tracking-tight">Documents</h1>
        <p className="text-body-md text-secondary">
          Access compliance reports, API documentation, and manual guides.
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">menu_book</span>
            </div>
            <h3 className="font-semibold text-on-surface">User Manual</h3>
          </div>
          <p className="text-xs text-secondary leading-relaxed">
            Comprehensive guide on how to configure nodes, generate forecasts, and review dispatch plans.
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">api</span>
            </div>
            <h3 className="font-semibold text-on-surface">API Integration</h3>
          </div>
          <p className="text-xs text-secondary leading-relaxed">
            Developer documentation for integrating the GridMitra optimization engine into external dashboards.
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">policy</span>
            </div>
            <h3 className="font-semibold text-on-surface">Compliance & Policies</h3>
          </div>
          <p className="text-xs text-secondary leading-relaxed">
            Regulatory compliance notes regarding renewable targets and diesel emissions constraints.
          </p>
        </div>
      </div>
    </div>
  );
}
