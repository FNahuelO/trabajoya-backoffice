import { useCallback, useEffect, useState } from "react";
import { adminApi } from "../services/api";
import DataTable from "../components/DataTable";
import type { DataTableQuery } from "../components/DataTable";
import Pagination from "../components/Pagination";
import {
  DateFilter,
  FiltersPanel,
  SearchFilter,
  SelectFilter,
  YES_NO_OPTIONS,
} from "../components/Filters";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { format } from "date-fns";

interface ApplicationsFilters {
  search: string;
  status: string;
  isRead: string;
  appliedFrom: string;
  appliedTo: string;
}

const EMPTY_FILTERS: ApplicationsFilters = {
  search: "",
  status: "",
  isRead: "",
  appliedFrom: "",
  appliedTo: "",
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendientes" },
  { value: "REVIEWED", label: "Revisados" },
  { value: "ACCEPTED", label: "Aceptados" },
  { value: "REJECTED", label: "Rechazados" },
  { value: "INTERVIEW", label: "Entrevista" },
];

function toParam(value: string): string | undefined {
  return value.trim() || undefined;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [tableQuery, setTableQuery] = useState<DataTableQuery>({
    sortBy: null,
    sortOrder: null,
  });
  const [filters, setFilters] = useState<ApplicationsFilters>(EMPTY_FILTERS);
  const debouncedFilters = useDebouncedValue(filters);
  const hasActiveFilters = Object.values(filters).some((value) => value.trim());

  const updateFilter = (key: keyof ApplicationsFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.getApplications({
        page,
        pageSize,
        status: toParam(debouncedFilters.status),
        sortBy: tableQuery.sortBy || undefined,
        sortOrder: tableQuery.sortOrder || undefined,
        search: toParam(debouncedFilters.search),
        isRead: toParam(debouncedFilters.isRead),
        appliedFrom: toParam(debouncedFilters.appliedFrom),
        appliedTo: toParam(debouncedFilters.appliedTo),
      });
      if (response.success && response.data) {
        setApplications(response.data.items || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error("Error cargando aplicaciones:", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, tableQuery.sortBy, tableQuery.sortOrder, debouncedFilters]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Pendiente
        </span>
      ),
      REVIEWED: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          Revisado
        </span>
      ),
      ACCEPTED: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Aceptado
        </span>
      ),
      REJECTED: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Rechazado
        </span>
      ),
      INTERVIEW: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
          Entrevista
        </span>
      ),
    };
    return badges[status as keyof typeof badges] || status;
  };

  const columns = [
    {
      key: "postulante",
      header: "Postulante",
      render: (app: any) => (
        <div>
          <div className="font-medium">{app.postulante?.fullName || "N/A"}</div>
          <div className="text-xs text-gray-500">
            {app.postulante?.user?.email || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "job",
      header: "Trabajo",
      render: (app: any) => (
        <div>
          <div className="font-medium">{app.job?.title || "N/A"}</div>
          <div className="text-xs text-gray-500">
            {app.job?.location || "N/A"}
            {app.job?.city && `, ${app.job.city}`}
          </div>
        </div>
      ),
    },
    {
      key: "empresa",
      header: "Empresa",
      accessor: (app: any) => app.job?.empresa?.companyName || "N/A",
    },
    {
      key: "coverLetter",
      header: "Carta Presentación",
      render: (app: any) => (
        <div className="max-w-xs">
          {app.coverLetter ? (
            <div
              className="truncate text-xs text-gray-600"
              title={app.coverLetter}
            >
              {app.coverLetter.substring(0, 50)}...
            </div>
          ) : (
            <span className="text-gray-400 text-xs">Sin carta</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (app: any) => getStatusBadge(app.status),
    },
    {
      key: "isRead",
      header: "Leído",
      render: (app: any) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            app.isRead
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {app.isRead ? "Sí" : "No"}
        </span>
      ),
    },
    {
      key: "appliedAt",
      header: "Fecha Aplicación",
      render: (app: any) => format(new Date(app.appliedAt), "dd/MM/yyyy HH:mm"),
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Aplicaciones</h1>
        {!loading && (
          <span className="text-sm text-gray-500">{total} resultados</span>
        )}
      </div>

      <FiltersPanel
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          setFilters(EMPTY_FILTERS);
          setPage(1);
        }}
      >
        <SearchFilter
          className="sm:col-span-2"
          value={filters.search}
          onChange={(value) => updateFilter("search", value)}
          placeholder="Postulante, email, título del empleo o empresa"
        />
        <SelectFilter
          label="Estado"
          value={filters.status}
          onChange={(value) => updateFilter("status", value)}
          options={STATUS_OPTIONS}
          allLabel="Todos los estados"
        />
        <SelectFilter
          label="Leída"
          value={filters.isRead}
          onChange={(value) => updateFilter("isRead", value)}
          options={YES_NO_OPTIONS}
          allLabel="Todas"
        />
        <DateFilter
          label="Aplicó desde"
          value={filters.appliedFrom}
          onChange={(value) => updateFilter("appliedFrom", value)}
        />
        <DateFilter
          label="Aplicó hasta"
          value={filters.appliedTo}
          onChange={(value) => updateFilter("appliedTo", value)}
        />
      </FiltersPanel>

      <DataTable
        data={applications}
        columns={columns}
        loading={loading}
        serverSide
        onQueryChange={(query) => {
          setTableQuery(query);
          setPage(1);
        }}
      />
      {!loading && total > 0 && (
        <div className="mt-4">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
