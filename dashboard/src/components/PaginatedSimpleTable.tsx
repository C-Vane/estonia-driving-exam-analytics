import { Pagination } from "@/components/Pagination";

interface PaginatedSimpleTableProps<T extends Record<string, string | number>> {
  title: string;
  description?: string;
  columns: Array<{ key: keyof T; label: string }>;
  rows: T[];
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageParam: string;
  queryString: string;
}

export function PaginatedSimpleTable<T extends Record<string, string | number>>({
  title,
  description,
  columns,
  rows,
  page,
  totalPages,
  totalItems,
  pageSize,
  pageParam,
  queryString,
}: PaginatedSimpleTableProps<T>) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      )}
      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-800/80">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-black/50 text-xs uppercase tracking-wide text-zinc-300">
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className="px-4 py-3 font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-zinc-900/40">
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-4 py-3">
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        pageParam={pageParam}
        queryString={queryString}
      />
    </div>
  );
}
