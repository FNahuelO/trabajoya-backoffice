import { useEffect, useState } from "react";
import { adminApi } from "../services/api";
import DataTable from "../components/DataTable";
import Pagination from "../components/Pagination";
import { format } from "date-fns";
import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadMessages();
  }, [page]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getMessages({
        page,
        pageSize,
      });
      if (response.success && response.data) {
        setMessages(response.data.items || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error("Error cargando mensajes:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeBadge = (userType: string) => {
    const badges = {
      POSTULANTE: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
          Postulante
        </span>
      ),
      EMPRESA: (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          Empresa
        </span>
      ),
    };
    return badges[userType as keyof typeof badges] || userType;
  };

  const columns = [
    {
      key: "fromUser",
      header: "De",
      render: (msg: any) => (
        <div>
          <div className="font-medium">{msg.fromUser?.email || "N/A"}</div>
          <div className="text-xs text-gray-500">
            {getUserTypeBadge(msg.fromUser?.userType || "")}
          </div>
        </div>
      ),
    },
    {
      key: "toUser",
      header: "Para",
      render: (msg: any) => (
        <div>
          <div className="font-medium">{msg.toUser?.email || "N/A"}</div>
          <div className="text-xs text-gray-500">
            {getUserTypeBadge(msg.toUser?.userType || "")}
          </div>
        </div>
      ),
    },
    {
      key: "content",
      header: "Mensaje",
      render: (msg: any) => (
        <div className="max-w-md">
          <div
            className="truncate text-sm text-gray-700"
            title={msg.content}
          >
            {msg.content || "Sin contenido"}
          </div>
        </div>
      ),
    },
    {
      key: "isRead",
      header: "Leído",
      render: (msg: any) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            msg.isRead
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {msg.isRead ? "Sí" : "No"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Fecha",
      render: (msg: any) => format(new Date(msg.createdAt), "dd/MM/yyyy HH:mm"),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <MessageSquare className="h-8 w-8" />
          Mensajes
        </h1>
      </div>

      <DataTable data={messages} columns={columns} loading={loading} />
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

