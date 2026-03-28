import { THEME_LABELS } from "@/lib/constants";
import {
  formatConfidenceLabel,
  formatMoney,
  formatSourceTypeLabel,
  formatVerdictLabel
} from "@/lib/format";
import type { ProductReport, SourceEvidence } from "@/schemas";

import { SectionCard } from "@/components/section-card";

function EvidenceSnippet({
  evidence,
  compact = false
}: {
  evidence?: SourceEvidence;
  compact?: boolean;
}) {
  if (!evidence) {
    return null;
  }

  return (
    <div className={`rounded-2xl border border-slate/10 bg-white/70 ${compact ? "p-3" : "p-4"}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate">
        <span className="font-semibold text-ink">{evidence.source.name}</span>
        <span>{formatSourceTypeLabel(evidence.source.type)}</span>
        <span>{formatConfidenceLabel(evidence.confidence)}</span>
      </div>
      <p className="mt-2 text-sm text-slate">{evidence.snippet}</p>
      {evidence.source.url ? (
        <a
          href={evidence.source.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex text-sm font-medium text-ocean hover:underline"
        >
          Open source
        </a>
      ) : null}
    </div>
  );
}

export function ReportView({ report }: { report: ProductReport }) {
  const evidenceMap = new Map(report.evidence.map((item) => [item.id, item]));
  const verdictTone =
    report.finalVerdict.verdict === "buy"
      ? "bg-moss/15 text-moss"
      : report.finalVerdict.verdict === "cautious_try"
        ? "bg-coral/15 text-coral"
        : "bg-[#5a6470]/15 text-[#44515e]";

  return (
    <div className="space-y-6">
      <SectionCard title="Recommendation Summary" eyebrow="SignalSkin Report">
        <div className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-4 py-2 text-sm font-semibold ${verdictTone}`}>
                {formatVerdictLabel(report.finalVerdict.verdict)}
              </span>
              <span className="chip">{formatConfidenceLabel(report.finalVerdict.confidence)}</span>
              <span className="chip">{report.providerName}</span>
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-ink">
              {report.product.name}
            </h3>
            <p className="mt-2 text-sm text-slate">
              {report.product.brand} · {report.product.category} · {formatMoney(report.product.price)}
              {report.product.size ? ` · ${report.product.size.value}${report.product.size.unit}` : ""}
            </p>
            <p className="mt-4 text-base text-slate">{report.finalVerdict.summary}</p>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate/10 bg-white/70 p-4">
                <p className="text-sm font-semibold text-ink">Top reasons</p>
                <ul className="mt-3 space-y-2 text-sm text-slate">
                  {report.finalVerdict.topReasons.slice(0, 3).map((reason) => (
                    <li key={reason}>• {reason}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-slate/10 bg-white/70 p-4">
                <p className="text-sm font-semibold text-ink">Top cautions</p>
                <ul className="mt-3 space-y-2 text-sm text-slate">
                  {report.finalVerdict.topCautions.slice(0, 3).map((caution) => (
                    <li key={caution}>• {caution}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/70 bg-gradient-to-br from-white to-[#f8efe6] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ocean">
              What We Know
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate">
              {report.whatWeKnow.map((statement) => (
                <li key={statement}>• {statement}</li>
              ))}
            </ul>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-coral">
              Less Certain
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate">
              {report.lessCertainAbout.map((statement) => (
                <li key={statement}>• {statement}</li>
              ))}
            </ul>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[0.92fr,1.08fr]">
        <SectionCard title="Score Breakdown" eyebrow="Explainable Heuristics">
          <div className="space-y-4">
            {[
              ["Personal fit", report.scoreBreakdown.personalFit],
              ["Ingredient compatibility", report.scoreBreakdown.ingredientCompatibility],
              ["Sentiment", report.scoreBreakdown.sentiment],
              ["Evidence confidence", report.scoreBreakdown.evidenceConfidence],
              ["Seller trust + value", report.scoreBreakdown.sellerTrustValue],
              ["Total", report.scoreBreakdown.total]
            ].map(([label, score]) => (
              <div key={label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">{label}</span>
                  <span className="text-slate">{score}/100</span>
                </div>
                <div className="h-2 rounded-full bg-slate/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-ocean to-coral"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2 text-sm text-slate">
            {report.scoreBreakdown.notes.map((note) => (
              <p key={note}>• {note}</p>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Ingredient Cautions" eyebrow="Compatibility Layer">
          {report.ingredientFlags.length ? (
            <div className="space-y-4">
              {report.ingredientFlags.map((flag) => (
                <div
                  key={flag.ingredientName}
                  className="rounded-2xl border border-slate/10 bg-white/70 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-ink">
                      {flag.ingredientName}
                    </p>
                    <span className="chip">{flag.severity} severity</span>
                    {flag.matchedSensitivity ? (
                      <span className="chip">Matched: {flag.matchedSensitivity}</span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm text-slate">{flag.reason}</p>
                  {flag.relatedDislikedProducts.length ? (
                    <p className="mt-2 text-sm text-slate">
                      Prior overlap: {flag.relatedDislikedProducts.join(", ")}
                    </p>
                  ) : null}
                  <div className="mt-3 grid gap-3">
                    {flag.evidenceIds.slice(0, 1).map((evidenceId) => (
                      <EvidenceSnippet
                        key={evidenceId}
                        evidence={evidenceMap.get(evidenceId)}
                        compact
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate">
              No direct ingredient conflicts were flagged for this profile.
            </p>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Sentiment Synthesis" eyebrow="Consumers vs Editorial">
          <div className="space-y-4">
            {report.sentimentThemes.map((theme) => (
              <div
                key={theme.theme}
                className="rounded-2xl border border-slate/10 bg-white/70 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold text-ink">
                    {THEME_LABELS[theme.theme]}
                  </p>
                  <span className="chip">{theme.polarity}</span>
                  <span className="chip">{formatConfidenceLabel(theme.confidence)}</span>
                </div>
                {theme.positiveSummary ? (
                  <p className="mt-3 text-sm text-slate">
                    <span className="font-medium text-ink">Positive:</span> {theme.positiveSummary}
                  </p>
                ) : null}
                {theme.negativeSummary ? (
                  <p className="mt-2 text-sm text-slate">
                    <span className="font-medium text-ink">Negative:</span> {theme.negativeSummary}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-slate">
                  Source mix: {theme.supportingSourceTypes.map(formatSourceTypeLabel).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Contradictions" eyebrow="Disagreement Detector">
          {report.contradictionFindings.length ? (
            <div className="space-y-4">
              {report.contradictionFindings.map((finding) => (
                <div
                  key={finding.id}
                  className="rounded-2xl border border-slate/10 bg-white/70 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-ink">{finding.title}</p>
                    <span className="chip">{finding.severity} severity</span>
                    <span className="chip">{formatConfidenceLabel(finding.confidence)}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate">{finding.summary}</p>
                  <div className="mt-4 grid gap-3">
                    {finding.supportingEvidenceIds.slice(0, 1).map((evidenceId) => (
                      <EvidenceSnippet
                        key={evidenceId}
                        evidence={evidenceMap.get(evidenceId)}
                        compact
                      />
                    ))}
                    {finding.counterEvidenceIds.slice(0, 1).map((evidenceId) => (
                      <EvidenceSnippet
                        key={evidenceId}
                        evidence={evidenceMap.get(evidenceId)}
                        compact
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate">
              SignalSkin did not find a major contradiction pattern in the current evidence set.
            </p>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <SectionCard title="Alternatives" eyebrow="Reason-Based Swaps">
          <div className="space-y-4">
            {report.alternatives.map((alternative) => (
              <div
                key={alternative.id}
                className="rounded-2xl border border-slate/10 bg-white/70 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold text-ink">
                    {alternative.productName}
                  </p>
                  <span className="chip">{alternative.brand}</span>
                  {alternative.priceSummary ? (
                    <span className="chip">{alternative.priceSummary}</span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm text-slate">{alternative.reason}</p>
                {alternative.tradeoff ? (
                  <p className="mt-2 text-sm text-slate">
                    Tradeoff: {alternative.tradeoff}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Where To Buy" eyebrow="Seller Trust + Value">
          <div className="space-y-4">
            {report.sellerRankings.map((item) => (
              <div
                key={item.offer.id}
                className="rounded-2xl border border-slate/10 bg-white/70 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
                        Rank #{item.rank}
                      </span>
                      <p className="text-base font-semibold text-ink">
                        {item.offer.sellerName}
                      </p>
                      <span className="chip">{item.offer.sellerType}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate">
                      {formatMoney(item.offer.price)}
                      {item.offer.size
                        ? ` · ${item.offer.size.value}${item.offer.size.unit}`
                        : ""}
                      {item.valuePerUnit
                        ? ` · ${item.valuePerUnit.toFixed(2)} ${item.offer.price.currency}/${item.offer.size?.unit ?? "unit"}`
                        : ""}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 text-center">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate">
                      Purchase score
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-ink">
                      {item.purchaseScore}
                    </p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-slate">
                  {item.rationale.map((reason) => (
                    <li key={reason}>• {reason}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.84fr,1.16fr]">
        <SectionCard title="Source Coverage" eyebrow="Evidence Model">
          <div className="flex flex-wrap gap-2">
            {report.sourceCoverage.coveredSourceTypes.map((type) => (
              <span key={type} className="chip">
                Covered: {formatSourceTypeLabel(type)}
              </span>
            ))}
            {report.sourceCoverage.missingSourceTypes.map((type) => (
              <span key={type} className="chip border-coral/20 bg-coral/10 text-coral">
                Missing: {formatSourceTypeLabel(type)}
              </span>
            ))}
          </div>

          {report.warnings.length ? (
            <div className="mt-5 space-y-3">
              {report.warnings.map((warning) => (
                <div
                  key={warning}
                  className="rounded-2xl border border-coral/20 bg-coral/10 p-4 text-sm text-[#854a38]"
                >
                  {warning}
                </div>
              ))}
            </div>
          ) : null}
        </SectionCard>

        <SectionCard title="Evidence Drawer" eyebrow="Citations">
          <div className="grid gap-3 md:grid-cols-2">
            {report.evidence.slice(0, 8).map((item) => (
              <EvidenceSnippet key={item.id} evidence={item} />
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
