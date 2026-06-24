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
  CalendarClock,
  Pause,
  Play,
  Trash2,
  Repeat,
  Pencil,
} from "lucide-react";

type CampaignTarget = "ALL" | "POSTULANTE" | "EMPRESA" | "SPECIFIC";
type CampaignStatus = "PENDING" | "SENT" | "FAILED";
type SendMode = "broadcast" | "specific";
type DeliveryMode = "now" | "schedule";
type ScheduleType = "ONCE" | "RECURRING";
type ScheduleStatus = "ACTIVE" | "PAUSED" | "COMPLETED";

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

interface CampaignSchedule {
  id: string;
  title: string;
  body: string;
  targetAudience: CampaignTarget;
  targetUserIds?: string[];
  scheduleType: ScheduleType;
  scheduledAt?: string | null;
  recurrenceDays: number[];
  recurrenceTime?: string | null;
  timezone: string;
  status: ScheduleStatus;
  nextRunAt?: string | null;
  lastRunAt?: string | null;
  maxRuns?: number | null;
  runsCompleted?: number;
  scheduleSummary?: string;
  createdAt: string;
}

const toDatetimeLocalValue = (iso?: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const weekdayOptions = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
  { value: 0, label: "Dom" },
];

const scheduleStatusConfig: Record<
  ScheduleStatus,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "Activa",
    className: "bg-green-100 text-green-800",
  },
  PAUSED: {
    label: "Pausada",
    className: "bg-yellow-100 text-yellow-800",
  },
  COMPLETED: {
    label: "Completada",
    className: "bg-gray-100 text-gray-700",
  },
};

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
  const [schedules, setSchedules] = useState<CampaignSchedule[]>([]);
  const [stats, setStats] = useState<AudienceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [schedulesPage, setSchedulesPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [schedulesTotalPages, setSchedulesTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sendMode, setSendMode] = useState<SendMode>("broadcast");
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("now");
  const [scheduleType, setScheduleType] = useState<ScheduleType>("ONCE");
  const [scheduledAtLocal, setScheduledAtLocal] = useState("");
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [recurrenceTime, setRecurrenceTime] = useState("20:00");
  const [maxRuns, setMaxRuns] = useState("");
  const [targetAudience, setTargetAudience] = useState<
    Exclude<CampaignTarget, "SPECIFIC">
  >("ALL");

  const [editingSchedule, setEditingSchedule] = useState<CampaignSchedule | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editScheduleType, setEditScheduleType] = useState<ScheduleType>("ONCE");
  const [editScheduledAtLocal, setEditScheduledAtLocal] = useState("");
  const [editRecurrenceDays, setEditRecurrenceDays] = useState<number[]>([]);
  const [editRecurrenceTime, setEditRecurrenceTime] = useState("20:00");
  const [editMaxRuns, setEditMaxRuns] = useState("");
  const [editSendMode, setEditSendMode] = useState<SendMode>("broadcast");
  const [editTargetAudience, setEditTargetAudience] = useState<
    Exclude<CampaignTarget, "SPECIFIC">
  >("ALL");
  const [editSelectedUsers, setEditSelectedUsers] = useState<SelectedUser[]>([]);
  const [editUserSearch, setEditUserSearch] = useState("");
  const [editSearchResults, setEditSearchResults] = useState<User[]>([]);
  const [editSearchingUsers, setEditSearchingUsers] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

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

  const loadSchedules = async () => {
    setLoadingSchedules(true);
    try {
      const response = await notificationCampaignsApi.listSchedules({
        page: schedulesPage,
        pageSize,
      });

      if (response.success) {
        const data = response.data as PaginatedResponse<CampaignSchedule>;
        setSchedules(data.items || []);
        setSchedulesTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error cargando programaciones:", error);
    } finally {
      setLoadingSchedules(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  useEffect(() => {
    loadSchedules();
  }, [schedulesPage]);

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

  useEffect(() => {
    if (!editingSchedule || editSendMode !== "specific") {
      setEditSearchResults([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      if (!editUserSearch.trim()) {
        setEditSearchResults([]);
        return;
      }

      setEditSearchingUsers(true);
      try {
        const response = await adminApi.getUsers({
          page: 1,
          pageSize: 8,
          search: editUserSearch.trim(),
        });

        if (response.success && response.data?.items) {
          const selectedIds = new Set(editSelectedUsers.map((user) => user.id));
          setEditSearchResults(
            (response.data.items as User[]).filter(
              (user) => !selectedIds.has(user.id)
            )
          );
        } else {
          setEditSearchResults([]);
        }
      } catch (error) {
        console.error("Error buscando usuarios:", error);
        setEditSearchResults([]);
      } finally {
        setEditSearchingUsers(false);
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [editUserSearch, editSendMode, editSelectedUsers, editingSchedule]);

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

  const toggleRecurrenceDay = (day: number) => {
    setRecurrenceDays((current) =>
      current.includes(day)
        ? current.filter((value) => value !== day)
        : [...current, day]
    );
  };

  const resetForm = () => {
    setTitle("");
    setBody("");
    setSendMode("broadcast");
    setDeliveryMode("now");
    setScheduleType("ONCE");
    setScheduledAtLocal("");
    setRecurrenceDays([]);
    setRecurrenceTime("20:00");
    setMaxRuns("");
    setTargetAudience("ALL");
    setSelectedUsers([]);
    setUserSearch("");
    setSearchResults([]);
    setSpecificReach(null);
  };

  const buildAudiencePayload = () => {
    const isSpecificTest = sendMode === "specific";
    return {
      title: title.trim(),
      body: body.trim(),
      targetAudience: isSpecificTest ? ("SPECIFIC" as const) : targetAudience,
      userIds: isSpecificTest
        ? selectedUsers.map((user) => user.id)
        : undefined,
    };
  };

  const validateScheduleFields = () => {
    if (deliveryMode !== "schedule") return true;

    if (scheduleType === "ONCE") {
      if (!scheduledAtLocal) {
        showAlert({
          title: "Fecha requerida",
          message: "Seleccioná cuándo querés enviar la campaña.",
        });
        return false;
      }

      const scheduledDate = new Date(scheduledAtLocal);
      if (Number.isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
        showAlert({
          title: "Fecha inválida",
          message: "La fecha programada debe ser posterior al momento actual.",
        });
        return false;
      }
    }

    if (scheduleType === "RECURRING") {
      if (recurrenceDays.length === 0) {
        showAlert({
          title: "Días requeridos",
          message: "Seleccioná al menos un día de la semana.",
        });
        return false;
      }
      if (!recurrenceTime) {
        showAlert({
          title: "Hora requerida",
          message: "Indicá la hora de envío.",
        });
        return false;
      }
      if (maxRuns.trim()) {
        const parsedMaxRuns = parseMaxRuns(maxRuns);
        if (parsedMaxRuns == null) {
          showAlert({
            title: "Límite inválido",
            message: "El límite de repeticiones debe ser un número entre 1 y 365.",
          });
          return false;
        }
      }
    }

    return true;
  };

  const parseMaxRuns = (value: string) => {
    if (!value.trim()) return undefined;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 365) {
      return null;
    }
    return parsed;
  };

  const buildSchedulePayload = () => {
    const audiencePayload = buildAudiencePayload();
    const parsedMaxRuns = parseMaxRuns(maxRuns);

    return {
      ...audiencePayload,
      scheduleType,
      scheduledAt:
        scheduleType === "ONCE"
          ? new Date(scheduledAtLocal).toISOString()
          : undefined,
      recurrenceDays: scheduleType === "RECURRING" ? recurrenceDays : undefined,
      recurrenceTime: scheduleType === "RECURRING" ? recurrenceTime : undefined,
      maxRuns:
        scheduleType === "RECURRING" && parsedMaxRuns != null
          ? parsedMaxRuns
          : undefined,
      timezone: "America/Argentina/Buenos_Aires",
    };
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
    if (!validateScheduleFields()) {
      return;
    }

    const reach = getCurrentReach();
    const isSpecificTest = sendMode === "specific";
    const audienceLabel = isSpecificTest
      ? `${selectedUsers.length} usuario(s) seleccionado(s)`
      : targetLabels[targetAudience];
    const payload = buildAudiencePayload();
    const isScheduled = deliveryMode === "schedule";

    const scheduleLabel =
      scheduleType === "ONCE"
        ? `Una vez el ${formatDate(new Date(scheduledAtLocal).toISOString())}`
        : `Repetir ${recurrenceDays
          .sort((a, b) => a - b)
          .map(
            (day) =>
              weekdayOptions.find((option) => option.value === day)?.label ||
              String(day)
          )
          .join(", ")} a las ${recurrenceTime}${maxRuns.trim() ? ` (${maxRuns} veces)` : ""
        }`;

    showConfirm({
      title: isScheduled
        ? "Confirmar programación"
        : isSpecificTest
          ? "Confirmar prueba"
          : "Confirmar envío",
      message: isScheduled
        ? `¿Programar esta campaña?\n\nAudiencia: ${audienceLabel}\nProgramación: ${scheduleLabel}\nAlcance: ${reach.users} usuario(s) con dispositivo (${reach.tokens} dispositivo(s))\nTítulo: ${payload.title}`
        : `¿Enviar esta campaña?\n\nAudiencia: ${audienceLabel}\nAlcance: ${reach.users} usuario(s) con dispositivo (${reach.tokens} dispositivo(s))\nTítulo: ${payload.title}\n\nEsta acción no se puede deshacer.`,
      confirmText: isScheduled
        ? "Programar campaña"
        : isSpecificTest
          ? "Enviar prueba"
          : "Enviar campaña",
      cancelText: "Cancelar",
      onConfirm: async () => {
        setSending(true);
        try {
          const response = isScheduled
            ? await notificationCampaignsApi.schedule(buildSchedulePayload())
            : await notificationCampaignsApi.send(payload);

          if (response.success) {
            resetForm();
            setPage(1);
            setSchedulesPage(1);
            await Promise.all([loadData(), loadSchedules()]);
            showAlert({
              title: isScheduled ? "Campaña programada" : "Campaña enviada",
              message: isScheduled
                ? "La campaña quedó programada correctamente."
                : isSpecificTest
                  ? "La prueba se envió correctamente a los usuarios seleccionados."
                  : "La campaña se envió correctamente.",
            });
          } else {
            showAlert({
              title: "Error",
              message:
                response.message ||
                (isScheduled
                  ? "No se pudo programar la campaña."
                  : "No se pudo enviar la campaña."),
            });
          }
        } catch (error) {
          console.error(
            isScheduled ? "Error programando campaña:" : "Error enviando campaña:",
            error
          );
          showAlert({
            title: "Error",
            message: isScheduled
              ? "No se pudo programar la campaña."
              : "No se pudo enviar la campaña.",
          });
        } finally {
          setSending(false);
        }
      },
    });
  };

  const handleToggleSchedule = async (schedule: CampaignSchedule) => {
    const nextStatus = schedule.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      const response = await notificationCampaignsApi.updateScheduleStatus(
        schedule.id,
        nextStatus
      );
      if (response.success) {
        await loadSchedules();
      } else {
        showAlert({
          title: "Error",
          message: response.message || "No se pudo actualizar la programación.",
        });
      }
    } catch (error) {
      console.error("Error actualizando programación:", error);
      showAlert({
        title: "Error",
        message: "No se pudo actualizar la programación.",
      });
    }
  };

  const handleOpenEditSchedule = async (schedule: CampaignSchedule) => {
    setEditingSchedule(schedule);
    setEditTitle(schedule.title);
    setEditBody(schedule.body);
    setEditScheduleType(schedule.scheduleType);
    setEditScheduledAtLocal(
      toDatetimeLocalValue(schedule.scheduledAt || schedule.nextRunAt)
    );
    setEditRecurrenceDays(schedule.recurrenceDays || []);
    setEditRecurrenceTime(schedule.recurrenceTime || "20:00");
    setEditMaxRuns(schedule.maxRuns != null ? String(schedule.maxRuns) : "");
    setEditSendMode(
      schedule.targetAudience === "SPECIFIC" ? "specific" : "broadcast"
    );
    setEditTargetAudience(
      schedule.targetAudience === "SPECIFIC"
        ? "ALL"
        : (schedule.targetAudience as Exclude<CampaignTarget, "SPECIFIC">)
    );
    setEditUserSearch("");
    setEditSearchResults([]);

    if (
      schedule.targetAudience === "SPECIFIC" &&
      schedule.targetUserIds?.length
    ) {
      try {
        const response = await notificationCampaignsApi.previewReach(
          schedule.targetUserIds
        );
        if (response.success) {
          const preview = response.data as ReachPreview;
          setEditSelectedUsers(preview.users);
        } else {
          setEditSelectedUsers([]);
        }
      } catch {
        setEditSelectedUsers([]);
      }
    } else {
      setEditSelectedUsers([]);
    }
  };

  const closeEditSchedule = () => {
    setEditingSchedule(null);
    setEditSelectedUsers([]);
    setEditUserSearch("");
    setEditSearchResults([]);
  };

  const toggleEditRecurrenceDay = (day: number) => {
    setEditRecurrenceDays((current) =>
      current.includes(day)
        ? current.filter((value) => value !== day)
        : [...current, day]
    );
  };

  const handleAddEditUser = (user: User) => {
    if (editSelectedUsers.some((selected) => selected.id === user.id)) return;
    if (editSelectedUsers.length >= 50) {
      showAlert({
        title: "Límite alcanzado",
        message: "Podés seleccionar hasta 50 usuarios por campaña.",
      });
      return;
    }

    setEditSelectedUsers((current) => [
      ...current,
      {
        id: user.id,
        email: user.email,
        userType: user.userType,
        displayName: getUserDisplayName(user),
      },
    ]);
    setEditUserSearch("");
    setEditSearchResults([]);
  };

  const handleRemoveEditUser = (userId: string) => {
    setEditSelectedUsers((current) =>
      current.filter((user) => user.id !== userId)
    );
  };

  const handleSaveEditSchedule = async () => {
    if (!editingSchedule) return;

    if (!editTitle.trim() || !editBody.trim()) {
      showAlert({
        title: "Campos requeridos",
        message: "El título y el mensaje son obligatorios.",
      });
      return;
    }

    if (editSendMode === "specific" && editSelectedUsers.length === 0) {
      showAlert({
        title: "Usuarios requeridos",
        message: "Seleccioná al menos un usuario.",
      });
      return;
    }

    if (editScheduleType === "ONCE") {
      if (!editScheduledAtLocal) {
        showAlert({
          title: "Fecha requerida",
          message: "Seleccioná cuándo querés enviar la campaña.",
        });
        return;
      }
      const scheduledDate = new Date(editScheduledAtLocal);
      if (Number.isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
        showAlert({
          title: "Fecha inválida",
          message: "La fecha programada debe ser posterior al momento actual.",
        });
        return;
      }
    }

    if (editScheduleType === "RECURRING") {
      if (editRecurrenceDays.length === 0 || !editRecurrenceTime) {
        showAlert({
          title: "Programación incompleta",
          message: "Seleccioná días y hora para la repetición.",
        });
        return;
      }
      if (editMaxRuns.trim()) {
        const parsedMaxRuns = parseMaxRuns(editMaxRuns);
        if (parsedMaxRuns == null) {
          showAlert({
            title: "Límite inválido",
            message:
              "El límite de repeticiones debe ser un número entre 1 y 365.",
          });
          return;
        }
        if (parsedMaxRuns <= (editingSchedule.runsCompleted || 0)) {
          showAlert({
            title: "Límite inválido",
            message: `El límite debe ser mayor a los ${editingSchedule.runsCompleted} envío(s) ya realizados.`,
          });
          return;
        }
      }
    }

    const parsedMaxRuns = parseMaxRuns(editMaxRuns);
    const payload = {
      title: editTitle.trim(),
      body: editBody.trim(),
      targetAudience:
        editSendMode === "specific" ? ("SPECIFIC" as const) : editTargetAudience,
      userIds:
        editSendMode === "specific"
          ? editSelectedUsers.map((user) => user.id)
          : undefined,
      scheduleType: editScheduleType,
      scheduledAt:
        editScheduleType === "ONCE"
          ? new Date(editScheduledAtLocal).toISOString()
          : undefined,
      recurrenceDays:
        editScheduleType === "RECURRING" ? editRecurrenceDays : undefined,
      recurrenceTime:
        editScheduleType === "RECURRING" ? editRecurrenceTime : undefined,
      maxRuns:
        editScheduleType === "RECURRING" && parsedMaxRuns != null
          ? parsedMaxRuns
          : undefined,
      timezone: "America/Argentina/Buenos_Aires",
    };

    setSavingEdit(true);
    try {
      const response = await notificationCampaignsApi.updateSchedule(
        editingSchedule.id,
        payload
      );
      if (response.success) {
        closeEditSchedule();
        await loadSchedules();
        showAlert({
          title: "Programación actualizada",
          message: "Los cambios se guardaron correctamente.",
        });
      } else {
        showAlert({
          title: "Error",
          message: response.message || "No se pudo actualizar la programación.",
        });
      }
    } catch (error) {
      console.error("Error actualizando programación:", error);
      showAlert({
        title: "Error",
        message: "No se pudo actualizar la programación.",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteSchedule = (schedule: CampaignSchedule) => {
    showConfirm({
      title: "Eliminar programación",
      message: `¿Eliminar la programación "${schedule.title}"?`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          const response = await notificationCampaignsApi.deleteSchedule(
            schedule.id
          );
          if (response.success) {
            await loadSchedules();
            showAlert({
              title: "Programación eliminada",
              message: "La programación se eliminó correctamente.",
            });
          } else {
            showAlert({
              title: "Error",
              message: response.message || "No se pudo eliminar la programación.",
            });
          }
        } catch (error) {
          console.error("Error eliminando programación:", error);
          showAlert({
            title: "Error",
            message: "No se pudo eliminar la programación.",
          });
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
          Enviá notificaciones push masivas, programalas o repetilas semanalmente
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
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${sendMode === "broadcast"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
              >
                Campaña masiva
              </button>
              <button
                type="button"
                onClick={() => setSendMode("specific")}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${sendMode === "specific"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
              >
                Prueba con usuarios específicos
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuándo enviar
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMode("now")}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${deliveryMode === "now"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
              >
                Enviar ahora
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMode("schedule")}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${deliveryMode === "schedule"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
              >
                Programar
              </button>
            </div>
          </div>

          {deliveryMode === "schedule" && (
            <div className="space-y-4 rounded-lg border border-indigo-100 bg-indigo-50/40 p-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de programación
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setScheduleType("ONCE")}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${scheduleType === "ONCE"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    <CalendarClock className="h-4 w-4" />
                    Una sola vez
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleType("RECURRING")}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${scheduleType === "RECURRING"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    <Repeat className="h-4 w-4" />
                    Repetir semanalmente
                  </button>
                </div>
              </div>

              {scheduleType === "ONCE" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha y hora
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAtLocal}
                    onChange={(e) => setScheduledAtLocal(e.target.value)}
                    className="w-full md:w-auto border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Días de la semana
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {weekdayOptions.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleRecurrenceDay(day.value)}
                          className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${recurrenceDays.includes(day.value)
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora
                    </label>
                    <input
                      type="time"
                      value={recurrenceTime}
                      onChange={(e) => setRecurrenceTime(e.target.value)}
                      className="w-full md:w-auto border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Límite de repeticiones (opcional)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={maxRuns}
                      onChange={(e) => setMaxRuns(e.target.value)}
                      placeholder="Sin límite"
                      className="w-full md:w-48 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ejemplo: 4 para enviar solo 4 veces y detenerse.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

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
              (sendMode === "specific" && selectedUsers.length === 0) ||
              (deliveryMode === "schedule" &&
                scheduleType === "RECURRING" &&
                recurrenceDays.length === 0)
            }
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deliveryMode === "schedule" ? (
              <CalendarClock className="h-5 w-5" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            {sending
              ? deliveryMode === "schedule"
                ? "Programando..."
                : "Enviando..."
              : deliveryMode === "schedule"
                ? "Programar campaña"
                : sendMode === "specific"
                  ? "Enviar prueba"
                  : "Enviar campaña"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            Campañas programadas
          </h2>
        </div>

        {loadingSchedules ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : schedules.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay campañas programadas.
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
                    Programación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Próximo envío
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map((schedule) => {
                  const status = scheduleStatusConfig[schedule.status];
                  return (
                    <tr key={schedule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {schedule.title}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {schedule.body}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {targetLabels[schedule.targetAudience]}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {schedule.scheduleSummary ||
                          (schedule.scheduleType === "RECURRING"
                            ? `Repetir a las ${schedule.recurrenceTime}`
                            : formatDate(schedule.scheduledAt))}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {schedule.status === "COMPLETED"
                          ? "-"
                          : formatDate(schedule.nextRunAt)}
                        {schedule.lastRunAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Último: {formatDate(schedule.lastRunAt)}
                          </p>
                        )}
                        {schedule.scheduleType === "RECURRING" && (
                          <p className="text-xs text-gray-500 mt-1">
                            Envíos: {schedule.runsCompleted || 0}
                            {schedule.maxRuns != null
                              ? ` / ${schedule.maxRuns}`
                              : " (sin límite)"}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {schedule.status !== "COMPLETED" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEditSchedule(schedule)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleSchedule(schedule)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                                title={
                                  schedule.status === "ACTIVE"
                                    ? "Pausar"
                                    : "Reanudar"
                                }
                              >
                                {schedule.status === "ACTIVE" ? (
                                  <>
                                    <Pause className="h-4 w-4" />
                                    Pausar
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-4 w-4" />
                                    Reanudar
                                  </>
                                )}
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteSchedule(schedule)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-sm text-red-700 hover:bg-red-50"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {schedulesTotalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Página {schedulesPage} de {schedulesTotalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setSchedulesPage((current) => Math.max(1, current - 1))
                }
                disabled={schedulesPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() =>
                  setSchedulesPage((current) =>
                    Math.min(schedulesTotalPages, current + 1)
                  )
                }
                disabled={schedulesPage === schedulesTotalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
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

      {editingSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Editar programación
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingSchedule.runsCompleted
                      ? `${editingSchedule.runsCompleted} envío(s) ya realizados`
                      : "Todavía no se envió"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeEditSchedule}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    maxLength={120}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje
                  </label>
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    maxLength={500}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audiencia
                  </label>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => setEditSendMode("broadcast")}
                      className={`px-4 py-2 rounded-lg border text-sm ${editSendMode === "broadcast"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300"
                        }`}
                    >
                      Masiva
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditSendMode("specific")}
                      className={`px-4 py-2 rounded-lg border text-sm ${editSendMode === "specific"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300"
                        }`}
                    >
                      Usuarios específicos
                    </button>
                  </div>

                  {editSendMode === "broadcast" ? (
                    <select
                      value={editTargetAudience}
                      onChange={(e) =>
                        setEditTargetAudience(
                          e.target.value as Exclude<CampaignTarget, "SPECIFIC">
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    >
                      <option value="ALL">Todos los usuarios</option>
                      <option value="POSTULANTE">Solo postulantes</option>
                      <option value="EMPRESA">Solo empresas</option>
                    </select>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editUserSearch}
                        onChange={(e) => setEditUserSearch(e.target.value)}
                        placeholder="Buscar usuarios..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      />
                      {editSearchingUsers && (
                        <p className="text-sm text-gray-500">Buscando...</p>
                      )}
                      {editSearchResults.length > 0 && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          {editSearchResults.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => handleAddEditUser(user)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0"
                            >
                              {getUserDisplayName(user)} · {user.email}
                            </button>
                          ))}
                        </div>
                      )}
                      {editSelectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {editSelectedUsers.map((user) => (
                            <span
                              key={user.id}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-900 text-sm"
                            >
                              {user.displayName || user.email}
                              <button
                                type="button"
                                onClick={() => handleRemoveEditUser(user.id)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de programación
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={(editingSchedule.runsCompleted || 0) > 0}
                      onClick={() => setEditScheduleType("ONCE")}
                      className={`px-4 py-2 rounded-lg border text-sm ${editScheduleType === "ONCE"
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-700 border-gray-300"
                        } disabled:opacity-50`}
                    >
                      Una sola vez
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditScheduleType("RECURRING")}
                      className={`px-4 py-2 rounded-lg border text-sm ${editScheduleType === "RECURRING"
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-700 border-gray-300"
                        }`}
                    >
                      Repetir semanalmente
                    </button>
                  </div>
                </div>

                {editScheduleType === "ONCE" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha y hora
                    </label>
                    <input
                      type="datetime-local"
                      value={editScheduledAtLocal}
                      onChange={(e) => setEditScheduledAtLocal(e.target.value)}
                      className="w-full md:w-auto border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Días
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {weekdayOptions.map((day) => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleEditRecurrenceDay(day.value)}
                            className={`px-3 py-2 rounded-lg border text-sm ${editRecurrenceDays.includes(day.value)
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white text-gray-700 border-gray-300"
                              }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora
                      </label>
                      <input
                        type="time"
                        value={editRecurrenceTime}
                        onChange={(e) => setEditRecurrenceTime(e.target.value)}
                        className="w-full md:w-auto border border-gray-300 rounded-lg px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Límite de repeticiones (opcional)
                      </label>
                      <input
                        type="number"
                        min={(editingSchedule.runsCompleted || 0) + 1}
                        max={365}
                        value={editMaxRuns}
                        onChange={(e) => setEditMaxRuns(e.target.value)}
                        placeholder="Sin límite"
                        className="w-full md:w-48 border border-gray-300 rounded-lg px-4 py-2"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeEditSchedule}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditSchedule}
                  disabled={savingEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                  {savingEdit ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
