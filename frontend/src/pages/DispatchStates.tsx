export function DispatchRunningState() {
  return <div className="p-8 text-center text-secondary">Optimizing 24-hour dispatch...</div>;
}

export function DispatchFailedState() {
  return <div className="p-8 text-center text-error">Optimization Failed</div>;
}

export function DispatchEmergencyState() {
  return <div className="p-8 text-center text-error">Emergency Plan Generated - Unmet Load Detected</div>;
}

interface HourDetail {
  hour?: string;
  [key: string]: string | number | boolean | undefined;
}

export function ExplainHourDrawer({ isOpen, onClose, hourData }: { isOpen: boolean, onClose: () => void, hourData?: HourDetail }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-surface-container-lowest border-l border-outline-variant shadow-xl p-6 z-50 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-headline-sm font-semibold text-primary">Hour {hourData?.hour ?? "0"} Breakdown</h3>
        <button onClick={onClose} className="material-symbols-outlined hover:bg-surface-container p-1 rounded">close</button>
      </div>
      <p className="text-body-sm text-secondary">Explanation derived from model constraints goes here...</p>
    </div>
  );
}
