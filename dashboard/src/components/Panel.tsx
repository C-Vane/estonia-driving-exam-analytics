import type { ReactNode } from "react";

interface PanelProps {
  children: ReactNode;
  className?: string;
}

export function Panel({ children, className = "" }: PanelProps) {
  return (
    <div
      className={`rounded-2xl border border-neutral-800 bg-neutral-950 p-6 ${className}`}
    >
      {children}
    </div>
  );
}

interface PanelHeadingProps {
  title: string;
  description?: string;
}

export function PanelHeading({ title, description }: PanelHeadingProps) {
  return (
    <div className={description ? "mb-6" : "mb-4"}>
      <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
      {description && (
        <p className="mt-1 text-sm leading-relaxed text-neutral-400">
          {description}
        </p>
      )}
    </div>
  );
}
