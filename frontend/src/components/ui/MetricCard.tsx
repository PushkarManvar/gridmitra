export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  description: string;
  icon: string;
  iconBgClass?: string;
  iconTextClass?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  description,
  icon,
  iconBgClass = "bg-surface-container-low",
  iconTextClass = "text-primary",
}: MetricCardProps) {
  return (
    <div className="bg-surface-container-lowest border border-[#E7E3D8] rounded-xl p-4 flex flex-col justify-between shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-semibold text-secondary tracking-wider uppercase">
          {title}
        </span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBgClass} ${iconTextClass}`}>
          <span className="material-symbols-outlined text-[16px]">{icon}</span>
        </div>
      </div>
      <div className="flex items-baseline gap-2 mt-4 mb-2">
        <span className="font-mono text-2xl font-bold text-on-surface">{value}</span>
        {unit && <span className="text-xs text-secondary font-semibold">{unit}</span>}
      </div>
      <p className="text-xs text-secondary leading-snug">{description}</p>
    </div>
  );
}
