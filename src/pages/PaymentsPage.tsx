import { useEffect, useState } from "react";
import { paymentsApi } from "../services/api";
import type { PaymentTransaction, PaymentStats, PaginatedResponse } from "../types";
import {
  CreditCard,
  Calendar,
  User,
  Building2,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  TrendingUp,
  Smartphone,
  Apple,
  RefreshCw,
} from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
  REFUNDED: "bg-purple-100 text-purple-800",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  COMPLETED: "Completado",
  FAILED: "Fallido",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

const statusIcons: Record<string, typeof CheckCircle> = {
  PENDING: Clock,
  COMPLETED: CheckCircle,
  FAILED: XCircle,
  CANCELLED: AlertCircle,
  REFUNDED: DollarSign,
};

const methodLabels: Record<string, string> = {
  PAYPAL: "PayPal",
  MERCADOPAGO: "MercadoPago",
  STRIPE: "Stripe",
  APPLE_IAP: "Apple IAP",
  GOOGLE_PLAY: "Google Play",
};

const methodColors: Record<string, string> = {
  PAYPAL: "bg-blue-100 text-blue-800",
  MERCADOPAGO: "bg-sky-100 text-sky-800",
  STRIPE: "bg-violet-100 text-violet-800",
  APPLE_IAP: "bg-gray-100 text-gray-800",
  GOOGLE_PLAY: "bg-green-100 text-green-800",
};

const MethodIcon = ({ method }: { method: string }) => {
  switch (method) {
    case "APPLE_IAP":
      return <Apple className="h-3 w-3 mr-1" />;
    case "GOOGLE_PLAY":
      return <Smartphone className="h-3 w-3 mr-1" />;
    default:
      return <CreditCard className="h-3 w-3 mr-1" />;
  }
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [methodFilter, setMethodFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const pageSize = 20;

  useEffect(() => {
    loadPayments();
  }, [page, statusFilter, methodFilter, search, dateFrom, dateTo]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const response = await paymentsApi.list({
        page,
        pageSize,
        status: statusFilter || undefined,
        paymentMethod: methodFilter || undefined,
        search: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      if (response.success) {
        const data = response.data as PaginatedResponse<PaymentTransaction>;
        setPayments(data.items);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Error cargando pagos:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await paymentsApi.stats();
      if (response.success) {
        setStats(response.data as PaymentStats);
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearFilters = () => {
    setStatusFilter("");
    setMethodFilter("");
    setSearch("");
    setSearchInput("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-AR");
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const hasActiveFilters = statusFilter || methodFilter || search || dateFrom || dateTo;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pagos</h1>
          <p className="text-gray-600 mt-1">
            Registro de todos los pagos realizados en la plataforma
          </p>
        </div>
        <button
          onClick={() => {
            loadPayments();
            loadStats();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Pagos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalPayments}
                </p>
              </div>
              <CreditCard className="h-10 w-10 text-blue-500 opacity-50" />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {stats.todayPayments} hoy
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatRevenue(stats.totalRevenue)}
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500 opacity-50" />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {stats.completedPayments} pagos completados
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingPayments}
                </p>
              </div>
              <Clock className="h-10 w-10 text-yellow-500 opacity-50" />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {stats.failedPayments} fallidos
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Por Método</p>
                <div className="flex gap-3 mt-1">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">
                      {stats.byMethod.paypal}
                    </p>
                    <p className="text-[10px] text-gray-400">PayPal</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-600">
                      {stats.byMethod.appleIap}
                    </p>
                    <p className="text-[10px] text-gray-400">Apple</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">
                      {stats.byMethod.googlePlay}
                    </p>
                    <p className="text-[10px] text-gray-400">Google</p>
                  </div>
                </div>
              </div>
              <Smartphone className="h-10 w-10 text-purple-500 opacity-50" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Buscar
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Email, empresa, orden..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Todos</option>
              <option value="PENDING">Pendiente</option>
              <option value="COMPLETED">Completado</option>
              <option value="FAILED">Fallido</option>
              <option value="CANCELLED">Cancelado</option>
              <option value="REFUNDED">Reembolsado</option>
            </select>
          </div>

          {/* Method filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Método
            </label>
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Todos</option>
              <option value="PAYPAL">PayPal</option>
              <option value="APPLE_IAP">Apple IAP</option>
              <option value="GOOGLE_PLAY">Google Play</option>
              <option value="MERCADOPAGO">MercadoPago</option>
              <option value="STRIPE">Stripe</option>
            </select>
          </div>

          {/* Date from */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Desde
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Date to */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="mt-2 text-sm text-gray-500">
          {total} transacciones encontradas
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay pagos
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron transacciones con los filtros seleccionados.
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
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => {
                  const StatusIcon =
                    statusIcons[payment.status] || AlertCircle;
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.user?.email || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {payment.orderId.slice(0, 16)}
                              {payment.orderId.length > 16 ? "..." : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment.empresa ? (
                          <div className="flex items-center">
                            <Building2 className="h-5 w-5 text-blue-500 mr-2" />
                            <span className="text-sm text-gray-900">
                              {payment.empresa.companyName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment.plan ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.plan.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {payment.plan.code}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm font-semibold text-gray-900">
                            {formatAmount(payment.amount, payment.currency)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                            statusColors[payment.status] || "bg-gray-100"
                          }`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusLabels[payment.status] || payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            methodColors[payment.paymentMethod] ||
                            "bg-blue-100 text-blue-800"
                          }`}
                        >
                          <MethodIcon method={payment.paymentMethod} />
                          {methodLabels[payment.paymentMethod] ||
                            payment.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="text-sm text-gray-500 max-w-[200px] truncate"
                          title={payment.description || ""}
                        >
                          {payment.description || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          {formatDate(payment.createdAt)}
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
                Página {page} de {totalPages} ({total} resultados)
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
