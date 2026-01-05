import { useEffect, useState } from "react";
import { adminApi } from "../services/api";
import DataTable from "../components/DataTable";
import Pagination from "../components/Pagination";
import { format } from "date-fns";

export default function PostulantesPage() {
  const [postulantes, setPostulantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadPostulantes();
  }, [page]);

  const loadPostulantes = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getPostulantes({ page, pageSize });
      if (response.success && response.data) {
        setPostulantes(response.data.items || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error("Error cargando postulantes:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "fullName",
      header: "Nombre",
      accessor: (postulante: any) => postulante.fullName,
    },
    {
      key: "email",
      header: "Email",
      accessor: (postulante: any) => postulante.user?.email || "N/A",
    },
    {
      key: "location",
      header: "Ubicación",
      render: (postulante: any) => {
        const parts = [
          postulante.city,
          postulante.province,
          postulante.country,
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : "N/A";
      },
    },
    {
      key: "phone",
      header: "Teléfono",
      accessor: (postulante: any) => postulante.phone || "N/A",
    },
    {
      key: "resumeTitle",
      header: "Título Profesional",
      accessor: (postulante: any) => postulante.resumeTitle || "N/A",
    },
    {
      key: "skills",
      header: "Skills",
      render: (postulante: any) => {
        const skills = postulante.normalizedSkills || postulante.skills || [];
        return (
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 3).map((skill: string, idx: number) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
              >
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{skills.length - 3}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "experience",
      header: "Experiencia",
      render: (postulante: any) => {
        const expCount = postulante.experiences?.length || 0;
        const eduCount = postulante.education?.length || 0;
        const certCount = postulante.certifications?.length || 0;
        return (
          <div className="text-xs">
            <div>Exp: {expCount}</div>
            <div>Edu: {eduCount}</div>
            <div>Cert: {certCount}</div>
          </div>
        );
      },
    },
    {
      key: "cv",
      header: "CV",
      render: (postulante: any) => (
        <div className="flex flex-col gap-1">
          {postulante.cvUrl ? (
            <a
              href={postulante.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-xs"
            >
              Ver CV
            </a>
          ) : (
            <span className="text-gray-400 text-xs">Sin CV</span>
          )}
          {postulante.videoUrl && (
            <a
              href={postulante.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline text-xs"
            >
              Ver Video
            </a>
          )}
        </div>
      ),
    },
    {
      key: "isVerified",
      header: "Verificado",
      render: (postulante: any) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            postulante.user?.isVerified
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {postulante.user?.isVerified ? "Sí" : "No"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Fecha Creación",
      render: (postulante: any) =>
        postulante.user?.createdAt
          ? format(new Date(postulante.user.createdAt), "dd/MM/yyyy")
          : "N/A",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Postulantes</h1>

      <DataTable data={postulantes} columns={columns} loading={loading} />
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
