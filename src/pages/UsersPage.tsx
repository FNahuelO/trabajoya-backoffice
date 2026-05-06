import { useCallback, useEffect, useState } from "react";
import { adminApi } from "../services/api";
import { useAlert } from "../hooks/useAlert";
import DataTable from "../components/DataTable";
import type { DataTableQuery } from "../components/DataTable";
import Pagination from "../components/Pagination";
import { format } from "date-fns";
import type { User } from "../types";

export default function UsersPage() {
  const { showAlert, showConfirm, AlertComponent } = useAlert();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [userType, setUserType] = useState<string>("");
  const [tableQuery, setTableQuery] = useState<DataTableQuery>({
    sortBy: null,
    sortOrder: null,
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUsers({
        page,
        pageSize,
        userType: userType || undefined,
        sortBy: tableQuery.sortBy || undefined,
        sortOrder: tableQuery.sortOrder || undefined,
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
  }, [page, pageSize, tableQuery.sortBy, tableQuery.sortOrder, userType]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleResetPassword = (user: User) => {
    showConfirm({
      title: "Resetear contraseña",
      message: `¿Querés resetear la contraseña de ${user.email}?`,
      confirmText: "Resetear",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          const response = await adminApi.resetUserPassword(user.id);
          const temporaryPassword = response?.data?.temporaryPassword;
          showConfirm({
            title: "Contraseña temporal generada",
            message: `Usuario: ${user.email}\nNueva contraseña temporal: ${temporaryPassword}\n\n¿Querés copiarla al portapapeles?`,
            confirmText: "Copiar",
            cancelText: "Cerrar",
            onConfirm: async () => {
              try {
                await navigator.clipboard.writeText(String(temporaryPassword || ""));
                showAlert({
                  title: "Copiado",
                  message: "La contraseña temporal fue copiada al portapapeles.",
                });
              } catch (copyError) {
                showAlert({
                  title: "Error",
                  message: "No se pudo copiar la contraseña automáticamente.",
                });
              }
            },
          });
        } catch (error) {
          showAlert({
            title: "Error",
            message: "No se pudo resetear la contraseña del usuario",
          });
        }
      },
    });
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
          className={`px-2 py-1 text-xs font-semibold rounded-full ${user.userType === "EMPRESA"
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
          className={`px-2 py-1 text-xs font-semibold rounded-full ${user.isVerified
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
    {
      key: "actions",
      header: "Acciones",
      sortable: false,
      render: (user: User) => (
        <button
          onClick={(event) => {
            event.stopPropagation();
            handleResetPassword(user);
          }}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
        >
          Resetear contraseña
        </button>
      ),
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

      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        serverSide
        onQueryChange={(query) => {
          setTableQuery(query);
          setPage(1);
        }}
      />
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
      <AlertComponent />
    </div>
  );
}
