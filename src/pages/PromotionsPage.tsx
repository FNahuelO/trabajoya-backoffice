import { useEffect, useState } from "react";
import { promotionsApi } from "../services/api";
import type { PaginatedResponse } from "../types";
import {
  Gift,
  Calendar,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
} from "lucide-react";

interface Promotion {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  durationDays: number;
  startAt?: string | null;
  endAt?: string | null;
  isActive: boolean;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

interface LegacyUserPromotion {
  id: string;
  promoKey: string;
  status?: string;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

interface LaunchTrialStatusResponse {
  promotion?: {
    code?: string;
    title?: string;
    description?: string;
    durationDays?: number;
    metadata?: Record<string, any>;
    startAt?: string;
    endAt?: string;
  } | null;
}

interface PromotionFormData {
  code: string;
  title: string;
  description: string;
  durationDays: number;
  startAt: string;
  endAt: string;
  isActive: boolean;
}

const initialFormData: PromotionFormData = {
  code: "",
  title: "",
  description: "",
  durationDays: 4,
  startAt: "",
  endAt: "",
  isActive: true,
};

const toDateTimeLocalValue = (dateString?: string | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const fromDateTimeLocal = (value: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const normalizePromotionsResponse = (
  payload: PaginatedResponse<Promotion> | PaginatedResponse<LegacyUserPromotion>,
  page: number,
  pageSize: number,
  realPromotion?: LaunchTrialStatusResponse["promotion"]
) => {
  const rawItems = Array.isArray(payload.items) ? payload.items : [];
  const isLegacy = rawItems.length > 0 && "promoKey" in rawItems[0];

  if (!isLegacy) {
    const current = payload as PaginatedResponse<Promotion>;
    return {
      items: current.items || [],
      total: current.total || 0,
      totalPages: current.totalPages || 1,
    };
  }

  const grouped = new Map<string, LegacyUserPromotion[]>();
  for (const row of rawItems as LegacyUserPromotion[]) {
    const key = row.promoKey || "SIN_CODIGO";
    const list = grouped.get(key) || [];
    list.push(row);
    grouped.set(key, list);
  }

  const deduped = Array.from(grouped.entries()).map(([promoKey, rows]) => {
    const sorted = [...rows].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const metadata = (last?.metadata || first?.metadata || {}) as Record<
      string,
      any
    >;

    const mergedDuration =
      promoKey === realPromotion?.code && realPromotion?.durationDays
        ? Number(realPromotion.durationDays)
        : Number(metadata.durationDays) || 0;

    const mergedTitle =
      promoKey === realPromotion?.code && realPromotion?.title
        ? realPromotion.title
        : metadata.title || promoKey;

    const mergedDescription =
      promoKey === realPromotion?.code && realPromotion?.description
        ? realPromotion.description
        : metadata.description || null;

    const mergedStartAt =
      promoKey === realPromotion?.code
        ? (realPromotion?.startAt ?? metadata.startAt ?? null)
        : (metadata.startAt ?? null);

    const mergedEndAt =
      promoKey === realPromotion?.code
        ? (realPromotion?.endAt ?? metadata.endAt ?? null)
        : (metadata.endAt ?? null);

    return {
      id: promoKey,
      code: promoKey,
      title: mergedTitle,
      description: mergedDescription,
      durationDays: mergedDuration,
      startAt: mergedStartAt,
      endAt: mergedEndAt,
      isActive: true,
      metadata,
      createdAt: first?.createdAt || new Date().toISOString(),
      updatedAt: last?.updatedAt || first?.createdAt || new Date().toISOString(),
    } satisfies Promotion;
  });

  const start = Math.max(0, (page - 1) * pageSize);
  const end = start + pageSize;
  return {
    items: deduped.slice(start, end),
    total: deduped.length,
    totalPages: Math.max(1, Math.ceil(deduped.length / pageSize)),
  };
};

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PromotionFormData>(initialFormData);
  const pageSize = 20;

  useEffect(() => {
    loadPromotions();
  }, [page, search, activeFilter]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const normalizedValue = searchInput.trim();
      setSearch((currentSearch) => {
        if (currentSearch === normalizedValue) return currentSearch;
        if (page !== 1) {
          setPage(1);
        }
        return normalizedValue;
      });
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput, page]);

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const [listResponse, statusResponse] = await Promise.all([
        promotionsApi.list({
          page,
          pageSize,
          search: search || undefined,
          isActive:
            activeFilter === ""
              ? undefined
              : activeFilter === "true"
                ? true
                : false,
        }),
        promotionsApi.getLaunchTrialStatus().catch(() => null),
      ]);

      if (listResponse.success) {
        const realPromotion = (statusResponse?.data as LaunchTrialStatusResponse)
          ?.promotion;
        const normalized = normalizePromotionsResponse(
          listResponse.data as
            | PaginatedResponse<Promotion>
            | PaginatedResponse<LegacyUserPromotion>,
        page,
          pageSize,
          realPromotion
        );
        setPromotions(normalized.items);
        setTotalPages(normalized.totalPages);
        setTotal(normalized.total);
      }
    } catch (error) {
      console.error("Error cargando promociones:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    const parsedDate = new Date(dateString);
    if (Number.isNaN(parsedDate.getTime())) return "-";
    return dateFormatter.format(parsedDate);
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleCreate = () => {
    setEditingPromotion(null);
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      code: promotion.code,
      title: promotion.title,
      description: promotion.description || "",
      durationDays: promotion.durationDays,
      startAt: toDateTimeLocalValue(promotion.startAt),
      endAt: toDateTimeLocalValue(promotion.endAt),
      isActive: promotion.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.code.trim() && !editingPromotion) {
      alert("El código es obligatorio.");
      return;
    }
    if (!formData.title.trim()) {
      alert("El título es obligatorio.");
      return;
    }
    if (formData.durationDays <= 0) {
      alert("La duración debe ser mayor a 0.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        durationDays: formData.durationDays,
        startAt: fromDateTimeLocal(formData.startAt),
        endAt: fromDateTimeLocal(formData.endAt),
        isActive: formData.isActive,
      };

      if (editingPromotion) {
        await promotionsApi.update(editingPromotion.id, payload);
      } else {
        await promotionsApi.create({
          code: formData.code.trim(),
          ...payload,
        });
      }

      setShowModal(false);
      setEditingPromotion(null);
      resetForm();
      loadPromotions();
    } catch (error) {
      console.error("Error guardando promoción:", error);
      alert("No se pudo guardar la promoción.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que querés eliminar esta promoción?")) return;
    try {
      await promotionsApi.delete(id);
      loadPromotions();
    } catch (error) {
      console.error("Error eliminando promoción:", error);
      alert("No se pudo eliminar la promoción.");
    }
  };

  const handleToggleActive = async (promotion: Promotion) => {
    try {
      await promotionsApi.toggleActive(promotion.id);
      loadPromotions();
    } catch (error) {
      console.error("Error cambiando estado:", error);
      alert("No se pudo actualizar el estado.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promociones</h1>
          <p className="text-gray-600 mt-1">
            {total} promociones registradas
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative min-w-[280px]">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por código o título"
              className="w-full border border-gray-300 rounded-lg pl-9 pr-9 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                title="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activas</option>
            <option value="false">Inactivas</option>
          </select>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nueva Promoción
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-12">
          <Gift className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay promociones
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Crea una promoción para comenzar.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vigencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {promotions.map((promotion) => (
                  <tr key={promotion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Gift className="h-5 w-5 text-purple-500 mr-2" />
                        <span className="text-sm font-mono text-gray-900">
                          {promotion.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {promotion.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {promotion.description || "Sin descripción"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {promotion.durationDays} días
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        Inicio: {formatDate(promotion.startAt)}
                      </div>
                      <div className="text-sm text-gray-700">
                        Fin: {formatDate(promotion.endAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          promotion.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {promotion.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        {formatDate(promotion.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(promotion)}
                          className="p-1 text-gray-600 hover:text-blue-700"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(promotion)}
                          className="p-1 text-gray-600 hover:text-green-700"
                          title={promotion.isActive ? "Desactivar" : "Activar"}
                        >
                          {promotion.isActive ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(promotion.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-700">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingPromotion ? "Editar promoción" : "Nueva promoción"}
            </h2>

            <div className="space-y-4">
              {!editingPromotion && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="Ej: LAUNCH_TRIAL_4D"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Promoción de lanzamiento"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duración (días)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.durationDays}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationDays: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inicio
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startAt}
                    onChange={(e) =>
                      setFormData({ ...formData, startAt: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fin
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endAt}
                    onChange={(e) =>
                      setFormData({ ...formData, endAt: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
                <span className="text-sm text-gray-700">Promoción activa</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingPromotion(null);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

