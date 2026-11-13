import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {title ? (
          <h2 className="text-xl font-semibold tracking-tight text-stone-900">{title}</h2>
        ) : null}
        {description ? (
          <p className={`${title ? "mt-1" : ""} max-w-2xl text-sm leading-relaxed text-stone-500`}>
            {description}
          </p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}
