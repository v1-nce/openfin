import { ANALYSIS_STAGE_LABELS } from "@/lib/constants";
import type { ProgressStage } from "@/schemas";

const STAGE_ORDER: ProgressStage[] = [
  "validate",
  "plan",
  "extract",
  "normalize",
  "reason",
  "rank",
  "assemble"
];

export function ProgressPanel({
  activeIndex,
  isLoading
}: {
  activeIndex: number;
  isLoading: boolean;
}) {
  return (
    <div className="panel p-5 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ocean">
            Crawl Progress
          </p>
          <h2 className="mt-1 text-xl font-semibold text-ink">
            {isLoading ? "SignalSkin is building the report" : "Ready for the next run"}
          </h2>
        </div>
        <span className="chip">
          {isLoading ? "One request in flight" : "Idle"}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {STAGE_ORDER.map((stage, index) => {
          const status =
            index < activeIndex
              ? "completed"
              : index === activeIndex && isLoading
                ? "running"
                : "pending";

          return (
            <div
              key={stage}
              className="flex items-center gap-3 rounded-2xl border border-slate/10 bg-white/60 px-4 py-3"
            >
              <div
                className={`h-3 w-3 rounded-full ${
                  status === "completed"
                    ? "bg-moss"
                    : status === "running"
                      ? "bg-coral animate-pulse"
                      : "bg-slate/30"
                }`}
              />
              <div>
                <p className="text-sm font-medium text-ink">
                  {ANALYSIS_STAGE_LABELS[stage]}
                </p>
                <p className="text-xs text-slate">
                  {status === "completed"
                    ? "Finished"
                    : status === "running"
                      ? "In progress"
                      : "Waiting"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-sm text-slate">
        The UI advances through staged progress locally, but each analysis run still sends only one API request to avoid unnecessary endpoint churn.
      </p>
    </div>
  );
}
