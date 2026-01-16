import { useEffect, useState } from "react";
import { plansApi, iapProductsApi } from "../services/api";
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
  Smartphone,
  ChevronDown,
  ChevronRight,
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
  hasAIFeature: boolean;
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
  hasAIFeature: boolean;
  launchBenefitAvailable: boolean;
  launchBenefitDuration: number | null;
  isActive: boolean;
  description: string;
}

interface IapProduct {
  id: string;
  productId: string;
  platform: "IOS" | "ANDROID";
  planKey: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
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
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());
  const [iapProducts, setIapProducts] = useState<Record<string, IapProduct[]>>(
    {}
  );
  const [isIapDialogOpen, setIsIapDialogOpen] = useState(false);
  const [selectedPlanForIap, setSelectedPlanForIap] = useState<Plan | null>(
    null
  );
  const [iapFormData, setIapFormData] = useState({
    productId: "",
    platform: "IOS" as "IOS" | "ANDROID",
    active: true,
  });
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
    hasAIFeature: false,
    launchBenefitAvailable: false,
    launchBenefitDuration: null,
    isActive: true,
    description: "",
  });

  useEffect(() => {
    loadPlans();
  }, [search, page]);

  const loadIapProducts = async (planKey: string) => {
    try {
      const response = await iapProductsApi.getByPlan(planKey);
      if (response.success && response.data) {
        setIapProducts((prev) => ({
          ...prev,
          [planKey]: response.data.items || response.data || [],
        }));
      }
    } catch (error) {
      console.error("Error cargando productos IAP:", error);
    }
  };

  const togglePlanExpansion = (plan: Plan) => {
    const newExpanded = new Set(expandedPlans);
    if (newExpanded.has(plan.id)) {
      newExpanded.delete(plan.id);
    } else {
      newExpanded.add(plan.id);
      loadIapProducts(plan.code);
    }
    setExpandedPlans(newExpanded);
  };

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
      hasAIFeature: false,
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
      hasAIFeature: plan.hasAIFeature || false,
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
        const response = await plansApi.update(editingPlan.id, {
          name: formData.name,
          price: formData.price,
          currency: formData.currency,
          durationDays: formData.durationDays,
          unlimitedCvs: formData.unlimitedCvs,
          allowedModifications: formData.allowedModifications,
          canModifyCategory: formData.canModifyCategory,
          categoryModifications: formData.categoryModifications,
          hasFeaturedOption: formData.hasFeaturedOption,
          hasAIFeature: formData.hasAIFeature,
          launchBenefitAvailable: formData.launchBenefitAvailable,
          launchBenefitDuration: formData.launchBenefitDuration,
          isActive: formData.isActive,
          description: formData.description || undefined,
        });
        setIsDialogOpen(false);
        showAlert({
          title: "Éxito",
          message: response?.message || "Plan actualizado correctamente",
        });
        loadPlans();
      } else {
        const response = await plansApi.create({
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
          hasAIFeature: formData.hasAIFeature,
          launchBenefitAvailable: formData.launchBenefitAvailable,
          launchBenefitDuration: formData.launchBenefitDuration,
          isActive: formData.isActive,
          description: formData.description || undefined,
        });
        setIsDialogOpen(false);
        showAlert({
          title: "Éxito",
          message: response?.message || "Plan creado correctamente",
        });
        loadPlans();
      }
    } catch (error: any) {
      showAlert({
        title: "Error",
        message: error.response?.data?.message || "Error al guardar el plan",
      });
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const response = await plansApi.toggleActive(id);
      showAlert({
        title: "Éxito",
        message:
          response?.message || "Estado del plan actualizado correctamente",
      });
      loadPlans();
    } catch (error: any) {
      showAlert({
        title: "Error",
        message:
          error.response?.data?.message ||
          "Error al cambiar el estado del plan",
      });
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

  const handleManageIap = (plan: Plan) => {
    setSelectedPlanForIap(plan);
    setIapFormData({
      productId: "",
      platform: "IOS",
      active: true,
    });
    loadIapProducts(plan.code);
    setIsIapDialogOpen(true);
  };

  const handleCreateIap = async () => {
    if (!selectedPlanForIap) return;
    try {
      await iapProductsApi.create({
        productId: iapFormData.productId,
        platform: iapFormData.platform,
        planKey: selectedPlanForIap.code,
        active: iapFormData.active,
      });
      showAlert({
        title: "Éxito",
        message: "Producto IAP creado correctamente",
      });
      loadIapProducts(selectedPlanForIap.code);
      setIapFormData({
        productId: "",
        platform: "IOS",
        active: true,
      });
    } catch (error: any) {
      showAlert({
        title: "Error",
        message:
          error.response?.data?.message || "Error al crear el producto IAP",
      });
    }
  };

  const handleDeleteIap = async (id: string) => {
    showConfirm({
      title: "Confirmar eliminación",
      message: "¿Estás seguro de eliminar este producto IAP?",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          await iapProductsApi.delete(id);
          if (selectedPlanForIap) {
            loadIapProducts(selectedPlanForIap.code);
          }
        } catch (error) {
          showAlert({
            title: "Error",
            message: "No se pudo eliminar el producto IAP",
          });
        }
      },
    });
  };

  const handleToggleIapActive = async (id: string, currentActive: boolean) => {
    try {
      await iapProductsApi.update(id, { active: !currentActive });
      if (selectedPlanForIap) {
        loadIapProducts(selectedPlanForIap.code);
      }
    } catch (error) {
      showAlert({
        title: "Error",
        message: "No se pudo actualizar el estado del producto IAP",
      });
    }
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
                  <TableHead className="w-32">IAP</TableHead>
                  <TableHead className="w-48">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="text-center py-8 text-gray-500"
                    >
                      No se encontraron planes
                    </TableCell>
                  </TableRow>
                ) : (
                  plans.map((plan) => {
                    const isExpanded = expandedPlans.has(plan.id);
                    const planIapProducts = iapProducts[plan.code] || [];
                    const iosProduct = planIapProducts.find(
                      (p) => p.platform === "IOS"
                    );
                    const androidProduct = planIapProducts.find(
                      (p) => p.platform === "ANDROID"
                    );

                    return (
                      <>
                        <TableRow key={plan.id}>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePlanExpansion(plan)}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">
                            {plan.name}
                          </TableCell>
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
                            <div className="flex items-center gap-1 flex-wrap">
                              {iosProduct ? (
                                <Badge
                                  variant={
                                    iosProduct.active ? "default" : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  iOS
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-xs opacity-50"
                                >
                                  iOS
                                </Badge>
                              )}
                              {androidProduct ? (
                                <Badge
                                  variant={
                                    androidProduct.active
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  Android
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-xs opacity-50"
                                >
                                  Android
                                </Badge>
                              )}
                            </div>
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleManageIap(plan)}
                                title="Gestionar productos IAP"
                              >
                                <Smartphone className="h-4 w-4" />
                              </Button>
                              <Switch
                                checked={plan.isActive}
                                onCheckedChange={() =>
                                  handleToggleActive(plan.id)
                                }
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
                        {isExpanded && planIapProducts.length > 0 && (
                          <TableRow>
                            <TableCell colSpan={11} className="bg-gray-50">
                              <div className="py-4 px-4">
                                <h4 className="font-semibold mb-3">
                                  Productos IAP
                                </h4>
                                <div className="space-y-2">
                                  {planIapProducts.map((iap) => (
                                    <div
                                      key={iap.id}
                                      className="flex items-center justify-between p-3 bg-white rounded border"
                                    >
                                      <div className="flex items-center gap-3">
                                        <Badge
                                          variant={
                                            iap.platform === "IOS"
                                              ? "default"
                                              : "secondary"
                                          }
                                        >
                                          {iap.platform}
                                        </Badge>
                                        <code className="text-sm font-mono">
                                          {iap.productId}
                                        </code>
                                        <Badge
                                          variant={
                                            iap.active ? "default" : "secondary"
                                          }
                                        >
                                          {iap.active ? "Activo" : "Inactivo"}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Switch
                                          checked={iap.active}
                                          onCheckedChange={() =>
                                            handleToggleIapActive(
                                              iap.id,
                                              iap.active
                                            )
                                          }
                                        />
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteIap(iap.id)
                                          }
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })
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
                  id="hasAIFeature"
                  checked={formData.hasAIFeature}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, hasAIFeature: checked })
                  }
                />
                <Label htmlFor="hasAIFeature">Funcionalidades de IA</Label>
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

      {/* Dialog para gestionar productos IAP */}
      <Dialog open={isIapDialogOpen} onOpenChange={setIsIapDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Productos IAP - {selectedPlanForIap?.name}
            </DialogTitle>
            <DialogDescription>
              Gestiona los productos de In-App Purchase asociados a este plan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Lista de productos IAP existentes */}
            {selectedPlanForIap &&
              iapProducts[selectedPlanForIap.code]?.length > 0 && (
                <div>
                  <Label className="mb-2 block">Productos IAP existentes</Label>
                  <div className="space-y-2">
                    {iapProducts[selectedPlanForIap.code].map((iap) => (
                      <div
                        key={iap.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              iap.platform === "IOS" ? "default" : "secondary"
                            }
                          >
                            {iap.platform}
                          </Badge>
                          <code className="text-sm font-mono">
                            {iap.productId}
                          </code>
                          <Badge variant={iap.active ? "default" : "secondary"}>
                            {iap.active ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={iap.active}
                            onCheckedChange={() =>
                              handleToggleIapActive(iap.id, iap.active)
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteIap(iap.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Formulario para crear nuevo producto IAP */}
            <div className="border-t pt-4">
              <Label className="mb-2 block">Crear nuevo producto IAP</Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="iap-productId">Product ID</Label>
                  <Input
                    id="iap-productId"
                    value={iapFormData.productId}
                    onChange={(e) =>
                      setIapFormData({
                        ...iapFormData,
                        productId: e.target.value,
                      })
                    }
                    placeholder="job_urgent_7d"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    ID del producto en App Store Connect / Play Console
                  </p>
                </div>
                <div>
                  <Label htmlFor="iap-platform">Plataforma</Label>
                  <select
                    id="iap-platform"
                    value={iapFormData.platform}
                    onChange={(e) =>
                      setIapFormData({
                        ...iapFormData,
                        platform: e.target.value as "IOS" | "ANDROID",
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="IOS">iOS (App Store)</option>
                    <option value="ANDROID">Android (Play Store)</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="iap-active"
                    checked={iapFormData.active}
                    onCheckedChange={(checked) =>
                      setIapFormData({ ...iapFormData, active: checked })
                    }
                  />
                  <Label htmlFor="iap-active">Activo</Label>
                </div>
                <Button onClick={handleCreateIap} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Producto IAP
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsIapDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertComponent />
    </div>
  );
}
