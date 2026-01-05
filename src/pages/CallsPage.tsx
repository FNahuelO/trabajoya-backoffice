import { useEffect, useState } from "react";
import { adminApi } from "../services/api";
import DataTable from "../components/DataTable";
import Pagination from "../components/Pagination";
import { format } from "date-fns";
import { Phone } from "lucide-react";

export default function CallsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadCalls();
  }, [page]);

  const loadCalls = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getCalls({
        page,
        pageSize,
      });
      if (response.success && response.data) {
        setCalls(response.data.items || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error("Error cargando llamadas:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeBadge = (userType: string) => {
    const badges = {
      POSTULANTE: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
          Postulante
        </span>
      ),
      EMPRESA: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          Empresa
        </span>
      ),
    };
    return badges[userType as keyof typeof badges] || userType;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      COMPLETED: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Completada
        </span>
      ),
      MISSED: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Perdida
        </span>
      ),
      REJECTED: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          Rechazada
        </span>
      ),
      CANCELLED: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Cancelada
        </span>
      ),
    };
    return badges[status as keyof typeof badges] || status;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const columns = [
    {
      key: "fromUser",
      header: "De",
      render: (call: any) => (
        <div>
          <div className="font-medium">{call.fromUser?.email || "N/A"}</div>
          <div className="text-xs text-gray-500">
            {getUserTypeBadge(call.fromUser?.userType || "")}
          </div>
        </div>
      ),
    },
    {
      key: "toUser",
      header: "Para",
      render: (call: any) => (
        <div>
          <div className="font-medium">{call.toUser?.email || "N/A"}</div>
          <div className="text-xs text-gray-500">
            {getUserTypeBadge(call.toUser?.userType || "")}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (call: any) => getStatusBadge(call.status),
    },
    {
      key: "duration",
      header: "Duración",
      render: (call: any) => formatDuration(call.duration),
    },
    {
      key: "createdAt",
      header: "Fecha",
      render: (call: any) => format(new Date(call.createdAt), "dd/MM/yyyy HH:mm"),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Phone className="h-8 w-8" />
          Llamadas
        </h1>
      </div>

      <DataTable data={calls} columns={columns} loading={loading} />
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

