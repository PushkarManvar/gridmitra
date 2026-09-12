import type { Persistence } from "../../types";

interface PersistenceNoticeProps {
  persistence: Persistence;
}

/**
 * Non-blocking indicator shown when a calculated plan could not be persisted.
 *
 * Renders nothing when the run was saved, and never hides the calculated
 * results — it is a banner beside the dispatch, not an error screen.
 */
export function PersistenceNotice({ persistence }: PersistenceNoticeProps) {
  if (persistence.saved) {
    return null;
  }

  return (
    <section
      data-testid="persistence-notice"
      className="flex items-start gap-2.5 rounded-xl border border-[#F59E0B]/50 bg-[#FFFBEB] p-3 text-xs text-[#92400E] shadow-xs"
    >
      <span className="material-symbols-outlined text-[16px] shrink-0">cloud_off</span>
      <div>
        <div className="font-semibold">
          Optimization completed, but this run was not saved.
        </div>
        {persistence.message ? (
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-secondary">
            {persistence.message}
          </p>
        ) : null}
      </div>
    </section>
  );
}