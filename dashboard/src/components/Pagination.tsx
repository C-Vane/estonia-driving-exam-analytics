import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageParam: string;
  queryString: string;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  pageParam,
  queryString,
}: PaginationProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  function pageHref(targetPage: number) {
    const parameters = new URLSearchParams(queryString);
    parameters.set(pageParam, String(targetPage));
    return `/?${parameters.toString()}`;
  }

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-zinc-500">
        Showing {start.toLocaleString()}–{end.toLocaleString()} of{" "}
        {totalItems.toLocaleString()}
      </p>
      <div className="flex items-center gap-2">
        <PaginationLink
          href={pageHref(page - 1)}
          disabled={page <= 1}
          label="Previous"
        />
        <span className="px-2 text-sm text-zinc-400">
          Page {page} of {totalPages}
        </span>
        <PaginationLink
          href={pageHref(page + 1)}
          disabled={page >= totalPages}
          label="Next"
        />
      </div>
    </div>
  );
}

function PaginationLink({
  href,
  disabled,
  label,
}: {
  href: string;
  disabled: boolean;
  label: string;
}) {
  if (disabled) {
    return (
      <span className="rounded-lg border border-zinc-800 px-3 py-1.5 text-sm text-zinc-600">
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      scroll={false}
      className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-cyan-700/60 hover:text-white"
    >
      {label}
    </Link>
  );
}
