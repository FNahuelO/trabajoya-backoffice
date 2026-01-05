import { useEffect, useState } from "react";
import { adminApi } from "../services/api";
import DataTable from "../components/DataTable";
import Pagination from "../components/Pagination";
import { format } from "date-fns";
import type { User } from "../types";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [userType, setUserType] = useState<string>("");

  useEffect(() => {
    loadUsers();
  }, [page, userType]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUsers({
        page,
        pageSize,
        userType: userType || undefined,
      });
      if (response.success && response.data) {
        setUsers(response.data.items || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "email",
      header: "Email",
      accessor: (user: User) => user.email,
    },
    {
      key: "userType",
      header: "Tipo",
      render: (user: User) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            user.userType === "EMPRESA"
              ? "bg-blue-100 text-blue-800"
              : "bg-purple-100 text-purple-800"
          }`}
        >
          {user.userType}
        </span>
      ),
    },
    {
      key: "isVerified",
      header: "Verificado",
      render: (user: User) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            user.isVerified
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {user.isVerified ? "Sí" : "No"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Fecha Creación",
      render: (user: User) => format(new Date(user.createdAt), "dd/MM/yyyy"),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
        <select
          value={userType}
          onChange={(e) => {
            setUserType(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los tipos</option>
          <option value="POSTULANTE">Postulantes</option>
          <option value="EMPRESA">Empresas</option>
        </select>
      </div>

      <DataTable data={users} columns={columns} loading={loading} />
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
