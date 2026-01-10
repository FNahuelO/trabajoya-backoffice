import { useEffect, useState } from "react";
import { catalogsApi } from "../services/api";
import { useAlert } from "../hooks/useAlert";
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

type CatalogType =
  | "JOB_AREA"
  | "JOB_TYPE"
  | "JOB_LEVEL"
  | "JOB_TYPES"
  | "EXPERIENCE_LEVELS"
  | "APPLICATION_STATUSES"
  | "MODALITIES"
  | "LANGUAGE_LEVELS"
  | "COMPANY_SIZES"
  | "SECTORS"
  | "STUDY_TYPES"
  | "STUDY_STATUSES"
  | "MARITAL_STATUSES";

interface Catalog {
  id: string;
  type: CatalogType;
  code: string;
  isActive: boolean;
  order: number;
  translations: Array<{
    id: string;
    lang: "ES" | "EN" | "PT";
    label: string;
  }>;
}

interface CatalogFormData {
  code: string;
  translations: {
    es: string;
    en: string;
    pt: string;
  };
  isActive: boolean;
}

export default function CatalogsPage() {
  const { showAlert, showConfirm, AlertComponent } = useAlert();
  const [activeTab, setActiveTab] = useState<CatalogType>("JOB_AREA");
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<Catalog | null>(null);
  const [formData, setFormData] = useState<CatalogFormData>({
    code: "",
    translations: { es: "", en: "", pt: "" },
    isActive: true,
  });

  useEffect(() => {
    loadCatalogs();
  }, [activeTab, search, page]);

  const loadCatalogs = async () => {
    setLoading(true);
    try {
      const response = await catalogsApi.list({
        type: activeTab,
        search: search || undefined,
        page,
        pageSize: 20,
      });
      if (response.success && response.data) {
        setCatalogs(response.data.items || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error cargando catálogos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCatalog(null);
    setFormData({
      code: "",
      translations: { es: "", en: "", pt: "" },
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (catalog: Catalog) => {
    setEditingCatalog(catalog);
    setFormData({
      code: catalog.code,
      translations: {
        es: catalog.translations.find((t) => t.lang === "ES")?.label || "",
        en: catalog.translations.find((t) => t.lang === "EN")?.label || "",
        pt: catalog.translations.find((t) => t.lang === "PT")?.label || "",
      },
      isActive: catalog.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingCatalog) {
        await catalogsApi.update(editingCatalog.id, {
          translations: formData.translations,
          isActive: formData.isActive,
        });
      } else {
        await catalogsApi.create({
          type: activeTab,
          code: formData.code,
          translations: formData.translations,
          isActive: formData.isActive,
        });
      }
      setIsDialogOpen(false);
      loadCatalogs();
    } catch (error: any) {
      showAlert({
        title: "Error",
        message:
          error.response?.data?.message || "Error al guardar el catálogo",
      });
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await catalogsApi.toggleActive(id);
      loadCatalogs();
    } catch (error) {
      console.error("Error cambiando estado:", error);
    }
  };

  const handleDelete = async (id: string) => {
    showConfirm({
      title: "Confirmar eliminación",
      message: "¿Estás seguro de eliminar este catálogo?",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          await catalogsApi.delete(id);
          loadCatalogs();
        } catch (error) {
          console.error("Error eliminando catálogo:", error);
          showAlert({
            title: "Error",
            message:
              "No se pudo eliminar el catálogo. Por favor, intenta nuevamente.",
          });
        }
      },
    });
  };

  const handleMove = async (catalog: Catalog, direction: "up" | "down") => {
    const currentIndex = catalogs.findIndex((c) => c.id === catalog.id);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= catalogs.length) return;

    const targetCatalog = catalogs[newIndex];
    const items = catalogs.map((c) => {
      if (c.id === catalog.id) {
        return { id: c.id, order: targetCatalog.order };
      }
      if (c.id === targetCatalog.id) {
        return { id: c.id, order: catalog.order };
      }
      return { id: c.id, order: c.order };
    });

    try {
      await catalogsApi.reorder(items);
      loadCatalogs();
    } catch (error) {
      console.error("Error reordenando:", error);
    }
  };

  const getTranslation = (catalog: Catalog, lang: "ES" | "EN" | "PT") => {
    return catalog.translations.find((t) => t.lang === lang)?.label || "-";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Catálogos</h1>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Catálogo
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as CatalogType);
          setPage(1);
          setSearch("");
        }}
      >
        <TabsList className="flex-wrap">
          <TabsTrigger value="JOB_AREA">Áreas</TabsTrigger>
          <TabsTrigger value="JOB_TYPES">Tipos de Trabajo</TabsTrigger>
          <TabsTrigger value="EXPERIENCE_LEVELS">
            Niveles de Experiencia
          </TabsTrigger>
          <TabsTrigger value="APPLICATION_STATUSES">
            Estados de Aplicación
          </TabsTrigger>
          <TabsTrigger value="MODALITIES">Modalidades</TabsTrigger>
          <TabsTrigger value="LANGUAGE_LEVELS">Niveles de Idioma</TabsTrigger>
          <TabsTrigger value="COMPANY_SIZES">Tamaños de Empresa</TabsTrigger>
          <TabsTrigger value="SECTORS">Industrias</TabsTrigger>
          <TabsTrigger value="STUDY_TYPES">Tipos de Estudio</TabsTrigger>
          <TabsTrigger value="STUDY_STATUSES">Estados de Estudio</TabsTrigger>
          <TabsTrigger value="MARITAL_STATUSES">Estados Civiles</TabsTrigger>
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
                    {catalogs.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-gray-500"
                        >
                          No se encontraron catálogos
                        </TableCell>
                      </TableRow>
                    ) : (
                      catalogs.map((catalog) => (
                        <TableRow key={catalog.id}>
                          <TableCell>{catalog.order}</TableCell>
                          <TableCell>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {catalog.code}
                            </code>
                          </TableCell>
                          <TableCell>{getTranslation(catalog, "ES")}</TableCell>
                          <TableCell>{getTranslation(catalog, "EN")}</TableCell>
                          <TableCell>{getTranslation(catalog, "PT")}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                catalog.isActive ? "default" : "secondary"
                              }
                            >
                              {catalog.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMove(catalog, "up")}
                                disabled={
                                  catalogs.findIndex(
                                    (c) => c.id === catalog.id
                                  ) === 0
                                }
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMove(catalog, "down")}
                                disabled={
                                  catalogs.findIndex(
                                    (c) => c.id === catalog.id
                                  ) ===
                                  catalogs.length - 1
                                }
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(catalog)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Switch
                                checked={catalog.isActive}
                                onCheckedChange={() =>
                                  handleToggleActive(catalog.id)
                                }
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(catalog.id)}
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
              {editingCatalog ? "Editar Catálogo" : "Crear Catálogo"}
            </DialogTitle>
            <DialogDescription>
              {editingCatalog
                ? "Modifica los datos del catálogo"
                : "Completa los datos para crear un nuevo catálogo"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!editingCatalog && (
              <div>
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="EJ: COMERCIAL_VENTAS"
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
                placeholder="Ej: Comercial, Ventas y Negocios"
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
                placeholder="Ej: Commercial, Sales & Business"
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
                placeholder="Ej: Comercial, Vendas e Negócios"
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
      <AlertComponent />
    </div>
  );
}
