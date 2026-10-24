import clsx from "clsx";

type Flow = { rail: string; stages: string[]; failed?: boolean };

const flows = (needed: number | null): Flow[] => [
  {
    rail: "Test network",
    stages: ["Sent", "Received", needed ? `Confirming n/${needed}` : "Confirming", "Settled", "Shop notified"],
  },
  {
    rail: "Test card",
    stages: ["Sent", "Processing", "Settled", "Shop notified"],
  },
  { rail: "Failed", stages: ["Did not go through"], failed: true },
];

/**
 * Each rail's stages in order, as small printed stamps joined by arrows. They wrap on a narrow screen.
 * `needed` is the demo's confirmation target, or null when it is not known.
 */
export const StageFlow = ({ needed }: { needed: number | null }) => (
  <div className="grid gap-4">
    {flows(needed).map((flow) => (
      <div key={flow.rail} className="grid gap-2 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:items-center">
        <span className="text-muted text-[11px] tracking-[0.12em] uppercase">{flow.rail}</span>
        <ol aria-label={`${flow.rail} stages`} className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
          {flow.stages.map((stage, i) => (
            <li key={stage} className="flex items-center gap-x-1.5">
              {i > 0 && (
                <span aria-hidden="true" className="text-muted">
                  →
                </span>
              )}
              <span
                className={clsx(
                  "rounded-sm border-[1.5px] border-dashed px-2 py-0.5 text-[13px] whitespace-nowrap",
                  flow.failed
                    ? "border-accent text-accent-strong font-bold"
                    : stage === "Settled"
                      ? "bg-ticket-3 text-ink border-transparent font-bold"
                      : "border-line",
                )}
              >
                {stage}
              </span>
            </li>
          ))}
        </ol>
      </div>
    ))}
  </div>
);
