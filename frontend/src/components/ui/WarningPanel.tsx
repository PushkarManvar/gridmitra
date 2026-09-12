import type { Severity, Warning } from "../../types";

interface WarningPanelProps {
  warnings: Warning[];
}

interface SeverityStyle {
  box: string;
  accent: string;
  icon: string;
}

const SEVERITY_STYLES: Record<Severity, SeverityStyle> = {
  critical: {
    box: "border-[#F87171]/50 bg-[#FEF2F2]",
    accent: "text-[#991B1B]",
    icon: "error",
  },
  warning: {
    box: "border-[#F59E0B]/40 bg-[#FFFBEB]",
    accent: "text-[#92400E]",
    icon: "warning",
  },
  info: {
    box: "border-[#E2DDD2] bg-[#F7F4EC]",
    accent: "text-secondary",
    icon: "info",
  },
};

const GENERIC_STYLE = SEVERITY_STYLES.info;

/**
 * Renders every structured warning returned by the API.
 *
 * - Deduplicates by code so a repeated warning renders once.
 * - Unknown severities fall back to a neutral generic style instead of being
 *   hidden, so future backend codes remain visible.
 * - Returns null for an empty warnings array.
 */
export function WarningPanel({ warnings }: WarningPanelProps) {
  if (warnings.length === 0) {
    return null;
  }

  const seen = new Set<string>();
  const unique = warnings.filter((warning) => {
    if (seen.has(warning.code)) {
      return false;
    }
    seen.add(warning.code);
    return true;
  });

  return (
    <section className="space-y-2" data-testid="warning-panel">
      {unique.map((warning) => {
        const style = SEVERITY_STYLES[warning.severity] ?? GENERIC_STYLE;
        return (
          <div
            key={warning.code}
            className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs shadow-xs ${style.box}`}
          >
            <span
              className={`material-symbols-outlined text-[16px] shrink-0 ${style.accent}`}
            >
              {style.icon}
            </span>
            <div className="min-w-0">
              <div
                className={`font-mono text-[10px] uppercase font-semibold tracking-wider ${style.accent}`}
              >
                {warning.code}
              </div>
              {warning.hour_index !== null && warning.hour_index !== undefined && (
                <div className="mt-0.5 font-mono text-[10px] text-secondary">
                  Hour {warning.hour_index}:00
                </div>
              )}
              <p className={`mt-0.5 leading-snug ${style.accent}`}>{warning.message}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}