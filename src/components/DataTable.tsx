import { ReactNode, useEffect, useMemo, useRef, useState } from "react";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  accessor?: (item: T) => any;
  sortable?: boolean;
}

export interface DataTableQuery {
  sortBy: string | null;
  sortOrder: "asc" | "desc" | null;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
  serverSide?: boolean;
  onQueryChange?: (query: DataTableQuery) => void;
}

export default function DataTable<T extends { id: string }>({
  data,
  columns,
  loading,
  onRowClick,
  serverSide = false,
  onQueryChange,
}: DataTableProps<T>) {
  type SortDirection = "asc" | "desc" | null;
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const lastEmittedQueryRef = useRef<string>("");
  const onQueryChangeRef = useRef(onQueryChange);

  useEffect(() => {
    onQueryChangeRef.current = onQueryChange;
  }, [onQueryChange]);

  useEffect(() => {
    if (!onQueryChangeRef.current) return;
    const nextQuery: DataTableQuery = {
      sortBy: sortKey,
      sortOrder: sortDirection,
    };
    const serializedQuery = JSON.stringify(nextQuery);
    if (serializedQuery === lastEmittedQueryRef.current) return;
    lastEmittedQueryRef.current = serializedQuery;
    onQueryChangeRef.current(nextQuery);
  }, [sortDirection, sortKey]);

  const filteredData = useMemo(
    () => {
      if (serverSide) return data;
      return data;
    },
    [data, serverSide]
  );

  const sortedData = useMemo(() => {
    if (serverSide) return filteredData;
    if (!sortKey || !sortDirection) return filteredData;

    const selectedColumn = columns.find((column) => column.key === sortKey);
    if (!selectedColumn) return filteredData;

    const getColumnValue = (item: T) => {
      if (selectedColumn.accessor) {
        return selectedColumn.accessor(item);
      }
      return (item as any)[selectedColumn.key];
    };

    return [...filteredData].sort((a, b) => {
      const aValue = getColumnValue(a);
      const bValue = getColumnValue(b);

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Ordena fechas válidas cronológicamente.
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      const isDateComparable =
        !Number.isNaN(aDate.getTime()) && !Number.isNaN(bDate.getTime());
      if (isDateComparable) {
        const dateComparison = aDate.getTime() - bDate.getTime();
        return sortDirection === "asc" ? dateComparison : -dateComparison;
      }

      // Fallback genérico para strings/números.
      const compared = String(aValue).localeCompare(String(bValue), "es", {
        sensitivity: "base",
        numeric: true,
      });
      return sortDirection === "asc" ? compared : -compared;
    });
  }, [columns, filteredData, serverSide, sortDirection, sortKey]);

  const handleSort = (column: Column<T>) => {
    const isSortable = column.sortable !== false;
    if (!isSortable) return;

    if (sortKey !== column.key) {
      setSortKey(column.key);
      setSortDirection("asc");
      return;
    }

    if (sortDirection === "asc") {
      setSortDirection("desc");
      return;
    }

    if (sortDirection === "desc") {
      setSortKey(null);
      setSortDirection(null);
      return;
    }

    setSortDirection("asc");
  };

  const getSortIndicator = (columnKey: string) => {
    if (sortKey !== columnKey || !sortDirection) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No hay datos disponibles
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable === false ? "" : "cursor-pointer select-none"
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {column.header}
                    {column.sortable === false ? null : (
                      <span className="text-gray-400">{getSortIndicator(column.key)}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No hay resultados para los filtros seleccionados
                </td>
              </tr>
            ) : (
              sortedData.map((item) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={`hover:bg-gray-50 ${onRowClick ? "cursor-pointer" : ""
                  }`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {column.render
                      ? column.render(item)
                      : column.accessor
                        ? column.accessor(item)
                        : (item as any)[column.key]}
                  </td>
                ))}
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}
