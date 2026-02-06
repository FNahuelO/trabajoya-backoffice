import { useEffect, useState } from "react";
import { videoMeetingsApi } from "../services/api";
import type { VideoMeeting, PaginatedResponse } from "../types";
import {
  Video,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Link as LinkIcon,
} from "lucide-react";

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  ACCEPTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-gray-100 text-gray-500",
  MISSED: "bg-orange-100 text-orange-800",
};

const statusLabels: Record<string, string> = {
  SCHEDULED: "Programada",
  ACCEPTED: "Aceptada",
  REJECTED: "Rechazada",
  IN_PROGRESS: "En progreso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  MISSED: "Perdida",
};

const statusIcons: Record<string, typeof CheckCircle> = {
  SCHEDULED: Clock,
  ACCEPTED: CheckCircle,
  REJECTED: XCircle,
  IN_PROGRESS: Play,
  COMPLETED: CheckCircle,
  CANCELLED: AlertCircle,
  MISSED: AlertCircle,
};

export default function VideoMeetingsPage() {
  const [meetings, setMeetings] = useState<VideoMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const pageSize = 20;

  useEffect(() => {
    loadMeetings();
  }, [page, statusFilter]);

  const loadMeetings = async () => {
    setLoading(true);
    try {
      const response = await videoMeetingsApi.list({
        page,
        pageSize,
        status: statusFilter || undefined,
      });
      if (response.success) {
        const data = response.data as PaginatedResponse<VideoMeeting>;
        setMeetings(data.items);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Error cargando reuniones:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-AR");
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "-";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Video Reuniones</h1>
          <p className="text-gray-600 mt-1">{total} reuniones en total</p>
        </div>
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="SCHEDULED">Programada</option>
            <option value="ACCEPTED">Aceptada</option>
            <option value="REJECTED">Rechazada</option>
            <option value="IN_PROGRESS">En progreso</option>
            <option value="COMPLETED">Completada</option>
            <option value="CANCELLED">Cancelada</option>
            <option value="MISSED">Perdida</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-12">
          <Video className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay reuniones
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron reuniones con los filtros seleccionados.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organizador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invitado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Programada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {meetings.map((meeting) => {
                  const StatusIcon =
                    statusIcons[meeting.status] || AlertCircle;
                  return (
                    <tr key={meeting.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Video className="h-5 w-5 text-purple-500 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {meeting.title || "Sin título"}
                            </div>
                            {meeting.description && (
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {meeting.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-blue-500 mr-2" />
                          <div>
                            <div className="text-sm text-gray-900">
                              {meeting.createdBy?.email || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {meeting.createdBy?.userType}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-green-500 mr-2" />
                          <div>
                            <div className="text-sm text-gray-900">
                              {meeting.invitedUser?.email || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {meeting.invitedUser?.userType}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          {formatDate(meeting.scheduledAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          {formatDuration(meeting.duration)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                            statusColors[meeting.status] || "bg-gray-100"
                          }`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusLabels[meeting.status] || meeting.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {meeting.meetingUrl ? (
                          <a
                            href={meeting.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <LinkIcon className="h-4 w-4 mr-1" />
                            <span className="text-sm">Ver</span>
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
    </div>
  );
}

