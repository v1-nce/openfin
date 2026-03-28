import { formatMoney, formatSourceTypeLabel } from "@/lib/format";
import type { AnalysisPreview } from "@/schemas";

import { SectionCard } from "@/components/section-card";

export function LiveAnalysisPreview({
  preview
}: {
  preview: AnalysisPreview;
}) {
  const signalSections = [
    {
      label: "Retailer",
      signals: preview.reviewSignals
    },
    {
      label: "Editorial",
      signals: preview.editorialSignals
    },
    {
      label: "Social",
      signals: preview.socialSignals
    }
  ];

  return (
    <SectionCard title="Live Preview" eyebrow="Streaming TinyFish Results">
      <div className="space-y-4">
        <div className="rounded-3xl border border-slate/10 bg-white/70 p-4">
          {preview.product ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold text-ink">
                  {preview.product.name}
                </p>
                <span className="chip">{preview.product.brand}</span>
                <span className="chip">{preview.product.category}</span>
              </div>
              <p className="mt-2 text-sm text-slate">
                {formatMoney(preview.product.price)}
                {preview.product.size
                  ? ` · ${preview.product.size.value}${preview.product.size.unit}`
                  : ""}
              </p>
              {preview.product.officialClaims.length ? (
                <p className="mt-3 text-sm text-slate">
                  Claims spotted: {preview.product.officialClaims.slice(0, 3).join(", ")}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-slate">
              TinyFish is still resolving the exact product page, but supporting evidence may arrive first.
            </p>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate/10 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate">
              Evidence
            </p>
            <p className="mt-2 text-2xl font-semibold text-ink">
              {preview.evidenceCount}
            </p>
          </div>
          <div className="rounded-2xl border border-slate/10 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate">
              Ingredients
            </p>
            <p className="mt-2 text-2xl font-semibold text-ink">
              {preview.ingredientCount}
            </p>
          </div>
          <div className="rounded-2xl border border-slate/10 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate">
              Seller options
            </p>
            <p className="mt-2 text-2xl font-semibold text-ink">
              {preview.sellerOfferCount}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {preview.coveredSourceTypes.map((type) => (
            <span key={type} className="chip">
              Covered: {formatSourceTypeLabel(type)}
            </span>
          ))}
          {preview.pendingSourceTypes.map((type) => (
            <span
              key={type}
              className="chip border-slate/10 bg-white/85 text-slate"
            >
              Pending: {formatSourceTypeLabel(type)}
            </span>
          ))}
        </div>

        {preview.recentActivity.length ? (
          <div className="rounded-2xl border border-slate/10 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate">
              Live activity
            </p>
            <div className="mt-3 space-y-2">
              {preview.recentActivity.slice(0, 5).map((activity) => (
                <p key={activity} className="text-sm text-slate">
                  • {activity}
                </p>
              ))}
            </div>
          </div>
        ) : null}

        {preview.topEvidence.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {preview.topEvidence.slice(0, 4).map((evidence) => (
              <div
                key={evidence.id}
                className="rounded-2xl border border-slate/10 bg-white/70 p-4"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate">
                  <span className="font-semibold text-ink">{evidence.source.name}</span>
                  <span>{formatSourceTypeLabel(evidence.source.type)}</span>
                </div>
                <p className="mt-2 text-sm text-slate">{evidence.snippet}</p>
              </div>
            ))}
          </div>
        ) : null}

        {preview.sellerOffers.length ? (
          <div className="rounded-2xl border border-slate/10 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate">
              Early seller reads
            </p>
            <div className="mt-3 space-y-3">
              {preview.sellerOffers.slice(0, 3).map((offer) => (
                <div key={offer.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold text-ink">{offer.sellerName}</span>
                  <span className="chip">{offer.sellerType}</span>
                  <span className="text-slate">{formatMoney(offer.price)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {preview.reviewSignals.length ||
        preview.editorialSignals.length ||
        preview.socialSignals.length ? (
          <div className="grid gap-3 md:grid-cols-3">
            {signalSections.map(({ label, signals }) =>
              signals.length ? (
                <div
                  key={label}
                  className="rounded-2xl border border-slate/10 bg-white/70 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-slate">
                    {label} signal
                  </p>
                  <p className="mt-2 text-sm font-semibold text-ink">
                    {signals[0]?.theme.replace(/_/g, " ")}
                  </p>
                  <p className="mt-1 text-sm text-slate">{signals[0]?.summary}</p>
                </div>
              ) : null
            )}
          </div>
        ) : null}

        {preview.alternatives.length ? (
          <div className="rounded-2xl border border-slate/10 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate">
              Alternatives already spotted
            </p>
            <div className="mt-3 space-y-2">
              {preview.alternatives.slice(0, 3).map((alternative) => (
                <p key={alternative.id} className="text-sm text-slate">
                  <span className="font-semibold text-ink">
                    {alternative.brand} {alternative.productName}
                  </span>
                  {alternative.reasonHints.length
                    ? ` — ${alternative.reasonHints[0]}`
                    : ""}
                </p>
              ))}
            </div>
          </div>
        ) : null}

        {preview.warnings.length ? (
          <div className="space-y-2">
            {preview.warnings.map((warning) => (
              <div
                key={warning}
                className="rounded-2xl border border-coral/20 bg-coral/10 p-3 text-sm text-[#854a38]"
              >
                {warning}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </SectionCard>
  );
}
