import { useEffect, useState } from "react";
import { adminApi, notificationCampaignsApi } from "../services/api";
import { useAlert } from "../hooks/useAlert";
import type { PaginatedResponse, User } from "../types";
import {
  Bell,
  Send,
  Users,
  Smartphone,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  X,
  UserPlus,
} from "lucide-react";

type CampaignTarget = "ALL" | "POSTULANTE" | "EMPRESA" | "SPECIFIC";
type CampaignStatus = "PENDING" | "SENT" | "FAILED";
type SendMode = "broadcast" | "specific";

interface NotificationCampaign {
  id: string;
  title: string;
  body: string;
  targetAudience: CampaignTarget;
  targetUserIds?: string[];
  status: CampaignStatus;
  tokensTargeted: number;
  uniqueUsers: number;
  errorMessage?: string | null;
  createdAt: string;
  sentAt?: string | null;
}

interface AudienceStats {
  totalActiveTokens: number;
  uniqueUsers: number;
  postulanteTokens: number;
  postulanteUsers: number;
  empresaTokens: number;
  empresaUsers: number;
}

interface SelectedUser {
  id: string;
  email: string;
  userType: string;
  displayName: string | null;
  tokenCount?: number;
}

interface ReachPreview {
  usersFound: number;
  usersWithTokens: number;
  tokensTargeted: number;
  users: SelectedUser[];
}

const targetLabels: Record<CampaignTarget, string> = {
  ALL: "Todos los usuarios",
  POSTULANTE: "Solo postulantes",
  EMPRESA: "Solo empresas",
  SPECIFIC: "Usuarios específicos",
};

const userTypeLabels: Record<string, string> = {
  POSTULANTE: "Postulante",
  EMPRESA: "Empresa",
  ADMIN: "Admin",
};

const statusConfig: Record<
  CampaignStatus,
  { label: string; className: string; icon: typeof CheckCircle }
> = {
  PENDING: {
    label: "Pendiente",
    className: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  SENT: {
    label: "Enviada",
    className: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  FAILED: {
    label: "Fallida",
    className: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const getUserDisplayName = (user: User) =>
  user.postulante?.fullName || user.empresa?.companyName || user.email;

export default function NotificationCampaignsPage() {
  const { showAlert, showConfirm, AlertComponent } = useAlert();
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([]);
  const [stats, setStats] = useState<AudienceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sendMode, setSendMode] = useState<SendMode>("broadcast");
  const [targetAudience, setTargetAudience] = useState<
    Exclude<CampaignTarget, "SPECIFIC">
  >("ALL");

  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [specificReach, setSpecificReach] = useState<ReachPreview | null>(null);
  const [loadingSpecificReach, setLoadingSpecificReach] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listResponse, statsResponse] = await Promise.all([
        notificationCampaignsApi.list({ page, pageSize }),
        notificationCampaignsApi.getAudienceStats(),
      ]);

      if (listResponse.success) {
        const data = listResponse.data as PaginatedResponse<NotificationCampaign>;
        setCampaigns(data.items || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data as AudienceStats);
      }
    } catch (error) {
      console.error("Error cargando campañas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  useEffect(() => {
    if (sendMode !== "specific") {
      setSpecificReach(null);
      return;
    }

    if (selectedUsers.length === 0) {
      setSpecificReach(null);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setLoadingSpecificReach(true);
      try {
        const response = await notificationCampaignsApi.previewReach(
          selectedUsers.map((user) => user.id)
        );
        if (response.success) {
          const preview = response.data as ReachPreview;
          setSpecificReach(preview);
          setSelectedUsers((current) =>
            current.map((user) => {
              const updated = preview.users.find(
                (previewUser) => previewUser.id === user.id
              );
              return updated
                ? { ...user, tokenCount: updated.tokenCount }
                : user;
            })
          );
        }
      } catch (error) {
        console.error("Error obteniendo alcance específico:", error);
        setSpecificReach(null);
      } finally {
        setLoadingSpecificReach(false);
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [sendMode, selectedUsers.map((user) => user.id).join(",")]);

  useEffect(() => {
    if (sendMode !== "specific") {
      setSearchResults([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      if (!userSearch.trim()) {
        setSearchResults([]);
        return;
      }

      setSearchingUsers(true);
      try {
        const response = await adminApi.getUsers({
          page: 1,
          pageSize: 8,
          search: userSearch.trim(),
        });

        if (response.success && response.data?.items) {
          const selectedIds = new Set(selectedUsers.map((user) => user.id));
          setSearchResults(
            (response.data.items as User[]).filter(
              (user) => !selectedIds.has(user.id)
            )
          );
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error buscando usuarios:", error);
        setSearchResults([]);
      } finally {
        setSearchingUsers(false);
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [userSearch, sendMode, selectedUsers]);

  const getBroadcastReach = () => {
    if (!stats) return { tokens: 0, users: 0 };
    if (targetAudience === "POSTULANTE") {
      return {
        tokens: stats.postulanteTokens,
        users: stats.postulanteUsers,
      };
    }
    if (targetAudience === "EMPRESA") {
      return {
        tokens: stats.empresaTokens,
        users: stats.empresaUsers,
      };
    }
    return {
      tokens: stats.totalActiveTokens,
      users: stats.uniqueUsers,
    };
  };

  const getCurrentReach = () => {
    if (sendMode === "specific") {
      return {
        tokens: specificReach?.tokensTargeted || 0,
        users: specificReach?.usersWithTokens || 0,
        selectedCount: selectedUsers.length,
      };
    }
    const broadcastReach = getBroadcastReach();
    return {
      tokens: broadcastReach.tokens,
      users: broadcastReach.users,
      selectedCount: 0,
    };
  };

  const handleAddUser = (user: User) => {
    if (selectedUsers.some((selected) => selected.id === user.id)) return;
    if (selectedUsers.length >= 50) {
      showAlert({
        title: "Límite alcanzado",
        message: "Podés seleccionar hasta 50 usuarios por campaña.",
      });
      return;
    }

    setSelectedUsers((current) => [
      ...current,
      {
        id: user.id,
        email: user.email,
        userType: user.userType,
        displayName: getUserDisplayName(user),
      },
    ]);
    setUserSearch("");
    setSearchResults([]);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((current) =>
      current.filter((user) => user.id !== userId)
    );
  };

  const handleSend = () => {
    if (!title.trim()) {
      showAlert({
        title: "Campo requerido",
        message: "El título es obligatorio.",
      });
      return;
    }
    if (!body.trim()) {
      showAlert({
        title: "Campo requerido",
        message: "El mensaje es obligatorio.",
      });
      return;
    }
    if (sendMode === "specific" && selectedUsers.length === 0) {
      showAlert({
        title: "Usuarios requeridos",
        message: "Seleccioná al menos un usuario para la prueba.",
      });
      return;
    }

    const reach = getCurrentReach();
    const isSpecificTest = sendMode === "specific";
    const audienceLabel = isSpecificTest
      ? `${selectedUsers.length} usuario(s) seleccionado(s)`
      : targetLabels[targetAudience];
    const payload = {
      title: title.trim(),
      body: body.trim(),
      targetAudience: isSpecificTest ? ("SPECIFIC" as const) : targetAudience,
      userIds: isSpecificTest
        ? selectedUsers.map((user) => user.id)
        : undefined,
    };

    showConfirm({
      title: isSpecificTest ? "Confirmar prueba" : "Confirmar envío",
      message: `¿Enviar esta campaña?\n\nAudiencia: ${audienceLabel}\nAlcance: ${reach.users} usuario(s) con dispositivo (${reach.tokens} dispositivo(s))\nTítulo: ${payload.title}\n\nEsta acción no se puede deshacer.`,
      confirmText: isSpecificTest ? "Enviar prueba" : "Enviar campaña",
      cancelText: "Cancelar",
      onConfirm: async () => {
        setSending(true);
        try {
          const response = await notificationCampaignsApi.send(payload);

          if (response.success) {
            setTitle("");
            setBody("");
            setSendMode("broadcast");
            setTargetAudience("ALL");
            setSelectedUsers([]);
            setUserSearch("");
            setSearchResults([]);
            setSpecificReach(null);
            setPage(1);
            await loadData();
            showAlert({
              title: "Campaña enviada",
              message: isSpecificTest
                ? "La prueba se envió correctamente a los usuarios seleccionados."
                : "La campaña se envió correctamente.",
            });
          } else {
            showAlert({
              title: "Error",
              message: response.message || "No se pudo enviar la campaña.",
            });
          }
        } catch (error) {
          console.error("Error enviando campaña:", error);
          showAlert({
            title: "Error",
            message: "No se pudo enviar la campaña.",
          });
        } finally {
          setSending(false);
        }
      },
    });
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    const parsedDate = new Date(dateString);
    if (Number.isNaN(parsedDate.getTime())) return "-";
    return dateFormatter.format(parsedDate);
  };

  const reach = getCurrentReach();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Campañas de Notificaciones
        </h1>
        <p className="text-gray-600 mt-1">
          Enviá notificaciones push masivas o probá con usuarios específicos
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Usuarios con app</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.uniqueUsers}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <Smartphone className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Dispositivos activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalActiveTokens}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Campañas enviadas</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Nueva campaña
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="Ej: ¡Feliz Día del Padre!"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/120</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensaje
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Escribí el mensaje que verán los usuarios en su celular..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">{body.length}/500</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de envío
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setSendMode("broadcast")}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  sendMode === "broadcast"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Campaña masiva
              </button>
              <button
                type="button"
                onClick={() => setSendMode("specific")}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  sendMode === "specific"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Prueba con usuarios específicos
              </button>
            </div>
          </div>

          {sendMode === "broadcast" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Audiencia
              </label>
              <select
                value={targetAudience}
                onChange={(e) =>
                  setTargetAudience(
                    e.target.value as Exclude<CampaignTarget, "SPECIFIC">
                  )
                }
                className="w-full md:w-auto border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">
                  Todos los usuarios (postulantes y empresas)
                </option>
                <option value="POSTULANTE">Solo postulantes</option>
                <option value="EMPRESA">Solo empresas</option>
              </select>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar usuarios
                </label>
                <div className="relative">
                  <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Buscar por email, nombre o empresa..."
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ideal para pruebas internas antes de enviar a todos.
                </p>
              </div>

              {searchingUsers && (
                <p className="text-sm text-gray-500">Buscando usuarios...</p>
              )}

              {!searchingUsers && searchResults.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleAddUser(user)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {getUserDisplayName(user)}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {userTypeLabels[user.userType] || user.userType}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {selectedUsers.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Usuarios seleccionados ({selectedUsers.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <span
                        key={user.id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-900 text-sm border border-blue-100"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>
                          {user.displayName || user.email}
                          {typeof user.tokenCount === "number" && (
                            <span className="text-blue-700/70">
                              {" "}
                              · {user.tokenCount} disp.
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveUser(user.id)}
                          className="text-blue-700 hover:text-blue-900"
                          title="Quitar usuario"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {sendMode === "specific" &&
                selectedUsers.length > 0 &&
                specificReach &&
                specificReach.usersWithTokens < selectedUsers.length && (
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm text-amber-900">
                    {selectedUsers.length - specificReach.usersWithTokens}{" "}
                    usuario(s) seleccionado(s) no tienen dispositivo con
                    notificaciones activas.
                  </div>
                )}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-900">
            {sendMode === "specific" ? (
              <>
                Alcance estimado:{" "}
                <strong>
                  {loadingSpecificReach
                    ? "Calculando..."
                    : `${reach.users} de ${selectedUsers.length} usuario(s) con dispositivo`}
                </strong>{" "}
                ({reach.tokens} dispositivos)
              </>
            ) : (
              <>
                Alcance estimado:{" "}
                <strong>{reach.users} usuarios</strong> en{" "}
                <strong>{reach.tokens} dispositivos</strong>
              </>
            )}
          </div>

          <button
            onClick={handleSend}
            disabled={
              sending ||
              !title.trim() ||
              !body.trim() ||
              (sendMode === "specific" && selectedUsers.length === 0)
            }
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
            {sending
              ? "Enviando..."
              : sendMode === "specific"
                ? "Enviar prueba"
                : "Enviar campaña"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            Historial de campañas
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Todavía no hay campañas enviadas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Campaña
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Audiencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Alcance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Enviada
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => {
                  const status = statusConfig[campaign.status];
                  const StatusIcon = status.icon;
                  return (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {campaign.title}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {campaign.body}
                        </p>
                        {campaign.errorMessage && (
                          <p className="text-xs text-red-600 mt-1">
                            {campaign.errorMessage}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {targetLabels[campaign.targetAudience]}
                        {campaign.targetAudience === "SPECIFIC" &&
                          campaign.targetUserIds &&
                          campaign.targetUserIds.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {campaign.targetUserIds.length} usuario(s)
                            </p>
                          )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {campaign.uniqueUsers} usuarios
                        <br />
                        <span className="text-gray-500">
                          {campaign.tokensTargeted} dispositivos
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatDate(campaign.sentAt || campaign.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <AlertComponent />
    </div>
  );
}
