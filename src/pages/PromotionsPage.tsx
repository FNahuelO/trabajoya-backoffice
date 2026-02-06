import { useEffect, useState } from "react";
import { promotionsApi } from "../services/api";
import type { UserPromotion, PaginatedResponse } from "../types";
import { Gift, Calendar, User, CheckCircle, Clock, XCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-blue-100 text-blue-800",
  CLAIMED: "bg-yellow-100 text-yellow-800",
  USED: "bg-green-100 text-green-800",
  EXPIRED: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, string> = {
  AVAILABLE: "Disponible",
  CLAIMED: "Reclamada",
  USED: "Usada",
  EXPIRED: "Expirada",
};

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<UserPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const pageSize = 20;

  useEffect(() => {
    loadPromotions();
  }, [page, statusFilter]);

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const response = await promotionsApi.list({
        page,
        pageSize,
        status: statusFilter || undefined,
      });
      if (response.success) {
        const data = response.data as PaginatedResponse<UserPromotion>;
        setPromotions(data.items);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Error cargando promociones:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("es-AR");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promociones</h1>
          <p className="text-gray-600 mt-1">
            {total} promociones en total
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
            <option value="AVAILABLE">Disponible</option>
            <option value="CLAIMED">Reclamada</option>
            <option value="USED">Usada</option>
            <option value="EXPIRED">Expirada</option>
          </select>
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
            No se encontraron promociones con los filtros seleccionados.
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
                    Promoción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reclamada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creada
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {promotions.map((promotion) => (
                  <tr key={promotion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {promotion.user?.email || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {promotion.user?.userType}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Gift className="h-5 w-5 text-purple-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {promotion.promoKey}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[promotion.status] || "bg-gray-100"
                        }`}
                      >
                        {statusLabels[promotion.status] || promotion.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {promotion.claimedAt ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            {formatDate(promotion.claimedAt)}
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 text-gray-400 mr-1" />
                            Pendiente
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {promotion.usedAt ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            {formatDate(promotion.usedAt)}
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-gray-400 mr-1" />
                            No usada
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        {formatDate(promotion.createdAt)}
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
    </div>
  );
}

