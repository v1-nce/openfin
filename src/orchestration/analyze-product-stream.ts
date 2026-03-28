import { runProviderExtractionWithUpdates } from "@/providers";
import { assembleProductReport } from "@/orchestration/analyze-product";
import {
  buildProgressSnapshot,
  buildSourcePlan
} from "@/orchestration/source-plan";
import {
  AnalysisPreviewSchema,
  AnalysisStreamEventSchema,
  AnalyzeRequestSchema,
  type AnalysisPreview,
  type AnalysisStreamEvent,
  type AnalyzeRequest
} from "@/schemas";

type EmitEvent = (event: AnalysisStreamEvent) => void;

function emitValidatedEvent(emit: EmitEvent, options: {
  detail?: string;
  preview?: AnalysisPreview;
}) {
  const detail = options.detail ?? "SignalSkin is gathering live evidence.";

  emit(
    AnalysisStreamEventSchema.parse({
      type: "progress",
      progress: buildProgressSnapshot({
        completedStages: ["validate", "plan"],
        runningStage: "extract",
        detailByStage: {
          extract: detail
        }
      }),
      detail,
      preview: options.preview
    })
  );
}

export async function analyzeProductStream(
  requestInput: AnalyzeRequest,
  emit: EmitEvent
): Promise<void> {
  const request = AnalyzeRequestSchema.parse(requestInput);
  const sourcePlan = buildSourcePlan(request);
  let latestPreview: AnalysisPreview | undefined;

  emitValidatedEvent(emit, {
    detail:
      request.mode === "live"
        ? "Starting TinyFish product and supporting-source passes."
        : "Preparing the seeded SignalSkin analysis."
  });

  const extraction = await runProviderExtractionWithUpdates(
    request,
    sourcePlan,
    (update) => {
      if (update.preview) {
        latestPreview = AnalysisPreviewSchema.parse(update.preview);
      }

      if (update.type === "preview" && update.preview) {
        emit(
          AnalysisStreamEventSchema.parse({
            type: "preview",
            preview: latestPreview
          })
        );
      }

      emitValidatedEvent(emit, {
        detail: update.detail,
        preview: latestPreview
      });
    }
  );

  emit(
    AnalysisStreamEventSchema.parse({
      type: "progress",
      progress: buildProgressSnapshot({
        completedStages: ["validate", "plan", "extract"],
        runningStage: "reason",
        detailByStage: {
          reason: "Scoring the evidence and assembling the final recommendation."
        }
      }),
      detail: "Scoring the evidence and assembling the final recommendation.",
      preview: latestPreview
    })
  );

  const report = assembleProductReport({
    request,
    extraction
  });

  emit(
    AnalysisStreamEventSchema.parse({
      type: "complete",
      report
    })
  );
}
