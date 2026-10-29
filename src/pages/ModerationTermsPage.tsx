import { useEffect, useMemo, useState } from "react";
import { moderationApi } from "../services/api";
import type {
  ModerationAnalysis,
  ModerationTerm,
  ModerationTermCategory,
} from "../types";
import {
  CheckCircle,
  FlaskConical,
  Plus,
  ShieldAlert,
  Trash2,
  XCircle,
} from "lucide-react";

const CATEGORIES: Array<{
  value: ModerationTermCategory;
  label: string;
  className: string;
}> = [
  { value: "SCAM", label: "Estafa", className: "bg-orange-100 text-orange-800" },
  { value: "EXPLOITATION", label: "Explotación laboral", className: "bg-yellow-100 text-yellow-800" },
  { value: "DISCRIMINATION", label: "Discriminación", className: "bg-purple-100 text-purple-800" },
  { value: "OFFENSIVE", label: "Ofensivo", className: "bg-red-100 text-red-800" },
  { value: "INAPPROPRIATE", label: "Oferta inapropiada", className: "bg-pink-100 text-pink-800" },
];

const categoryInfo = (value: ModerationTermCategory) =>
  CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[0];

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || fallback;

export default function ModerationTermsPage() {
  const [terms, setTerms] = useState<ModerationTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [newTerm, setNewTerm] = useState("");
  const [newCategory, setNewCategory] =
    useState<ModerationTermCategory>("DISCRIMINATION");
  const [saving, setSaving] = useState(false);

  const [testData, setTestData] = useState({
    title: "",
    description: "",
    requirements: "",
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ModerationAnalysis | null>(null);

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    setLoading(true);
    try {
      const response = await moderationApi.listTerms();
      if (response.success) {
        setTerms(response.data);
      }
    } catch (error) {
      console.error("Error cargando términos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTerms = useMemo(() => {
    const q = search.trim().toLowerCase();
    return terms.filter(
      (t) =>
        (!categoryFilter || t.category === categoryFilter) &&
        (!q || t.term.toLowerCase().includes(q))
    );
  }, [terms, search, categoryFilter]);

  const handleCreate = async () => {
    if (newTerm.trim().length < 2) {
      alert("Escribí una palabra o frase de al menos 2 caracteres");
      return;
    }
    setSaving(true);
    try {
      await moderationApi.createTerm({ term: newTerm, category: newCategory });
      setNewTerm("");
      loadTerms();
    } catch (error) {
      alert(getErrorMessage(error, "Error al agregar el término"));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (term: ModerationTerm) => {
    try {
      await moderationApi.updateTerm(term.id, { active: !term.active });
      loadTerms();
    } catch (error) {
      alert(getErrorMessage(error, "Error al actualizar el término"));
    }
  };

  const handleChangeCategory = async (
    term: ModerationTerm,
    category: ModerationTermCategory
  ) => {
    try {
      await moderationApi.updateTerm(term.id, { category });
      loadTerms();
    } catch (error) {
      alert(getErrorMessage(error, "Error al actualizar el término"));
    }
  };

  const handleDelete = async (term: ModerationTerm) => {
    if (!confirm(`¿Eliminar "${term.term}" del filtro?`)) return;
    try {
      await moderationApi.deleteTerm(term.id);
      loadTerms();
    } catch (error) {
      alert(getErrorMessage(error, "Error al eliminar el término"));
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const response = await moderationApi.testContent(testData);
      if (response.success) {
        setTestResult(response.data);
      }
    } catch (error) {
      alert(getErrorMessage(error, "Error al probar el texto"));
    } finally {
      setTesting(false);
    }
  };

  const activeCount = terms.filter((t) => t.active).length;
  const inputClass =
    "w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Filtro de avisos</h1>
        <p className="text-gray-600 mt-1">
          {activeCount} términos activos. Si un aviso contiene alguno, se
          rechaza automáticamente y la empresa ve el motivo. Se ignoran
          mayúsculas y tildes, y solo coinciden palabras completas.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Agregar término
        </h2>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder='Palabra o frase, ej: "solo hombres"'
            className={inputClass}
          />
          <select
            value={newCategory}
            onChange={(e) =>
              setNewCategory(e.target.value as ModerationTermCategory)
            }
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            {saving ? "Agregando..." : "Agregar"}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar término..."
          className={inputClass}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredTerms.length === 0 ? (
        <div className="text-center py-12">
          <ShieldAlert className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay términos
          </h3>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Término
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTerms.map((term) => (
                <tr key={term.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">
                    {term.term}
                  </td>
                  <td className="px-6 py-3">
                    <select
                      value={term.category}
                      onChange={(e) =>
                        handleChangeCategory(
                          term,
                          e.target.value as ModerationTermCategory
                        )
                      }
                      className={`text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer ${
                        categoryInfo(term.category).className
                      }`}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => handleToggleActive(term)}
                      title={term.active ? "Desactivar" : "Activar"}
                      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                        term.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {term.active ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Activo
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactivo
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => handleDelete(term)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <FlaskConical className="h-4 w-4" />
          Probar un aviso
        </h2>
        <div className="space-y-3">
          <input
            type="text"
            value={testData.title}
            onChange={(e) => setTestData({ ...testData, title: e.target.value })}
            placeholder="Título"
            className={inputClass}
          />
          <textarea
            value={testData.description}
            onChange={(e) =>
              setTestData({ ...testData, description: e.target.value })
            }
            placeholder="Descripción"
            rows={3}
            className={inputClass}
          />
          <textarea
            value={testData.requirements}
            onChange={(e) =>
              setTestData({ ...testData, requirements: e.target.value })
            }
            placeholder="Requisitos"
            rows={2}
            className={inputClass}
          />
          <button
            onClick={handleTest}
            disabled={testing}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50"
          >
            {testing ? "Analizando..." : "Analizar"}
          </button>
        </div>

        {testResult && (
          <div
            className={`mt-4 rounded-lg p-4 ${
              testResult.isApproved
                ? "bg-green-50 text-green-900"
                : "bg-red-50 text-red-900"
            }`}
          >
            <p className="font-semibold">
              {testResult.isApproved
                ? "Pasa el filtro"
                : "Se rechazaría automáticamente"}{" "}
              (puntaje {testResult.score})
            </p>
            {testResult.reasons.length > 0 && (
              <ul className="list-disc ml-5 mt-2 text-sm">
                {testResult.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}
            {testResult.suggestions && testResult.suggestions.length > 0 && (
              <p className="mt-2 text-sm opacity-80">
                Sugerencias: {testResult.suggestions.join(". ")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
