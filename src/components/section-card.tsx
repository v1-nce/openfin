import type { ReactNode } from "react";
import { clsx } from "clsx";

export function SectionCard({
  title,
  eyebrow,
  children,
  className
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={clsx("panel p-5 md:p-6", className)}>
      <div className="mb-4">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ocean">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-xl font-semibold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}
