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
  TextFilter,
  YES_NO_OPTIONS,
} from "../components/Filters";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { format } from "date-fns";

interface EmpresasFilters {
  search: string;
  provincia: string;
  verified: string;
  hasActiveSubscription: string;
  createdFrom: string;
  createdTo: string;
}

const EMPTY_FILTERS: EmpresasFilters = {
  search: "",
  provincia: "",
  verified: "",
  hasActiveSubscription: "",
  createdFrom: "",
  createdTo: "",
};

function toParam(value: string): string | undefined {
  return value.trim() || undefined;
}

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [tableQuery, setTableQuery] = useState<DataTableQuery>({
    sortBy: null,
    sortOrder: null,
  });
  const [filters, setFilters] = useState<EmpresasFilters>(EMPTY_FILTERS);
  const debouncedFilters = useDebouncedValue(filters);
  const hasActiveFilters = Object.values(filters).some((value) => value.trim());

  const updateFilter = (key: keyof EmpresasFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const loadEmpresas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.getEmpresas({
        page,
        pageSize,
        sortBy: tableQuery.sortBy || undefined,
        sortOrder: tableQuery.sortOrder || undefined,
        search: toParam(debouncedFilters.search),
        provincia: toParam(debouncedFilters.provincia),
        verified: toParam(debouncedFilters.verified),
        hasActiveSubscription: toParam(debouncedFilters.hasActiveSubscription),
        createdFrom: toParam(debouncedFilters.createdFrom),
        createdTo: toParam(debouncedFilters.createdTo),
      });
      if (response.success && response.data) {
        setEmpresas(response.data.items || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error("Error cargando empresas:", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, tableQuery.sortBy, tableQuery.sortOrder, debouncedFilters]);

  useEffect(() => {
    loadEmpresas();
  }, [loadEmpresas]);

  const columns = [
    {
      key: "companyName",
      header: "Nombre",
      accessor: (empresa: any) => empresa.companyName,
    },
    {
      key: "razonSocial",
      header: "Razón Social",
      accessor: (empresa: any) => empresa.razonSocial || "N/A",
    },
    {
      key: "cuit",
      header: "CUIT",
      accessor: (empresa: any) => empresa.cuit,
    },
    {
      key: "email",
      header: "Email",
      accessor: (empresa: any) => empresa.email,
    },
    {
      key: "phone",
      header: "Teléfono",
      accessor: (empresa: any) => empresa.phone || "N/A",
    },
    {
      key: "sector",
      header: "Sector",
      accessor: (empresa: any) => empresa.sector || empresa.industria || "N/A",
    },
    {
      key: "location",
      header: "Ubicación",
      render: (empresa: any) => {
        const parts = [
          empresa.ciudad || empresa.localidad,
          empresa.provincia,
          empresa.pais,
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : "N/A";
      },
    },
    {
      key: "subscription",
      header: "Suscripción",
      render: (empresa: any) => {
        const sub = empresa.subscriptions?.[0];
        if (!sub) return <span className="text-gray-400">Sin suscripción</span>;
        return (
          <div className="flex flex-col gap-1">
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                sub.planType === "ENTERPRISE"
                  ? "bg-purple-100 text-purple-800"
                  : sub.planType === "PREMIUM"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {sub.planType}
            </span>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                sub.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : sub.status === "EXPIRED"
                  ? "bg-gray-100 text-gray-800"
                  : sub.status === "CANCELED"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {sub.status}
            </span>
          </div>
        );
      },
    },
    {
      key: "isVerified",
      header: "Verificado",
      render: (empresa: any) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            empresa.user?.isVerified
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {empresa.user?.isVerified ? "Sí" : "No"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Fecha Creación",
      render: (empresa: any) =>
        empresa.user?.createdAt
          ? format(new Date(empresa.user.createdAt), "dd/MM/yyyy")
          : "N/A",
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>
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
          placeholder="Nombre, razón social, CUIT, email, teléfono o contacto"
        />
        <TextFilter
          label="Provincia"
          value={filters.provincia}
          onChange={(value) => updateFilter("provincia", value)}
          placeholder="Ej: Buenos Aires"
        />
        <SelectFilter
          label="Verificada"
          value={filters.verified}
          onChange={(value) => updateFilter("verified", value)}
          options={YES_NO_OPTIONS}
          allLabel="Todas"
        />
        <SelectFilter
          label="Suscripción activa"
          value={filters.hasActiveSubscription}
          onChange={(value) => updateFilter("hasActiveSubscription", value)}
          options={YES_NO_OPTIONS}
          allLabel="Todas"
        />
        <DateFilter
          label="Registrada desde"
          value={filters.createdFrom}
          onChange={(value) => updateFilter("createdFrom", value)}
        />
        <DateFilter
          label="Registrada hasta"
          value={filters.createdTo}
          onChange={(value) => updateFilter("createdTo", value)}
        />
      </FiltersPanel>

      <DataTable
        data={empresas}
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
