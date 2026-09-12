import { RunStatus } from "../../types";

export interface StatusBadgeProps {
  status: RunStatus | "system_ready" | "draft" | "validating" | "running";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    system_ready: { bg: "bg-surface-container-low", border: "border-outline-variant", dot: "bg-[#10B981]", text: "text-primary", label: "System Ready", pulse: true },
    draft: { bg: "bg-[#F1F5F9]", border: "border-[#E2E8F0]", dot: "bg-[#94A3B8]", text: "text-[#475569]", label: "Draft", pulse: false },
    validating: { bg: "bg-[#FEF3C7]", border: "border-[#FDE68A]", dot: "bg-[#F59E0B]", text: "text-[#92400E]", label: "Validating", pulse: true },
    running: { bg: "bg-[#EFF6FF]", border: "border-[#BFDBFE]", dot: "bg-[#3B82F6]", text: "text-[#1E40AF]", label: "Running", pulse: true },
    optimal: { bg: "bg-[#ECFDF5]", border: "border-[#A7F3D0]", dot: "bg-[#10B981]", text: "text-[#065F46]", label: "Optimal", pulse: false },
    emergency_plan: { bg: "bg-[#FFF1F2]", border: "border-[#FECDD3]", dot: "bg-[#E11D48]", text: "text-[#9F1239]", label: "Emergency Plan", pulse: false },
    failed: { bg: "bg-[#FEF2F2]", border: "border-[#FECACA]", dot: "bg-[#EF4444]", text: "text-[#991B1B]", label: "Failed", pulse: false },
  };

  const style = config[status];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full ${style.bg} border ${style.border}`}>
      <span className={`w-2 h-2 rounded-full ${style.dot} ${style.pulse ? "animate-pulse" : ""}`}></span>
      <span className={`text-[10px] font-mono tracking-wider font-semibold uppercase ${style.text}`}>{style.label}</span>
    </div>
  );
}
