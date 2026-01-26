import { useEffect, useState } from "react";
import { reportsApi } from "../services/api";
import DataTable from "../components/DataTable";
import Pagination from "../components/Pagination";
import { format } from "date-fns";
import { Flag, CheckCircle, XCircle, Clock } from "lucide-react";

/**
 * Página de moderación de denuncias
 * Requerida por Google Play para cumplir con políticas de seguridad
 */
export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadReports();
    loadStats();
  }, [page, statusFilter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await reportsApi.getAll({
        page,
        pageSize,
        status: statusFilter || undefined,
      });
      if (response.success && response.data) {
        setReports(response.data.reports || []);
        setTotal(response.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Error cargando denuncias:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await reportsApi.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  };

  const handleAction = async (
    action: "review" | "resolve" | "dismiss",
    reportId: string
  ) => {
    try {
      if (action === "review") {
        await reportsApi.markAsReviewed(reportId);
      } else if (action === "resolve") {
        await reportsApi.resolve(reportId);
      } else if (action === "dismiss") {
        await reportsApi.dismiss(reportId);
      }
      loadReports();
      loadStats();
    } catch (error) {
      console.error(`Error en acción ${action}:`, error);
      alert(`Error al ${action === "review" ? "marcar como revisada" : action === "resolve" ? "resolver" : "desestimar"} la denuncia`);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Clock size={12} />
          Pendiente
        </span>
      ),
      REVIEWED: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
          <CheckCircle size={12} />
          Revisada
        </span>
      ),
      RESOLVED: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle size={12} />
          Resuelta
        </span>
      ),
      DISMISSED: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 flex items-center gap-1">
          <XCircle size={12} />
          Desestimada
        </span>
      ),
    };
    return badges[status as keyof typeof badges] || status;
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      SPAM: "Spam",
      INAPPROPRIATE: "Contenido inapropiado",
      FRAUD: "Fraude o estafa",
      HARASSMENT: "Acoso",
      OTHER: "Otro",
    };
    return labels[reason] || reason;
  };

  const getUserName = (user: any) => {
    if (user?.postulante?.fullName) return user.postulante.fullName;
    if (user?.empresa?.companyName) return user.empresa.companyName;
    return user?.email || "N/A";
  };

  const columns = [
    {
      key: "reporter",
      header: "Denunciante",
      render: (report: any) => (
        <div>
          <div className="font-medium">{getUserName(report.reporter)}</div>
          <div className="text-xs text-gray-500">{report.reporter?.email || "N/A"}</div>
        </div>
      ),
    },
    {
      key: "reported",
      header: "Denunciado",
      render: (report: any) => (
        <div>
          <div className="font-medium">{getUserName(report.reported)}</div>
          <div className="text-xs text-gray-500">{report.reported?.email || "N/A"}</div>
        </div>
      ),
    },
    {
      key: "reason",
      header: "Motivo",
      render: (report: any) => (
        <div>
          <div className="font-medium">{getReasonLabel(report.reason)}</div>
          {report.message && (
            <div className="text-xs text-gray-500">Mensaje específico</div>
          )}
        </div>
      ),
    },
    {
      key: "message",
      header: "Mensaje denunciado",
      render: (report: any) => (
        <div className="max-w-md">
          {report.message ? (
            <div
              className="truncate text-sm text-gray-700"
              title={report.message.content}
            >
              {report.message.content || "Sin contenido"}
            </div>
          ) : (
            <span className="text-sm text-gray-400">Usuario denunciado</span>
          )}
        </div>
      ),
    },
    {
      key: "description",
      header: "Descripción",
      render: (report: any) => (
        <div className="max-w-md">
          {report.description ? (
            <div
              className="truncate text-sm text-gray-700"
              title={report.description}
            >
              {report.description}
            </div>
          ) : (
            <span className="text-sm text-gray-400">Sin descripción</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (report: any) => getStatusBadge(report.status),
    },
    {
      key: "createdAt",
      header: "Fecha",
      render: (report: any) => (
        <div className="text-sm text-gray-600">
          {format(new Date(report.createdAt), "dd/MM/yyyy HH:mm")}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (report: any) => (
        <div className="flex gap-2">
          {report.status === "PENDING" && (
            <>
              <button
                onClick={() => handleAction("review", report.id)}
                className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
              >
                Revisar
              </button>
              <button
                onClick={() => handleAction("resolve", report.id)}
                className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
              >
                Resolver
              </button>
              <button
                onClick={() => handleAction("dismiss", report.id)}
                className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Desestimar
              </button>
            </>
          )}
          {report.status !== "PENDING" && (
            <span className="text-xs text-gray-400">
              {report.status === "REVIEWED" && "Revisada"}
              {report.status === "RESOLVED" && "Resuelta"}
              {report.status === "DISMISSED" && "Desestimada"}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Flag className="w-6 h-6" />
          Moderación de Denuncias
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Gestiona las denuncias de usuarios y contenido. Requerido por Google Play.
        </p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-600 font-medium">Pendientes</div>
            <div className="text-2xl font-bold text-yellow-800">{stats.pending || 0}</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium">Revisadas</div>
            <div className="text-2xl font-bold text-blue-800">{stats.reviewed || 0}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium">Resueltas</div>
            <div className="text-2xl font-bold text-green-800">{stats.resolved || 0}</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 font-medium">Total</div>
            <div className="text-2xl font-bold text-gray-800">{stats.total || 0}</div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-4 flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="PENDING">Pendientes</option>
          <option value="REVIEWED">Revisadas</option>
          <option value="RESOLVED">Resueltas</option>
          <option value="DISMISSED">Desestimadas</option>
        </select>
      </div>

      <DataTable columns={columns} data={reports} loading={loading} />
      <Pagination
        currentPage={page}
        totalPages={Math.ceil(total / pageSize)}
        onPageChange={setPage}
      />
    </div>
  );
}

