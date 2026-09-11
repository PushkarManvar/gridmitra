interface KpiCardProps {
  label: string;
  value: string;
  detail: string;
  tone?: "mint" | "sun" | "coral";
}

const toneClasses = {
  mint: "text-mint",
  sun: "text-sun",
  coral: "text-coral"
};

export function KpiCard({ label, value, detail, tone = "mint" }: KpiCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/55">
        {label}
      </p>
      <p className={`mt-3 text-3xl font-semibold ${toneClasses[tone]}`}>{value}</p>
      <p className="mt-2 text-sm text-emerald-50/55">{detail}</p>
    </article>
  );
}
