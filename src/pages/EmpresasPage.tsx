import { useEffect, useState } from "react";
import { adminApi } from "../services/api";
import DataTable from "../components/DataTable";
import Pagination from "../components/Pagination";
import { format } from "date-fns";

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadEmpresas();
  }, [page]);

  const loadEmpresas = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getEmpresas({ page, pageSize });
      if (response.success && response.data) {
        setEmpresas(response.data.items || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error("Error cargando empresas:", error);
    } finally {
      setLoading(false);
    }
  };

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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Empresas</h1>

      <DataTable data={empresas} columns={columns} loading={loading} />
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
