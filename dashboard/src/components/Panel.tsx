import type { ReactNode } from "react";

interface PanelProps {
  children: ReactNode;
  className?: string;
}

export function Panel({ children, className = "" }: PanelProps) {
  return (
    <div className={`surface-card-lg shadow-2xl shadow-black/40 ${className}`}>
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
    <div className={description ? "mb-6" : "mb-5"}>
      <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
      {description && (
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
          {description}
        </p>
      )}
    </div>
  );
}
