import { useEffect, useState } from "react";
import { adminApi, moderationApi } from "../services/api";
import { useAlert } from "../hooks/useAlert";
import DataTable from "../components/DataTable";
import Pagination from "../components/Pagination";
import JobDetailModal from "../components/JobDetailModal";
import { format } from "date-fns";
import { Filter } from "lucide-react";
import type { Job } from "../types";

type ModerationFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "AUTO_REJECTED" | "PENDING_PAYMENT";

export default function JobsPage() {
  const { showAlert, showConfirm, AlertComponent } = useAlert();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<ModerationFilter>("ALL");

  // Estado para el modal de detalle
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);


  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    if (filter === "PENDING") {
      loadPendingJobs();
    } else {
      loadJobs();
    }
  }, [page, filter]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize };
      if (filter !== "ALL") {
        params.moderationStatus = filter;
      }
      const response = await adminApi.getAllJobs(params);
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

  const loadPendingJobs = async () => {
    setLoading(true);
    try {
      const response = await moderationApi.getPendingJobs(page, pageSize);
      if (response.success && response.data) {
        setJobs(response.data.jobs || []);
        setTotal(response.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Error cargando trabajos pendientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const reloadJobs = () => {
    if (filter === "PENDING") {
      loadPendingJobs();
    } else {
      loadJobs();
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
          reloadJobs();
        } catch (error) {
          showAlert({
            title: "Error",
            message: "Error al aprobar el trabajo",
          });
        }
      },
    });
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await moderationApi.rejectJob(id, reason);
      setSelectedJob(null);
      reloadJobs();
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
      accessor: (job: Job) => job.location || "N/A",
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

  ];

  const filterOptions: { value: ModerationFilter; label: string }[] = [
    { value: "ALL", label: "Todos" },
    { value: "PENDING", label: "Pendientes" },
    { value: "APPROVED", label: "Aprobados" },
    { value: "REJECTED", label: "Rechazados" },
    { value: "AUTO_REJECTED", label: "Auto Rechazados" },
    { value: "PENDING_PAYMENT", label: "Pendiente Pago" },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Trabajos</h1>

        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ModerationFilter)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filter === "PENDING" && jobs.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          Estos trabajos requieren moderación. Podés aprobar o rechazar cada uno desde las acciones.
        </div>
      )}

      <DataTable
        data={jobs}
        columns={columns}
        loading={loading}
        onRowClick={(job) => setSelectedJob(job)}
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

      {/* Modal de detalle del trabajo */}
      <JobDetailModal
        visible={!!selectedJob}
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onApprove={(id) => {
          setSelectedJob(null);
          handleApprove(id);
        }}
        onReject={(id, reason) => {
          handleReject(id, reason);
        }}
      />

      <AlertComponent />
    </div>
  );
}

