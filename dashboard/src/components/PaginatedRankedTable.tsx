"use client";

import { useState } from "react";

import { EntityDetailModal } from "@/components/EntityDetailModal";
import { Pagination } from "@/components/Pagination";
import type { GroupSuccessStats } from "@/lib/database.types";

interface PaginatedRankedSuccessTableProps {
  title: string;
  description?: string;
  labelHeader: string;
  rows: GroupSuccessStats[];
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageParam: string;
  queryString: string;
  apiFilterQuery: string;
  clickable?: "examiner";
}

export function PaginatedRankedSuccessTable({
  title,
  description,
  labelHeader,
  rows,
  page,
  totalPages,
  totalItems,
  pageSize,
  pageParam,
  queryString,
  apiFilterQuery,
  clickable,
}: PaginatedRankedSuccessTableProps) {
  const [selectedExaminer, setSelectedExaminer] = useState<string | null>(null);

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
              <th className="px-4 py-3 font-semibold">{labelHeader}</th>
              <th className="px-4 py-3 font-semibold">Passed</th>
              <th className="px-4 py-3 font-semibold">Failed</th>
              <th className="px-4 py-3 font-semibold">Attempts</th>
              <th className="px-4 py-3 font-semibold">Success rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {rows.map((row) => (
              <tr
                key={row.label}
                className={
                  clickable === "examiner"
                    ? "cursor-pointer hover:bg-cyan-950/20"
                    : "hover:bg-zinc-900/40"
                }
                onClick={
                  clickable === "examiner"
                    ? () => setSelectedExaminer(row.label)
                    : undefined
                }
              >
                <td className="px-4 py-3 font-medium text-white">
                  {row.label}
                  {clickable === "examiner" && (
                    <span className="ml-2 text-xs font-normal text-zinc-500">
                      View detail
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {row.passedCount.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  {row.failedCount.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  {row.totalAttempts.toLocaleString()}
                </td>
                <td className="px-4 py-3 font-medium text-white">
                  {row.successRate.toFixed(1)}%
                </td>
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

      {selectedExaminer && (
        <EntityDetailModal
          type="examiner"
          name={selectedExaminer}
          filterQuery={apiFilterQuery}
          onClose={() => setSelectedExaminer(null)}
        />
      )}
    </div>
  );
}
