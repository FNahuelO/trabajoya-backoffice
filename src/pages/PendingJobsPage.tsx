import { useEffect, useState } from "react";
import { moderationApi } from "../services/api";
import { useAlert } from "../hooks/useAlert";
import DataTable from "../components/DataTable";
import Pagination from "../components/Pagination";
import { format } from "date-fns";
import { CheckCircle, XCircle } from "lucide-react";
import type { Job } from "../types";

export default function PendingJobsPage() {
  const { showAlert, showConfirm, AlertComponent } = useAlert();
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [jobToReject, setJobToReject] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadPendingJobs();
  }, [page]);

  const loadPendingJobs = async () => {
    setLoading(true);
    try {
      const response = await moderationApi.getPendingJobs(page, pageSize);
      if (response.success && response.data) {
        // El backend devuelve { jobs: [...], pagination: { total, page, pageSize, totalPages } }
        setJobs(response.data.jobs || []);
        setTotal(response.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Error cargando trabajos pendientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    showConfirm({
      title: "Confirmar aprobación",
      message: "¿Estás seguro de aprobar este trabajo?",
      confirmText: "Aprobar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          await moderationApi.approveJob(id);
          loadPendingJobs();
        } catch (error) {
          showAlert({
            title: "Error",
            message: "Error al aprobar el trabajo",
          });
        }
      },
    });
  };

  const handleReject = async (id: string) => {
    setJobToReject(id);
    setRejectReason("");
    setShowRejectDialog(true);
  };

  const confirmReject = async () => {
    if (!jobToReject || !rejectReason.trim()) {
      showAlert({
        title: "Campo requerido",
        message: "Por favor ingresa una razón para el rechazo",
      });
      return;
    }
    try {
      await moderationApi.rejectJob(jobToReject, rejectReason);
      setShowRejectDialog(false);
      setJobToReject(null);
      setRejectReason("");
      loadPendingJobs();
    } catch (error) {
      showAlert({
        title: "Error",
        message: "Error al rechazar el trabajo",
      });
    }
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
      key: "category",
      header: "Categoría",
      accessor: (job: Job) => job.category,
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
        </div>
      ),
    },
    {
      key: "publishedAt",
      header: "Publicado",
      render: (job: Job) => format(new Date(job.publishedAt), "dd/MM/yyyy"),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (job: Job) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleApprove(job.id);
            }}
            className="text-green-600 hover:text-green-800"
            title="Aprobar"
          >
            <CheckCircle className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReject(job.id);
            }}
            className="text-red-600 hover:text-red-800"
            title="Rechazar"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Trabajos Pendientes de Moderación
      </h1>

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

      {/* Dialog para razón de rechazo */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Razón del rechazo
            </h2>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              rows={4}
              placeholder="Ingresa la razón del rechazo..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectDialog(false);
                  setJobToReject(null);
                  setRejectReason("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertComponent />
    </div>
  );
}
