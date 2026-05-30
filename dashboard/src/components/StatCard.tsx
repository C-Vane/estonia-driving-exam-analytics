interface StatCardProps {
  title: string;
  value: string;
  description: string;
  tone?: "default" | "success" | "danger" | "warning";
}

const toneStyles = {
  default: {
    border: "border-l-neutral-500",
    value: "text-white",
  },
  success: {
    border: "border-l-emerald-500",
    value: "text-emerald-400",
  },
  danger: {
    border: "border-l-red-500",
    value: "text-red-400",
  },
  warning: {
    border: "border-l-amber-500",
    value: "text-amber-400",
  },
};

export function StatCard({
  title,
  value,
  description,
  tone = "default",
}: StatCardProps) {
  const styles = toneStyles[tone];

  return (
    <div
      className={`rounded-2xl border border-neutral-800 border-l-4 bg-neutral-950 p-5 ${styles.border}`}
    >
      <p className="text-sm font-medium text-neutral-400">{title}</p>
      <p className={`mt-2 text-3xl font-bold tracking-tight ${styles.value}`}>
        {value}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-neutral-500">
        {description}
      </p>
    </div>
  );
}
