import { useEffect, useState } from "react";
import { optionsApi } from "../services/api";
import { Settings } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface OptionsData {
  [category: string]: Option[];
}

const categoryLabels: Record<string, string> = {
  jobTypes: "Tipos de Trabajo",
  experienceLevels: "Niveles de Experiencia",
  applicationStatuses: "Estados de Aplicación",
  modalities: "Modalidades",
  languageLevels: "Niveles de Idioma",
  companySizes: "Tamaños de Empresa",
  sectors: "Sectores",
  studyTypes: "Tipos de Estudio",
  studyStatuses: "Estados de Estudio",
  maritalStatuses: "Estados Civiles",
};

export default function OptionsPage() {
  const [options, setOptions] = useState<OptionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [language, setLanguage] = useState("es");

  useEffect(() => {
    loadOptions();
  }, [language]);

  const loadOptions = async () => {
    setLoading(true);
    try {
      const response = await optionsApi.getAll(language);
      if (response.success) {
        setOptions(response.data);
      }
    } catch (error) {
      console.error("Error cargando opciones:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!options) {
    return (
      <div className="text-center text-gray-500">Error cargando opciones</div>
    );
  }

  const categories = Object.keys(options);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Opciones del Sistema
        </h1>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Idioma:</label>
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              setSelectedCategory(null);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="pt">Português</option>
          </select>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Settings className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
          <div>
            <h3 className="font-semibold text-yellow-800 mb-1">Información</h3>
            <p className="text-sm text-yellow-700">
              Las opciones del sistema se gestionan desde los archivos de
              traducción (i18n). Esta vista es solo de lectura y muestra las
              opciones disponibles en el idioma seleccionado.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de categorías */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Categorías
            </h2>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {categoryLabels[category] || category}
                  <span className="text-xs text-gray-500 ml-2">
                    ({options[category].length})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detalles de la categoría seleccionada */}
        <div className="lg:col-span-2">
          {selectedCategory ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {categoryLabels[selectedCategory] || selectedCategory}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options[selectedCategory].map((option) => (
                  <div
                    key={option.value}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-mono text-sm text-gray-500 mb-1">
                      {option.value}
                    </div>
                    <div className="font-medium text-gray-900">
                      {option.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Selecciona una categoría para ver sus opciones
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
