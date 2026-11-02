import { cn } from "@/lib/cn";

export type DataColumn<Key extends string> = {
  key: Key;
  label: string;
  /** Width on large screens, e.g. `w-1/4`. */
  className?: string;
};

type DataTableProps<Key extends string> = {
  caption: string;
  columns: DataColumn<Key>[];
  rows: Record<Key, string>[];
};

/**
 * A real table on large screens. On small screens each row becomes a card:
 * the first cell is its title and the other cells get their column label, so nothing scrolls sideways.
 */
export function DataTable<Key extends string>({ caption, columns, rows }: DataTableProps<Key>) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <table className="w-full border-collapse text-start text-sm leading-6 max-md:block">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-neutral-50 max-md:hidden">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn("border-b border-border px-4 py-3 text-start font-bold text-fg", column.className)}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border max-md:block">
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="align-top max-md:flex max-md:flex-col max-md:gap-3 max-md:p-4 print:break-inside-avoid"
            >
              {columns.map((column, columnIndex) =>
                columnIndex === 0 ? (
                  <th
                    key={column.key}
                    scope="row"
                    className="px-4 py-3.5 text-start font-bold text-fg max-md:p-0 max-md:text-base"
                  >
                    {row[column.key]}
                  </th>
                ) : (
                  <td key={column.key} className="px-4 py-3.5 text-fg-muted max-md:p-0 max-md:text-fg">
                    <span className="block text-xs font-bold text-fg-muted md:hidden">{column.label}</span>
                    {row[column.key]}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
