"use client";

import { useDeferredValue, useState, useTransition } from "react";

import type { ProductReport } from "@/schemas";
import {
  AnalysisForm,
  formStateFromRequest,
  requestFromForm,
  type AnalysisFormState,
  type DemoCaseSummary
} from "@/components/analysis-form";
import { ProgressPanel } from "@/components/progress-panel";
import { ReportView } from "@/components/report-view";
import { SectionCard } from "@/components/section-card";

const FINAL_STAGE_INDEX = 6;

export function SignalSkinApp({
  demoCases
}: {
  demoCases: DemoCaseSummary[];
}) {
  const [formState, setFormState] = useState<AnalysisFormState>(() =>
    formStateFromRequest(demoCases[0].request)
  );
  const [report, setReport] = useState<ProductReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const deferredStageIndex = useDeferredValue(activeStageIndex);
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
    let timer: number | undefined;

    try {
      setError(null);
      setReport(null);
      setIsLoading(true);
      setActiveStageIndex(0);

      timer = window.setInterval(() => {
        setActiveStageIndex((current) =>
          Math.min(current + 1, FINAL_STAGE_INDEX)
        );
      }, 550);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(request)
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "SignalSkin could not complete the analysis.");
      }

      startTransition(() => {
        setReport(payload.report as ProductReport);
        setActiveStageIndex(FINAL_STAGE_INDEX);
      });
    } catch (runError) {
      setError(
        runError instanceof Error
          ? runError.message
          : "SignalSkin could not complete the analysis."
      );
    } finally {
      if (timer) {
        window.clearInterval(timer);
      }

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
            activeIndex={deferredStageIndex}
            isLoading={isLoading}
          />

          {error ? (
            <SectionCard title="Analysis Error" eyebrow="Graceful Failure">
              <p className="text-sm text-slate">{error}</p>
            </SectionCard>
          ) : null}

          {!report && !error ? (
            <SectionCard title="Report Preview" eyebrow="Ready State">
              <p className="text-sm text-slate">
                Run a demo case or submit the form to generate the product intelligence report. The MVP uses one request per run, keeps the provider swappable, and falls back to seeded evidence when live extraction is unavailable.
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
