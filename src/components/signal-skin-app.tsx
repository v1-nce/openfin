"use client";

import { useState, useTransition } from "react";

import { ANALYSIS_STAGE_LABELS } from "@/lib/constants";
import type {
  AnalysisPreview,
  AnalysisStreamEvent,
  ProductReport,
  ProgressStage,
  ProgressStep
} from "@/schemas";
import {
  AnalysisForm,
  formStateFromRequest,
  requestFromForm,
  type AnalysisFormState,
  type DemoCaseSummary
} from "@/components/analysis-form";
import { LiveAnalysisPreview } from "@/components/live-analysis-preview";
import { ProgressPanel } from "@/components/progress-panel";
import { ReportView } from "@/components/report-view";
import { SectionCard } from "@/components/section-card";

const INITIAL_PROGRESS: ProgressStep[] = (
  [
    "validate",
    "plan",
    "extract",
    "normalize",
    "reason",
    "rank",
    "assemble"
  ] as ProgressStage[]
).map((stage) => ({
  stage,
  label: ANALYSIS_STAGE_LABELS[stage],
  status: "pending"
}));

export function SignalSkinApp({
  demoCases
}: {
  demoCases: DemoCaseSummary[];
}) {
  const [formState, setFormState] = useState<AnalysisFormState>(() =>
    formStateFromRequest(demoCases[0].request)
  );
  const [report, setReport] = useState<ProductReport | null>(null);
  const [preview, setPreview] = useState<AnalysisPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressStep[]>(INITIAL_PROGRESS);
  const [progressDetail, setProgressDetail] = useState<string | null>(null);
  const [isTransitionPending, startTransition] = useTransition();

  const activeDemoSummary =
    demoCases.find((demoCase) => demoCase.id === formState.demoCaseId) ?? {
      id: "custom",
      title: "Custom analysis request",
      summary:
        "This run will use the current product and profile fields instead of a seeded scenario.",
      request: requestFromForm(formState)
    };

  function updateField(
    field: keyof AnalysisFormState,
    value: string | boolean
  ) {
    setFormState((current) => ({
      ...current,
      demoCaseId:
        field === "demoCaseId" || field === "mode" ? current.demoCaseId : undefined,
      [field]: value
    }));
  }

  async function runAnalysis(request: DemoCaseSummary["request"] | ReturnType<typeof requestFromForm>) {
    try {
      setError(null);
      setReport(null);
      setPreview(null);
      setIsLoading(true);
      setProgress(INITIAL_PROGRESS);
      setProgressDetail("Submitting the request to SignalSkin.");

      const response = await fetch("/api/analyze/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream"
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "SignalSkin could not complete the analysis.");
      }

      if (!response.body) {
        throw new Error("SignalSkin returned no stream body.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let didComplete = false;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) {
            continue;
          }

          const event = JSON.parse(line.slice(6)) as AnalysisStreamEvent;

          if (event.type === "progress") {
            setProgress(event.progress);
            setProgressDetail(event.detail ?? null);

            if (event.preview) {
              const preview = event.preview;

              startTransition(() => {
                setPreview(preview);
              });
            }
          } else if (event.type === "preview") {
            const preview = event.preview;

            startTransition(() => {
              setPreview(preview);
            });
          } else if (event.type === "complete") {
            didComplete = true;
            startTransition(() => {
              setReport(event.report);
              setProgress(event.report.progress);
              setProgressDetail("SignalSkin finished assembling the report.");
            });
          } else if (event.type === "error") {
            throw new Error(event.error);
          }
        }
      }

      if (!didComplete) {
        throw new Error("SignalSkin ended the stream before returning a final report.");
      }
    } catch (runError) {
      setError(
        runError instanceof Error
          ? runError.message
          : "SignalSkin could not complete the analysis."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleUseDemoCase(demoCaseId: string) {
    const match = demoCases.find((demoCase) => demoCase.id === demoCaseId);

    if (!match) {
      return;
    }

    startTransition(() => {
      setFormState(formStateFromRequest(match.request));
    });
  }

  function handleRunDemo(demoCaseId: string) {
    const match = demoCases.find((demoCase) => demoCase.id === demoCaseId);

    if (!match) {
      return;
    }

    startTransition(() => {
      setFormState(formStateFromRequest(match.request));
    });

    void runAnalysis(match.request);
  }

  function handleSubmit() {
    void runAnalysis(requestFromForm(formState));
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <section className="panel overflow-hidden p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-ocean">
              TinyFish x OpenAI Hackathon MVP
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-ink md:text-5xl">
              SignalSkin turns messy web beauty research into an evidence-backed buying decision.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate md:text-lg">
              Instead of acting like a generic recommender, SignalSkin plans source coverage, synthesizes conflicting evidence, personalizes fit heuristics, and ranks where to buy with trust and value in mind.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="chip">Evidence snippets</span>
              <span className="chip">Contradiction detector</span>
              <span className="chip">Seller trust ranking</span>
              <span className="chip">Demo-safe fallback</span>
            </div>
          </div>

          <div className="rounded-[1.9rem] border border-white/70 bg-white/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral">
              Active demo path
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">
              {activeDemoSummary.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate">
              {activeDemoSummary.summary}
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-slate/10 bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate">
                  Query
                </p>
                <p className="mt-2 text-sm font-medium text-ink">
                  {activeDemoSummary.request.product.rawQuery}
                </p>
              </div>
              <div className="rounded-2xl border border-slate/10 bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate">
                  Profile
                </p>
                <p className="mt-2 text-sm text-slate">
                  {activeDemoSummary.request.userProfile.skinType} skin · concerns:{" "}
                  {activeDemoSummary.request.userProfile.concerns.join(", ")}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate">
              {isTransitionPending
                ? "Updating the scenario..."
                : "Use a seeded case for the fastest judge-friendly path, or tweak the form and re-run."}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.08fr,0.92fr]">
        <AnalysisForm
          demoCases={demoCases}
          formState={formState}
          isLoading={isLoading}
          onChange={updateField}
          onSubmit={handleSubmit}
          onUseDemoCase={handleUseDemoCase}
          onRunDemo={handleRunDemo}
        />

        <div className="space-y-6">
          <ProgressPanel
            progress={progress}
            isLoading={isLoading}
            detail={progressDetail ?? undefined}
            preview={preview}
          />

          {error ? (
            <SectionCard title="Analysis Error" eyebrow="Graceful Failure">
              <p className="text-sm text-slate">{error}</p>
            </SectionCard>
          ) : null}

          {!report && preview ? <LiveAnalysisPreview preview={preview} /> : null}

          {!report && !error && !preview ? (
            <SectionCard title="Report Preview" eyebrow="Ready State">
              <p className="text-sm text-slate">
                Run a demo case or submit the form to generate the product intelligence report. SignalSkin now streams real progress and partial live findings while the final reasoning layer is still assembling.
              </p>
            </SectionCard>
          ) : null}
        </div>
      </section>

      {report ? (
        <section className="mt-8">
          <ReportView report={report} />
        </section>
      ) : null}
    </main>
  );
}
