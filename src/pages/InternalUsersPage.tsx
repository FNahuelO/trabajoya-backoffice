import { useEffect, useState } from "react";
import { internalUsersApi, rolesApi } from "../services/api";
import DataTable from "../components/DataTable";
import Pagination from "../components/Pagination";
import { format } from "date-fns";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import type { InternalUser, Role } from "../types";

export default function InternalUsersPage() {
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<InternalUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRoleId, setFormRoleId] = useState("");

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await internalUsersApi.list({
        page,
        pageSize,
        search: search || undefined,
      });
      if (response.success && response.data) {
        setUsers(response.data.items || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error("Error cargando usuarios internos:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await rolesApi.list();
      if (response.success && response.data) {
        setRoles(response.data);
      }
    } catch (error) {
      console.error("Error cargando roles:", error);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormEmail("");
    setFormPassword("");
    setFormRoleId("");
    setError("");
    setShowModal(true);
  };

  const openEditModal = (user: InternalUser) => {
    setEditingUser(user);
    setFormEmail(user.email);
    setFormPassword("");
    setFormRoleId(user.role?.id || "");
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formEmail.trim()) {
      setError("El email es obligatorio");
      return;
    }
    if (!editingUser && !formPassword.trim()) {
      setError("La contraseña es obligatoria para nuevos usuarios");
      return;
    }
    if (formPassword && formPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setSaving(true);
    setError("");
    try {
      if (editingUser) {
        const updateData: any = {};
        if (formEmail !== editingUser.email) updateData.email = formEmail;
        if (formPassword) updateData.password = formPassword;
        if (formRoleId !== (editingUser.role?.id || "")) {
          updateData.roleId = formRoleId || null;
        }
        await internalUsersApi.update(editingUser.id, updateData);
      } else {
        await internalUsersApi.create({
          email: formEmail,
          password: formPassword,
          roleId: formRoleId || undefined,
        });
      }
      setShowModal(false);
      loadUsers();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error al guardar el usuario"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: InternalUser) => {
    if (
      !confirm(
        `¿Estás seguro de eliminar al usuario "${user.email}"? Esta acción no se puede deshacer.`
      )
    )
      return;

    try {
      await internalUsersApi.delete(user.id);
      loadUsers();
    } catch (err: any) {
      alert(
        err.response?.data?.message || "Error al eliminar el usuario"
      );
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const columns = [
    {
      key: "email",
      header: "Email",
      accessor: (user: InternalUser) => user.email,
    },
    {
      key: "role",
      header: "Rol",
      render: (user: InternalUser) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            user.role
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {user.role?.displayName || "Sin rol"}
        </span>
      ),
    },
    {
      key: "isVerified",
      header: "Estado",
      render: (user: InternalUser) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            user.isVerified
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {user.isVerified ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Creado",
      render: (user: InternalUser) =>
        format(new Date(user.createdAt), "dd/MM/yyyy HH:mm"),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (user: InternalUser) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(user);
            }}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(user);
            }}
            className="text-red-600 hover:text-red-800 p-1"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Usuarios Internos
        </h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Buscar por email..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Buscar
        </button>
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setSearchInput("");
              setPage(1);
            }}
            className="px-4 py-2 text-gray-500 hover:text-gray-700"
          >
            Limpiar
          </button>
        )}
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

      {/* Modal crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingUser ? "Editar Usuario" : "Nuevo Usuario Interno"}
              </h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="usuario@trabajoya.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña{" "}
                    {editingUser && (
                      <span className="text-gray-400 font-normal">
                        (dejar vacío para no cambiar)
                      </span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={
                      editingUser ? "••••••••" : "Mínimo 6 caracteres"
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol
                  </label>
                  <select
                    value={formRoleId}
                    onChange={(e) => setFormRoleId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sin rol asignado</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.displayName}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    El rol determina los permisos del usuario en el backoffice
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving
                    ? "Guardando..."
                    : editingUser
                    ? "Actualizar"
                    : "Crear Usuario"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}















