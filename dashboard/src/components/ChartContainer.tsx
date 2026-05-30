"use client";

import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

interface ChartContainerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function ChartContainer({
  children,
  className = "h-96 w-full",
  style,
}: ChartContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`${className} animate-pulse rounded-xl bg-neutral-900`}
        style={style}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
