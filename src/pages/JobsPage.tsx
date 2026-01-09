import { useEffect, useState } from "react";
import { adminApi } from "../services/api";
import { useAlert } from "../hooks/useAlert";
import DataTable from "../components/DataTable";
import Pagination from "../components/Pagination";
import { format } from "date-fns";
import type { Job } from "../types";

export default function JobsPage() {
  const { AlertComponent } = useAlert();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadJobs();
  }, [page]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAllJobs({
        page,
        pageSize,
        moderationStatus: "APPROVED", // Solo trabajos aprobados
      });
      if (response.success && response.data) {
        setJobs(response.data.items || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error("Error cargando trabajos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING_PAYMENT: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
          Pendiente Pago
        </span>
      ),
      PENDING: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Pendiente
        </span>
      ),
      APPROVED: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Aprobado
        </span>
      ),
      REJECTED: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Rechazado
        </span>
      ),
      AUTO_REJECTED: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          Auto Rechazado
        </span>
      ),
    };
    return badges[status as keyof typeof badges] || status;
  };

  const getPaymentStatusBadge = (status?: string) => {
    if (!status) return null;
    const badges = {
      PENDING: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Pendiente
        </span>
      ),
      COMPLETED: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Completado
        </span>
      ),
      FAILED: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Fallido
        </span>
      ),
      REFUNDED: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          Reembolsado
        </span>
      ),
    };
    return badges[status as keyof typeof badges] || status;
  };

  const columns = [
    {
      key: "title",
      header: "Título",
      accessor: (job: Job) => job.title,
    },
    {
      key: "empresa",
      header: "Empresa",
      accessor: (job: Job) => job.empresa?.companyName || "N/A",
    },
    {
      key: "location",
      header: "Ubicación",
      accessor: (job: Job) =>
        `${job.location}${job.city ? `, ${job.city}` : ""}`,
    },
    {
      key: "jobType",
      header: "Tipo",
      accessor: (job: Job) => job.jobType,
    },
    {
      key: "moderationStatus",
      header: "Estado Moderación",
      render: (job: Job) => getStatusBadge(job.moderationStatus),
    },
    {
      key: "payment",
      header: "Pago",
      render: (job: Job) => (
        <div className="flex flex-col gap-1">
          {job.isPaid ? (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
              Pagado
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
              No pagado
            </span>
          )}
          {job.paymentStatus && getPaymentStatusBadge(job.paymentStatus)}
          {job.paymentAmount && (
            <span className="text-xs text-gray-600">
              ${job.paymentAmount} {job.paymentCurrency || "USD"}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "applications",
      header: "Aplicaciones",
      accessor: (job: Job) => job.applications?.length || 0,
    },
    {
      key: "publishedAt",
      header: "Publicado",
      render: (job: Job) => format(new Date(job.publishedAt), "dd/MM/yyyy"),
    },
    {
      key: "actions",
      header: "Acciones",
      render: () => (
        <div className="flex space-x-2">
          {/* Los trabajos aprobados no tienen acciones de moderación */}
          {/* Las acciones de aprobar/rechazar están en PendingJobsPage */}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Trabajos Aprobados</h1>
        <div className="text-sm text-gray-600">
          Solo se muestran trabajos aprobados. Para moderar trabajos pendientes,
          ve a{" "}
          <a
            href="/jobs/pending"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Trabajos Pendientes
          </a>
        </div>
      </div>

      <DataTable data={jobs} columns={columns} loading={loading} />
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

      <AlertComponent />
    </div>
  );
}
