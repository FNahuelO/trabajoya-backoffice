import { useEffect, useState } from "react";
import { adminApi } from "../services/api";
import DataTable from "../components/DataTable";
import Pagination from "../components/Pagination";
import { format } from "date-fns";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    loadApplications();
  }, [page, status]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getApplications({
        page,
        pageSize,
        status: status || undefined,
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
  };

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Aplicaciones</h1>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="PENDING">Pendientes</option>
          <option value="REVIEWED">Revisados</option>
          <option value="ACCEPTED">Aceptados</option>
          <option value="REJECTED">Rechazados</option>
          <option value="INTERVIEW">Entrevista</option>
        </select>
      </div>

      <DataTable data={applications} columns={columns} loading={loading} />
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
