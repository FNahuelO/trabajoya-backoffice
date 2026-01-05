import { useEffect, useState } from "react";
import { adminApi } from "../services/api";
import DataTable from "../components/DataTable";
import Pagination from "../components/Pagination";
import { format } from "date-fns";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    loadSubscriptions();
  }, [page, status]);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getSubscriptions({
        page,
        pageSize,
        status: status || undefined,
      });
      if (response.success && response.data) {
        setSubscriptions(response.data.items || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error("Error cargando suscripciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Activa
        </span>
      ),
      CANCELED: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Cancelada
        </span>
      ),
      EXPIRED: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          Expirada
        </span>
      ),
      PENDING: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Pendiente
        </span>
      ),
    };
    return badges[status as keyof typeof badges] || status;
  };

  const getPlanBadge = (plan: string) => {
    const badges = {
      ENTERPRISE: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
          Enterprise
        </span>
      ),
      PREMIUM: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          Premium
        </span>
      ),
      BASIC: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          Basic
        </span>
      ),
    };
    return badges[plan as keyof typeof badges] || plan;
  };

  const columns = [
    {
      key: "empresa",
      header: "Empresa",
      render: (sub: any) => (
        <div>
          <div className="font-medium">{sub.empresa?.companyName || "N/A"}</div>
          <div className="text-xs text-gray-500">
            {sub.empresa?.user?.email || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "planType",
      header: "Plan",
      render: (sub: any) => getPlanBadge(sub.planType),
    },
    {
      key: "status",
      header: "Estado",
      render: (sub: any) => getStatusBadge(sub.status),
    },
    {
      key: "paypal",
      header: "PayPal",
      render: (sub: any) => (
        <div className="text-xs">
          {sub.paypalOrderId && (
            <div className="text-gray-600">
              Order: {sub.paypalOrderId.substring(0, 20)}...
            </div>
          )}
          {sub.paypalSubscriptionId && (
            <div className="text-gray-600">
              Sub: {sub.paypalSubscriptionId.substring(0, 20)}...
            </div>
          )}
          {!sub.paypalOrderId && !sub.paypalSubscriptionId && (
            <span className="text-gray-400">N/A</span>
          )}
        </div>
      ),
    },
    {
      key: "startDate",
      header: "Fecha Inicio",
      render: (sub: any) => format(new Date(sub.startDate), "dd/MM/yyyy"),
    },
    {
      key: "endDate",
      header: "Fecha Fin",
      render: (sub: any) =>
        sub.endDate ? format(new Date(sub.endDate), "dd/MM/yyyy") : "N/A",
    },
    {
      key: "canceledAt",
      header: "Cancelada",
      render: (sub: any) =>
        sub.canceledAt ? format(new Date(sub.canceledAt), "dd/MM/yyyy") : "N/A",
    },
    {
      key: "createdAt",
      header: "Fecha Creación",
      render: (sub: any) => format(new Date(sub.createdAt), "dd/MM/yyyy"),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Suscripciones</h1>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVE">Activas</option>
          <option value="CANCELED">Canceladas</option>
          <option value="EXPIRED">Expiradas</option>
          <option value="PENDING">Pendientes</option>
        </select>
      </div>

      <DataTable data={subscriptions} columns={columns} loading={loading} />
      {!loading && total > 0 && (
        <div className="mt-4">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
