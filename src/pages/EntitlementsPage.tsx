import { useEffect, useState } from "react";
import { entitlementsApi } from "../services/api";
import type { JobPostEntitlement, PaginatedResponse } from "../types";
import {
  Key,
  Calendar,
  User,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Apple,
  Smartphone,
  Gift,
  Edit,
} from "lucide-react";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  EXPIRED: "bg-gray-100 text-gray-500",
  REVOKED: "bg-red-100 text-red-800",
  REFUNDED: "bg-purple-100 text-purple-800",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Activo",
  EXPIRED: "Expirado",
  REVOKED: "Revocado",
  REFUNDED: "Reembolsado",
};

const sourceColors: Record<string, string> = {
  APPLE_IAP: "bg-gray-100 text-gray-800",
  GOOGLE_PLAY: "bg-green-100 text-green-800",
  PROMO: "bg-yellow-100 text-yellow-800",
  MANUAL: "bg-blue-100 text-blue-800",
};

const sourceIcons: Record<string, typeof Apple> = {
  APPLE_IAP: Apple,
  GOOGLE_PLAY: Smartphone,
  PROMO: Gift,
  MANUAL: Edit,
};

export default function EntitlementsPage() {
  const [entitlements, setEntitlements] = useState<JobPostEntitlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const pageSize = 20;

  useEffect(() => {
    loadEntitlements();
  }, [page, statusFilter]);

  const loadEntitlements = async () => {
    setLoading(true);
    try {
      const response = await entitlementsApi.list({
        page,
        pageSize,
        status: statusFilter || undefined,
      });
      if (response.success) {
        const data = response.data as PaginatedResponse<JobPostEntitlement>;
        setEntitlements(data.items);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Error cargando entitlements:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-AR");
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entitlements</h1>
          <p className="text-gray-600 mt-1">
            {total} derechos de publicación en total
          </p>
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
            <option value="ACTIVE">Activo</option>
            <option value="EXPIRED">Expirado</option>
            <option value="REVOKED">Revocado</option>
            <option value="REFUNDED">Reembolsado</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : entitlements.length === 0 ? (
        <div className="text-center py-12">
          <Key className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay entitlements
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron derechos de publicación con los filtros
            seleccionados.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trabajo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expira
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ediciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entitlements.map((entitlement) => {
                  const SourceIcon =
                    sourceIcons[entitlement.source] || AlertCircle;
                  const expired = isExpired(entitlement.expiresAt);
                  return (
                    <tr key={entitlement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {entitlement.user?.email || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {entitlement.user?.userType}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Briefcase className="h-5 w-5 text-blue-500 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {entitlement.job?.title || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {entitlement.job?.status}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
                          <Key className="h-3 w-3 mr-1" />
                          {entitlement.planKey}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                            sourceColors[entitlement.source] || "bg-gray-100"
                          }`}
                        >
                          <SourceIcon className="h-3 w-3 mr-1" />
                          {entitlement.source.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                            statusColors[entitlement.status] || "bg-gray-100"
                          }`}
                        >
                          {entitlement.status === "ACTIVE" && !expired ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {statusLabels[entitlement.status] ||
                            entitlement.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          {expired ? (
                            <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                          ) : (
                            <Clock className="h-4 w-4 text-green-500 mr-1" />
                          )}
                          <span className={expired ? "text-red-500" : ""}>
                            {formatDate(entitlement.expiresAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col">
                          <span>
                            Ediciones: {entitlement.editsUsed}/
                            {entitlement.maxEdits}
                          </span>
                          {entitlement.allowCategoryChange && (
                            <span className="text-xs">
                              Categoría: {entitlement.categoryChangesUsed}/
                              {entitlement.maxCategoryChanges}
                            </span>
                          )}
                        </div>
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

