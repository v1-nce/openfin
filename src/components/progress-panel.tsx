import { ANALYSIS_STAGE_LABELS } from "@/lib/constants";
import { formatSourceTypeLabel } from "@/lib/format";
import type { AnalysisPreview, ProgressStep, ProgressStage } from "@/schemas";

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
  progress,
  isLoading,
  detail,
  preview
}: {
  progress: ProgressStep[];
  isLoading: boolean;
  detail?: string;
  preview?: AnalysisPreview | null;
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
        {STAGE_ORDER.map((stage) => {
          const step =
            progress.find((item) => item.stage === stage) ?? {
              stage,
              label: ANALYSIS_STAGE_LABELS[stage],
              status: "pending" as const
            };
          const status = step.status;

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
                      : status === "failed"
                        ? "bg-coral"
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
                      ? step.detail ?? "In progress"
                      : status === "failed"
                        ? step.detail ?? "Failed"
                        : "Waiting"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {detail ? <p className="mt-5 text-sm text-slate">{detail}</p> : null}

      {preview ? (
        <div className="mt-5 space-y-3 rounded-3xl border border-slate/10 bg-white/65 p-4">
          <div className="flex flex-wrap gap-2">
            {preview.coveredSourceTypes.map((type) => (
              <span key={type} className="chip">
                Live: {formatSourceTypeLabel(type)}
              </span>
            ))}
            {preview.pendingSourceTypes.slice(0, 3).map((type) => (
              <span
                key={type}
                className="chip border-slate/10 bg-white/80 text-slate"
              >
                Pending: {formatSourceTypeLabel(type)}
              </span>
            ))}
          </div>
          <p className="text-sm text-slate">
            {preview.evidenceCount} evidence snippets collected so far
            {preview.sellerOfferCount
              ? ` · ${preview.sellerOfferCount} seller options found`
              : ""}
            {preview.ingredientCount
              ? ` · ${preview.ingredientCount} ingredients parsed`
              : ""}
          </p>
          {preview.recentActivity.length ? (
            <div className="space-y-2">
              {preview.recentActivity.slice(0, 4).map((activity) => (
                <p key={activity} className="text-sm text-slate">
                  • {activity}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
