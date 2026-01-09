import { useEffect, useState } from "react";
import { plansApi } from "../services/api";
import { useAlert } from "../hooks/useAlert";
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

interface Plan {
  id: string;
  name: string;
  code: string;
  price: number;
  currency: string;
  durationDays: number;
  unlimitedCvs: boolean;
  allowedModifications: number;
  canModifyCategory: boolean;
  categoryModifications: number;
  hasFeaturedOption: boolean;
  launchBenefitAvailable: boolean;
  launchBenefitDuration: number | null;
  isActive: boolean;
  order: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PlanFormData {
  name: string;
  code: string;
  price: number;
  currency: string;
  durationDays: number;
  unlimitedCvs: boolean;
  allowedModifications: number;
  canModifyCategory: boolean;
  categoryModifications: number;
  hasFeaturedOption: boolean;
  launchBenefitAvailable: boolean;
  launchBenefitDuration: number | null;
  isActive: boolean;
  description: string;
}

export default function PlansPage() {
  const { showAlert, showConfirm, AlertComponent } = useAlert();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>({
    name: "",
    code: "",
    price: 0,
    currency: "USD",
    durationDays: 7,
    unlimitedCvs: true,
    allowedModifications: 0,
    canModifyCategory: false,
    categoryModifications: 0,
    hasFeaturedOption: false,
    launchBenefitAvailable: false,
    launchBenefitDuration: null,
    isActive: true,
    description: "",
  });

  useEffect(() => {
    loadPlans();
  }, [search, page]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const response = await plansApi.list({
        search: search || undefined,
        page,
        pageSize: 20,
      });
      if (response.success && response.data) {
        setPlans(response.data.items || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error cargando planes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      code: "",
      price: 0,
      currency: "USD",
      durationDays: 7,
      unlimitedCvs: true,
      allowedModifications: 0,
      canModifyCategory: false,
      categoryModifications: 0,
      hasFeaturedOption: false,
      launchBenefitAvailable: false,
      launchBenefitDuration: null,
      isActive: true,
      description: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      code: plan.code,
      price: plan.price,
      currency: plan.currency || "USD",
      durationDays: plan.durationDays,
      unlimitedCvs: plan.unlimitedCvs,
      allowedModifications: plan.allowedModifications,
      canModifyCategory: plan.canModifyCategory,
      categoryModifications: plan.categoryModifications,
      hasFeaturedOption: plan.hasFeaturedOption,
      launchBenefitAvailable: plan.launchBenefitAvailable,
      launchBenefitDuration: plan.launchBenefitDuration,
      isActive: plan.isActive,
      description: plan.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingPlan) {
        await plansApi.update(editingPlan.id, {
          name: formData.name,
          price: formData.price,
          currency: formData.currency,
          durationDays: formData.durationDays,
          unlimitedCvs: formData.unlimitedCvs,
          allowedModifications: formData.allowedModifications,
          canModifyCategory: formData.canModifyCategory,
          categoryModifications: formData.categoryModifications,
          hasFeaturedOption: formData.hasFeaturedOption,
          launchBenefitAvailable: formData.launchBenefitAvailable,
          launchBenefitDuration: formData.launchBenefitDuration,
          isActive: formData.isActive,
          description: formData.description || undefined,
        });
      } else {
        await plansApi.create({
          name: formData.name,
          code: formData.code,
          price: formData.price,
          currency: formData.currency,
          durationDays: formData.durationDays,
          unlimitedCvs: formData.unlimitedCvs,
          allowedModifications: formData.allowedModifications,
          canModifyCategory: formData.canModifyCategory,
          categoryModifications: formData.categoryModifications,
          hasFeaturedOption: formData.hasFeaturedOption,
          launchBenefitAvailable: formData.launchBenefitAvailable,
          launchBenefitDuration: formData.launchBenefitDuration,
          isActive: formData.isActive,
          description: formData.description || undefined,
        });
      }
      setIsDialogOpen(false);
      loadPlans();
    } catch (error: any) {
      showAlert({
        title: "Error",
        message: error.response?.data?.message || "Error al guardar el plan",
      });
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await plansApi.toggleActive(id);
      loadPlans();
    } catch (error) {
      console.error("Error cambiando estado:", error);
    }
  };

  const handleDelete = async (id: string) => {
    showConfirm({
      title: "Confirmar eliminación",
      message:
        "¿Estás seguro de eliminar permanentemente este plan? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          await plansApi.delete(id);
          loadPlans();
        } catch (error) {
          console.error("Error eliminando plan:", error);
          showAlert({
            title: "Error",
            message:
              "No se pudo eliminar el plan. Por favor, intenta nuevamente.",
          });
        }
      },
    });
  };

  const handleMove = async (plan: Plan, direction: "up" | "down") => {
    const currentIndex = plans.findIndex((p) => p.id === plan.id);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= plans.length) return;

    const targetPlan = plans[newIndex];
    const items = plans.map((p) => {
      if (p.id === plan.id) {
        return { id: p.id, order: targetPlan.order };
      }
      if (p.id === targetPlan.id) {
        return { id: p.id, order: plan.order };
      }
      return { id: p.id, order: p.order };
    });

    try {
      await plansApi.reorder(items);
      loadPlans();
    } catch (error) {
      console.error("Error reordenando:", error);
    }
  };

  const formatPrice = (price: number, currency: string = "USD") => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Planes</h1>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Plan
        </Button>
      </div>

      <div className="mb-4 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o código..."
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
                  <TableHead>Nombre</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Moneda</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Modificaciones</TableHead>
                  <TableHead>Destacado</TableHead>
                  <TableHead className="w-24">Activo</TableHead>
                  <TableHead className="w-48">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center py-8 text-gray-500"
                    >
                      No se encontraron planes
                    </TableCell>
                  </TableRow>
                ) : (
                  plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>{plan.order}</TableCell>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {plan.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        {formatPrice(plan.price, plan.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {plan.currency || "USD"}
                        </Badge>
                      </TableCell>
                      <TableCell>{plan.durationDays} días</TableCell>
                      <TableCell>
                        {plan.allowedModifications > 0
                          ? `${plan.allowedModifications} veces`
                          : "No permitido"}
                        {plan.canModifyCategory && (
                          <span className="text-xs text-gray-500 block">
                            Rubro: {plan.categoryModifications} vez
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {plan.hasFeaturedOption ? (
                          <Badge variant="default">Sí</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={plan.isActive ? "default" : "secondary"}
                        >
                          {plan.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMove(plan, "up")}
                            disabled={
                              plans.findIndex((p) => p.id === plan.id) === 0
                            }
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMove(plan, "down")}
                            disabled={
                              plans.findIndex((p) => p.id === plan.id) ===
                              plans.length - 1
                            }
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(plan)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Switch
                            checked={plan.isActive}
                            onCheckedChange={() => handleToggleActive(plan.id)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(plan.id)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "Editar Plan" : "Crear Plan"}
            </DialogTitle>
            <DialogDescription>
              {editingPlan
                ? "Modifica los datos del plan"
                : "Completa los datos para crear un nuevo plan"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!editingPlan && (
              <div>
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="EJ: URGENT"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Código único e inmutable (ej: URGENT, STANDARD, PREMIUM)
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ej: Reclutamiento Urgente"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="25000"
                />
              </div>
              <div>
                <Label htmlFor="currency">Moneda</Label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currency: e.target.value,
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="USD">USD (Dólares - PayPal)</option>
                  <option value="ARS">
                    ARS (Pesos Argentinos - Otras pasarelas)
                  </option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  USD para PayPal, ARS para otras pasarelas
                </p>
              </div>
              <div>
                <Label htmlFor="durationDays">Duración (días)</Label>
                <Input
                  id="durationDays"
                  type="number"
                  value={formData.durationDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      durationDays: parseInt(e.target.value) || 7,
                    })
                  }
                  placeholder="7"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="allowedModifications">
                  Modificaciones permitidas
                </Label>
                <Input
                  id="allowedModifications"
                  type="number"
                  value={formData.allowedModifications}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      allowedModifications: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="categoryModifications">
                  Modificaciones de rubro
                </Label>
                <Input
                  id="categoryModifications"
                  type="number"
                  value={formData.categoryModifications}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoryModifications: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="unlimitedCvs"
                  checked={formData.unlimitedCvs}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, unlimitedCvs: checked })
                  }
                />
                <Label htmlFor="unlimitedCvs">CVs ilimitados</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="canModifyCategory"
                  checked={formData.canModifyCategory}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, canModifyCategory: checked })
                  }
                />
                <Label htmlFor="canModifyCategory">Puede modificar rubro</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="hasFeaturedOption"
                  checked={formData.hasFeaturedOption}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, hasFeaturedOption: checked })
                  }
                />
                <Label htmlFor="hasFeaturedOption">
                  Opción gráfica destacada
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="launchBenefitAvailable"
                  checked={formData.launchBenefitAvailable}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      launchBenefitAvailable: checked,
                    })
                  }
                />
                <Label htmlFor="launchBenefitAvailable">
                  Beneficio de lanzamiento disponible
                </Label>
              </div>

              {formData.launchBenefitAvailable && (
                <div>
                  <Label htmlFor="launchBenefitDuration">
                    Duración del beneficio (días)
                  </Label>
                  <Input
                    id="launchBenefitDuration"
                    type="number"
                    value={formData.launchBenefitDuration || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        launchBenefitDuration: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    placeholder="4"
                  />
                </div>
              )}

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

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descripción del plan..."
              />
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
