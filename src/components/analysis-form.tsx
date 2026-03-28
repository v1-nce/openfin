"use client";

import type { AnalyzeRequest, ProductCategory, ProductMemory, SkinType } from "@/schemas";

export type DemoCaseSummary = {
  id: string;
  title: string;
  summary: string;
  request: AnalyzeRequest;
};

export type AnalysisFormState = {
  demoCaseId?: string;
  rawQuery: string;
  queryType: "name" | "url";
  category: ProductCategory;
  country: string;
  market: string;
  skinType: SkinType;
  concerns: string;
  sensitivities: string;
  likedProducts: string;
  dislikedProducts: string;
  desiredCharacteristics: string;
  currentRoutine: string;
  budgetMax: string;
  fragranceFree: boolean;
  crueltyFree: boolean;
  lightweight: boolean;
  samplePreferred: boolean;
  finish: "" | "natural" | "matte" | "glowy";
  mode: "demo" | "mock" | "live";
};

function memoriesToText(memories: ProductMemory[]): string {
  return memories
    .map((memory) => {
      const suspectedIngredients = memory.suspectedIngredients ?? [];

      return [
        memory.productName,
        suspectedIngredients.length
          ? suspectedIngredients.join(", ")
          : undefined,
        memory.notes
      ]
        .filter(Boolean)
        .join(" | ");
    })
    .join("\n");
}

function parseCsv(text: string): string[] {
  return text
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseMemories(text: string): ProductMemory[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [productName, suspectedIngredients, notes] = line
        .split("|")
        .map((part) => part.trim());

      return {
        productName,
        suspectedIngredients: suspectedIngredients
          ? parseCsv(suspectedIngredients)
          : [],
        notes: notes || undefined
      };
    });
}

export function formStateFromRequest(request: AnalyzeRequest): AnalysisFormState {
  return {
    demoCaseId: request.demoCaseId,
    rawQuery: request.product.rawQuery,
    queryType: request.product.queryType,
    category: request.product.category ?? "moisturizer",
    country: request.product.country,
    market: request.userProfile.market,
    skinType: request.userProfile.skinType,
    concerns: request.userProfile.concerns.join(", "),
    sensitivities: request.userProfile.sensitivities.join(", "),
    likedProducts: memoriesToText(request.userProfile.likedProducts),
    dislikedProducts: memoriesToText(request.userProfile.dislikedProducts),
    desiredCharacteristics: request.userProfile.desiredCharacteristics.join(", "),
    currentRoutine: request.userProfile.currentRoutine.join(", "),
    budgetMax: String(request.userProfile.budgetRange.max ?? ""),
    fragranceFree: request.userProfile.preferences.fragranceFree ?? false,
    crueltyFree: request.userProfile.preferences.crueltyFree ?? false,
    lightweight: request.userProfile.preferences.lightweight ?? false,
    samplePreferred: request.userProfile.preferences.samplePreferred ?? false,
    finish: request.userProfile.preferences.finish ?? "",
    mode: request.mode
  };
}

export function requestFromForm(formState: AnalysisFormState): AnalyzeRequest {
  return {
    mode: formState.mode,
    demoCaseId: formState.demoCaseId,
    product: {
      rawQuery: formState.rawQuery,
      queryType: formState.queryType,
      category: formState.category,
      country: formState.country
    },
    userProfile: {
      id: formState.demoCaseId
        ? `${formState.demoCaseId}-profile`
        : "custom-profile",
      market: formState.market,
      skinType: formState.skinType,
      concerns: parseCsv(formState.concerns),
      sensitivities: parseCsv(formState.sensitivities),
      likedProducts: parseMemories(formState.likedProducts),
      dislikedProducts: parseMemories(formState.dislikedProducts),
      desiredCharacteristics: parseCsv(formState.desiredCharacteristics),
      currentRoutine: parseCsv(formState.currentRoutine),
      budgetRange: {
        max: formState.budgetMax ? Number(formState.budgetMax) : undefined,
        currency: "USD"
      },
      preferences: {
        fragranceFree: formState.fragranceFree || undefined,
        crueltyFree: formState.crueltyFree || undefined,
        lightweight: formState.lightweight || undefined,
        samplePreferred: formState.samplePreferred || undefined,
        finish: formState.finish || undefined
      },
      preferenceWeights: {
        fit: 0.3,
        ingredients: 0.24,
        sentiment: 0.18,
        evidence: 0.14,
        seller: 0.14
      }
    }
  };
}

export function AnalysisForm({
  demoCases,
  formState,
  isLoading,
  onChange,
  onSubmit,
  onUseDemoCase,
  onRunDemo
}: {
  demoCases: DemoCaseSummary[];
  formState: AnalysisFormState;
  isLoading: boolean;
  onChange: (field: keyof AnalysisFormState, value: string | boolean) => void;
  onSubmit: () => void;
  onUseDemoCase: (demoCaseId: string) => void;
  onRunDemo: (demoCaseId: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="panel p-5 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ocean">
              Demo Cases
            </p>
            <h2 className="mt-1 text-xl font-semibold text-ink">
              Choose a demo path or customize the profile
            </h2>
          </div>
          <span className="chip">Hackathon-safe fallback</span>
        </div>

        <div className="mt-5 grid gap-3">
          {demoCases.map((demoCase) => (
            <div
              key={demoCase.id}
              className="rounded-3xl border border-slate/10 bg-white/65 p-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-ink">
                    {demoCase.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate">{demoCase.summary}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-slate/15 px-4 py-2 text-sm font-medium text-slate transition hover:border-ocean hover:text-ocean"
                    onClick={() => onUseDemoCase(demoCase.id)}
                    disabled={isLoading}
                  >
                    Use Scenario
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => onRunDemo(demoCase.id)}
                    disabled={isLoading}
                  >
                    Run One-Click Demo
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel p-5 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ocean">
              Product + Profile
            </p>
            <h2 className="mt-1 text-xl font-semibold text-ink">
              Customize the analysis request
            </h2>
          </div>
          <span className="chip">One request per submit</span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-ink">
              Product name or URL
            </label>
            <input
              className="input"
              value={formState.rawQuery}
              onChange={(event) => onChange("rawQuery", event.target.value)}
              placeholder="Glow Recipe Watermelon Glow Pink Juice Moisturizer"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              Query type
            </label>
            <select
              className="input"
              value={formState.queryType}
              onChange={(event) => onChange("queryType", event.target.value)}
            >
              <option value="name">Product name</option>
              <option value="url">Product URL</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              Category
            </label>
            <select
              className="input"
              value={formState.category}
              onChange={(event) => onChange("category", event.target.value)}
            >
              <option value="moisturizer">Moisturizer</option>
              <option value="sunscreen">Sunscreen</option>
              <option value="serum">Serum</option>
              <option value="cleanser">Cleanser</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              Skin type
            </label>
            <select
              className="input"
              value={formState.skinType}
              onChange={(event) => onChange("skinType", event.target.value)}
            >
              <option value="oily">Oily</option>
              <option value="combination">Combination</option>
              <option value="dry">Dry</option>
              <option value="normal">Normal</option>
              <option value="sensitive">Sensitive</option>
              <option value="acne_prone">Acne-prone</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              Market
            </label>
            <input
              className="input"
              value={formState.market}
              onChange={(event) => onChange("market", event.target.value)}
              placeholder="US"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              Budget max
            </label>
            <input
              className="input"
              inputMode="decimal"
              value={formState.budgetMax}
              onChange={(event) => onChange("budgetMax", event.target.value)}
              placeholder="45"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-ink">
              Concerns
            </label>
            <input
              className="input"
              value={formState.concerns}
              onChange={(event) => onChange("concerns", event.target.value)}
              placeholder="sensitivity, acne, dehydration"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-ink">
              Sensitivities
            </label>
            <input
              className="input"
              value={formState.sensitivities}
              onChange={(event) => onChange("sensitivities", event.target.value)}
              placeholder="fragrance, parfum"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-ink">
              Desired characteristics
            </label>
            <input
              className="input"
              value={formState.desiredCharacteristics}
              onChange={(event) =>
                onChange("desiredCharacteristics", event.target.value)
              }
              placeholder="lightweight, layers under makeup, no white cast"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-ink">
              Current routine
            </label>
            <input
              className="input"
              value={formState.currentRoutine}
              onChange={(event) => onChange("currentRoutine", event.target.value)}
              placeholder="gentle cleanser, niacinamide serum, SPF"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-ink">
              Liked products
            </label>
            <textarea
              className="input min-h-24"
              value={formState.likedProducts}
              onChange={(event) => onChange("likedProducts", event.target.value)}
              placeholder="La Roche-Posay Toleriane Double Repair |  | Calm, easy to wear"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-ink">
              Disliked products
            </label>
            <textarea
              className="input min-h-24"
              value={formState.dislikedProducts}
              onChange={(event) => onChange("dislikedProducts", event.target.value)}
              placeholder="Belif Aqua Bomb | fragrance, citrus extract | Stung on my cheeks"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              Preferred finish
            </label>
            <select
              className="input"
              value={formState.finish}
              onChange={(event) => onChange("finish", event.target.value)}
            >
              <option value="">No preference</option>
              <option value="natural">Natural</option>
              <option value="matte">Matte</option>
              <option value="glowy">Glowy</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              Mode
            </label>
            <select
              className="input"
              value={formState.mode}
              onChange={(event) => onChange("mode", event.target.value)}
            >
              <option value="demo">Demo</option>
              <option value="mock">Mock</option>
              <option value="live">Live TinyFish (beta)</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {[
            ["fragranceFree", "Fragrance-free"],
            ["crueltyFree", "Cruelty-free"],
            ["lightweight", "Lightweight"],
            ["samplePreferred", "Sample preferred"]
          ].map(([field, label]) => (
            <label
              key={field}
              className="chip cursor-pointer gap-2 border-slate/10 bg-white/90 text-sm"
            >
              <input
                type="checkbox"
                checked={Boolean(formState[field as keyof AnalysisFormState])}
                onChange={(event) =>
                  onChange(field as keyof AnalysisFormState, event.target.checked)
                }
              />
              {label}
            </label>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-2xl text-sm text-slate">
            Product memories use a simple line format: <code>Product name | suspected ingredients | notes</code>. This keeps the MVP typed without forcing a larger profile builder yet.
          </p>
          <button
            type="button"
            className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#cb664d] disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Analyzing..." : "Analyze Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
