import { useEffect, useState } from "react";
import { termsApi } from "../services/api";
import DataTable from "../components/DataTable";
import { format } from "date-fns";
import { Upload, CheckCircle, XCircle, Eye } from "lucide-react";

interface Terms {
  id: string;
  type: "POSTULANTE" | "EMPRESA" | "PRIVACY";
  version: string;
  fileUrl: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    acceptances: number;
  };
}

const typeLabels: Record<string, string> = {
  POSTULANTE: "Postulante",
  EMPRESA: "Empresa",
  PRIVACY: "Privacidad",
};

export default function TermsPage() {
  const [terms, setTerms] = useState<Terms[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    type: "POSTULANTE" as "POSTULANTE" | "EMPRESA" | "PRIVACY",
    version: "",
    description: "",
  });

  useEffect(() => {
    loadTerms();
  }, [filterType]);

  const loadTerms = async () => {
    setLoading(true);
    try {
      const response = await termsApi.getAll(filterType || undefined);
      if (response.success) {
        setTerms(response.data);
      }
    } catch (error) {
      console.error("Error cargando términos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.version || !uploadForm.type) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    setUploading(true);
    try {
      await termsApi.upload(
        uploadForm.file,
        uploadForm.type,
        uploadForm.version,
        uploadForm.description || undefined
      );
      alert("Términos subidos correctamente");
      setShowUploadModal(false);
      setUploadForm({
        file: null,
        type: "POSTULANTE",
        version: "",
        description: "",
      });
      loadTerms();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Error al subir los términos y condiciones"
      );
    } finally {
      setUploading(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      POSTULANTE: "bg-purple-100 text-purple-800",
      EMPRESA: "bg-blue-100 text-blue-800",
      PRIVACY: "bg-green-100 text-green-800",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }`}
      >
        {typeLabels[type] || type}
      </span>
    );
  };

  const columns = [
    {
      key: "type",
      header: "Tipo",
      render: (term: Terms) => getTypeBadge(term.type),
    },
    {
      key: "version",
      header: "Versión",
      accessor: (term: Terms) => term.version,
    },
    {
      key: "isActive",
      header: "Estado",
      render: (term: Terms) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            term.isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {term.isActive ? (
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Activo
            </span>
          ) : (
            "Inactivo"
          )}
        </span>
      ),
    },
    {
      key: "description",
      header: "Descripción",
      render: (term: Terms) => (
        <div className="max-w-md">
          {term.description ? (
            <span className="text-sm text-gray-700">{term.description}</span>
          ) : (
            <span className="text-gray-400 text-sm">Sin descripción</span>
          )}
        </div>
      ),
    },
    {
      key: "acceptances",
      header: "Aceptaciones",
      render: (term: Terms) => (
        <span className="text-sm text-gray-600">
          {term._count?.acceptances || 0}
        </span>
      ),
    },
    {
      key: "fileUrl",
      header: "Archivo",
      render: (term: Terms) => (
        <a
          href={term.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <Eye className="h-4 w-4" />
          Ver PDF
        </a>
      ),
    },
    {
      key: "createdAt",
      header: "Fecha Creación",
      render: (term: Terms) =>
        format(new Date(term.createdAt), "dd/MM/yyyy HH:mm"),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Términos y Condiciones
        </h1>
        <div className="flex items-center gap-4">
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            <option value="POSTULANTE">Postulante</option>
            <option value="EMPRESA">Empresa</option>
            <option value="PRIVACY">Privacidad</option>
          </select>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="h-5 w-5" />
            Subir Nuevos Términos
          </button>
        </div>
      </div>

      <DataTable data={terms} columns={columns} loading={loading} />

      {/* Modal de subida */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Subir Términos y Condiciones
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  value={uploadForm.type}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      type: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="POSTULANTE">Postulante</option>
                  <option value="EMPRESA">Empresa</option>
                  <option value="PRIVACY">Privacidad</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Versión * (ej: 1.0.0)
                </label>
                <input
                  type="text"
                  value={uploadForm.version}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, version: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="1.0.0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Archivo PDF *
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      file: e.target.files?.[0] || null,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descripción de los cambios en esta versión..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={uploading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={uploading}
                >
                  {uploading ? "Subiendo..." : "Subir"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
