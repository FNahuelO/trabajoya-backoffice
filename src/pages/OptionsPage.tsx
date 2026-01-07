import { useEffect, useState } from "react";
import { optionsApi } from "../services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Search,
  X,
} from "lucide-react";

type OptionCategory =
  | "jobTypes"
  | "experienceLevels"
  | "applicationStatuses"
  | "modalities"
  | "languageLevels"
  | "companySizes"
  | "sectors"
  | "studyTypes"
  | "studyStatuses"
  | "maritalStatuses";

const categoryToCatalogType: Record<OptionCategory, string> = {
  jobTypes: "JOB_TYPES",
  experienceLevels: "EXPERIENCE_LEVELS",
  applicationStatuses: "APPLICATION_STATUSES",
  modalities: "MODALITIES",
  languageLevels: "LANGUAGE_LEVELS",
  companySizes: "COMPANY_SIZES",
  sectors: "SECTORS",
  studyTypes: "STUDY_TYPES",
  studyStatuses: "STUDY_STATUSES",
  maritalStatuses: "MARITAL_STATUSES",
};

const categoryLabels: Record<OptionCategory, string> = {
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

interface Option {
  id: string;
  type: string;
  code: string;
  isActive: boolean;
  order: number;
  translations: Array<{
    id: string;
    lang: "ES" | "EN" | "PT";
    label: string;
  }>;
}

interface OptionFormData {
  code: string;
  translations: {
    es: string;
    en: string;
    pt: string;
  };
  isActive: boolean;
}

export default function OptionsPage() {
  const [activeTab, setActiveTab] = useState<OptionCategory>("jobTypes");
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<Option | null>(null);
  const [formData, setFormData] = useState<OptionFormData>({
    code: "",
    translations: { es: "", en: "", pt: "" },
    isActive: true,
  });

  useEffect(() => {
    loadOptions();
  }, [activeTab, search, page]);

  const loadOptions = async () => {
    setLoading(true);
    try {
      const response = await optionsApi.list({
        category: activeTab,
        search: search || undefined,
        page,
        pageSize: 20,
      });
      if (response.success && response.data) {
        setOptions(response.data.items || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error cargando opciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingOption(null);
    setFormData({
      code: "",
      translations: { es: "", en: "", pt: "" },
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (option: Option) => {
    setEditingOption(option);
    setFormData({
      code: option.code,
      translations: {
        es: option.translations.find((t) => t.lang === "ES")?.label || "",
        en: option.translations.find((t) => t.lang === "EN")?.label || "",
        pt: option.translations.find((t) => t.lang === "PT")?.label || "",
      },
      isActive: option.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingOption) {
        await optionsApi.update(editingOption.id, {
          translations: formData.translations,
          isActive: formData.isActive,
        });
      } else {
        await optionsApi.create({
          type: categoryToCatalogType[activeTab],
          code: formData.code,
          translations: formData.translations,
          isActive: formData.isActive,
        });
      }
      setIsDialogOpen(false);
      loadOptions();
    } catch (error: any) {
      alert(
        error.response?.data?.message || "Error al guardar la opción"
      );
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await optionsApi.toggleActive(id);
      loadOptions();
    } catch (error) {
      console.error("Error cambiando estado:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta opción?")) return;
    try {
      await optionsApi.delete(id);
      loadOptions();
    } catch (error) {
      console.error("Error eliminando opción:", error);
    }
  };

  const handleMove = async (option: Option, direction: "up" | "down") => {
    const currentIndex = options.findIndex((o) => o.id === option.id);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= options.length) return;

    const targetOption = options[newIndex];
    const items = options.map((o) => {
      if (o.id === option.id) {
        return { id: o.id, order: targetOption.order };
      }
      if (o.id === targetOption.id) {
        return { id: o.id, order: option.order };
      }
      return { id: o.id, order: o.order };
    });

    try {
      await optionsApi.reorder(items);
      loadOptions();
    } catch (error) {
      console.error("Error reordenando:", error);
    }
  };

  const getTranslation = (option: Option, lang: "ES" | "EN" | "PT") => {
    return option.translations.find((t) => t.lang === lang)?.label || "-";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Opciones del Sistema
        </h1>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Opción
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as OptionCategory);
          setPage(1);
          setSearch("");
        }}
      >
        <TabsList>
          <TabsTrigger value="jobTypes">Tipos de Trabajo</TabsTrigger>
          <TabsTrigger value="experienceLevels">Niveles de Experiencia</TabsTrigger>
          <TabsTrigger value="applicationStatuses">Estados de Aplicación</TabsTrigger>
          <TabsTrigger value="modalities">Modalidades</TabsTrigger>
          <TabsTrigger value="languageLevels">Niveles de Idioma</TabsTrigger>
          <TabsTrigger value="companySizes">Tamaños de Empresa</TabsTrigger>
          <TabsTrigger value="sectors">Sectores</TabsTrigger>
          <TabsTrigger value="studyTypes">Tipos de Estudio</TabsTrigger>
          <TabsTrigger value="studyStatuses">Estados de Estudio</TabsTrigger>
          <TabsTrigger value="maritalStatuses">Estados Civiles</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por código o etiqueta..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
              {search && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Orden</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>ES</TableHead>
                      <TableHead>EN</TableHead>
                      <TableHead>PT</TableHead>
                      <TableHead className="w-24">Activo</TableHead>
                      <TableHead className="w-48">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {options.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No se encontraron opciones
                        </TableCell>
                      </TableRow>
                    ) : (
                      options.map((option) => (
                        <TableRow key={option.id}>
                          <TableCell>{option.order}</TableCell>
                          <TableCell>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {option.code}
                            </code>
                          </TableCell>
                          <TableCell>{getTranslation(option, "ES")}</TableCell>
                          <TableCell>{getTranslation(option, "EN")}</TableCell>
                          <TableCell>{getTranslation(option, "PT")}</TableCell>
                          <TableCell>
                            <Badge
                              variant={option.isActive ? "default" : "secondary"}
                            >
                              {option.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMove(option, "up")}
                                disabled={
                                  options.findIndex((o) => o.id === option.id) === 0
                                }
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMove(option, "down")}
                                disabled={
                                  options.findIndex((o) => o.id === option.id) ===
                                  options.length - 1
                                }
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(option)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Switch
                                checked={option.isActive}
                                onCheckedChange={() =>
                                  handleToggleActive(option.id)
                                }
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(option.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-4">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOption ? "Editar Opción" : "Crear Opción"}
            </DialogTitle>
            <DialogDescription>
              {editingOption
                ? "Modifica los datos de la opción"
                : "Completa los datos para crear una nueva opción"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!editingOption && (
              <div>
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="EJ: TIEMPO_COMPLETO"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Código único e inmutable (se guarda en Jobs/Postulante)
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="es">Etiqueta en Español</Label>
              <Input
                id="es"
                value={formData.translations.es}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    translations: {
                      ...formData.translations,
                      es: e.target.value,
                    },
                  })
                }
                placeholder="Ej: Tiempo Completo"
              />
            </div>

            <div>
              <Label htmlFor="en">Etiqueta en Inglés</Label>
              <Input
                id="en"
                value={formData.translations.en}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    translations: {
                      ...formData.translations,
                      en: e.target.value,
                    },
                  })
                }
                placeholder="Ej: Full Time"
              />
            </div>

            <div>
              <Label htmlFor="pt">Etiqueta en Portugués</Label>
              <Input
                id="pt"
                value={formData.translations.pt}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    translations: {
                      ...formData.translations,
                      pt: e.target.value,
                    },
                  })
                }
                placeholder="Ej: Tempo Integral"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Activo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
