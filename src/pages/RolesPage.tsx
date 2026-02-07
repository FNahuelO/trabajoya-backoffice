import { useEffect, useState } from "react";
import { rolesApi } from "../services/api";
import { format } from "date-fns";
import { Plus, Pencil, Trash2, Shield, ChevronDown, ChevronUp } from "lucide-react";
import type { Role } from "../types";
import { AVAILABLE_PERMISSIONS } from "../types";

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formName, setFormName] = useState("");
  const [formDisplayName, setFormDisplayName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPermissions, setFormPermissions] = useState<string[]>([]);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const response = await rolesApi.list();
      if (response.success && response.data) {
        setRoles(response.data);
      }
    } catch (error) {
      console.error("Error cargando roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingRole(null);
    setFormName("");
    setFormDisplayName("");
    setFormDescription("");
    setFormPermissions([]);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setFormName(role.name);
    setFormDisplayName(role.displayName);
    setFormDescription(role.description || "");
    setFormPermissions([...role.permissions]);
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formDisplayName.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (formPermissions.length === 0) {
      setError("Debe seleccionar al menos un permiso");
      return;
    }

    setSaving(true);
    setError("");
    try {
      if (editingRole) {
        await rolesApi.update(editingRole.id, {
          displayName: formDisplayName,
          description: formDescription || undefined,
          permissions: formPermissions,
        });
      } else {
        if (!formName.trim()) {
          setError("El código es obligatorio");
          setSaving(false);
          return;
        }
        await rolesApi.create({
          name: formName.toUpperCase().replace(/\s+/g, "_"),
          displayName: formDisplayName,
          description: formDescription || undefined,
          permissions: formPermissions,
        });
      }
      setShowModal(false);
      loadRoles();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error al guardar el rol"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role: Role) => {
    if (role.isSystem) {
      alert("No se pueden eliminar roles del sistema");
      return;
    }
    if (
      !confirm(
        `¿Estás seguro de eliminar el rol "${role.displayName}"?`
      )
    )
      return;

    try {
      await rolesApi.delete(role.id);
      loadRoles();
    } catch (err: any) {
      alert(
        err.response?.data?.message || "Error al eliminar el rol"
      );
    }
  };

  const togglePermission = (perm: string) => {
    setFormPermissions((prev) =>
      prev.includes(perm)
        ? prev.filter((p) => p !== perm)
        : [...prev, perm]
    );
  };

  const toggleGroup = (group: string) => {
    const groupPerms = AVAILABLE_PERMISSIONS
      .filter((p) => p.group === group)
      .map((p) => p.key);
    const allSelected = groupPerms.every((p) => formPermissions.includes(p));
    if (allSelected) {
      setFormPermissions((prev) =>
        prev.filter((p) => !groupPerms.includes(p))
      );
    } else {
      setFormPermissions((prev) => [
        ...prev,
        ...groupPerms.filter((p) => !prev.includes(p)),
      ]);
    }
  };

  const selectAll = () => {
    setFormPermissions(AVAILABLE_PERMISSIONS.map((p) => p.key));
  };

  const deselectAll = () => {
    setFormPermissions([]);
  };

  // Agrupar permisos
  const permissionGroups = AVAILABLE_PERMISSIONS.reduce(
    (acc, perm) => {
      if (!acc[perm.group]) acc[perm.group] = [];
      acc[perm.group].push(perm);
      return acc;
    },
    {} as Record<string, typeof AVAILABLE_PERMISSIONS[number][]>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Roles</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo Rol
        </button>
      </div>

      <div className="grid gap-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {role.displayName}
                    {role.isSystem && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                        Sistema
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {role.description || "Sin descripción"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {role._count?.users || 0} usuario(s)
                </span>
                <span className="text-sm text-gray-400">
                  {role.permissions.length} permisos
                </span>
                <button
                  onClick={() =>
                    setExpandedRole(
                      expandedRole === role.id ? null : role.id
                    )
                  }
                  className="text-gray-400 hover:text-gray-600"
                >
                  {expandedRole === role.id ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={() => openEditModal(role)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                {!role.isSystem && (
                  <button
                    onClick={() => handleDelete(role)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {expandedRole === role.id && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">
                  Permisos asignados
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.map((perm) => {
                    const permDef = AVAILABLE_PERMISSIONS.find(
                      (p) => p.key === perm
                    );
                    return (
                      <span
                        key={perm}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                      >
                        {permDef?.label || perm}
                      </span>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Código: <code className="bg-gray-100 px-1 rounded">{role.name}</code>
                  {" · "}
                  Creado: {format(new Date(role.createdAt), "dd/MM/yyyy HH:mm")}
                </p>
              </div>
            )}
          </div>
        ))}

        {roles.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay roles configurados
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingRole ? "Editar Rol" : "Nuevo Rol"}
              </h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {!editingRole && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código (interno)
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) =>
                        setFormName(
                          e.target.value.toUpperCase().replace(/\s+/g, "_")
                        )
                      }
                      placeholder="Ej: AUDITOR"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre para mostrar
                  </label>
                  <input
                    type="text"
                    value={formDisplayName}
                    onChange={(e) => setFormDisplayName(e.target.value)}
                    placeholder="Ej: Auditor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Descripción del rol..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Permisos ({formPermissions.length} seleccionados)
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAll}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Seleccionar todos
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={deselectAll}
                        className="text-xs text-gray-500 hover:underline"
                      >
                        Quitar todos
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto">
                    {Object.entries(permissionGroups).map(
                      ([group, perms]) => {
                        const allSelected = perms.every((p) =>
                          formPermissions.includes(p.key)
                        );
                        const someSelected =
                          !allSelected &&
                          perms.some((p) =>
                            formPermissions.includes(p.key)
                          );
                        return (
                          <div key={group} className="border-b last:border-b-0">
                            <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100">
                              <input
                                type="checkbox"
                                checked={allSelected}
                                ref={(el) => {
                                  if (el) el.indeterminate = someSelected;
                                }}
                                onChange={() => toggleGroup(group)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {group}
                              </span>
                            </label>
                            <div className="px-6 py-1 space-y-1">
                              {perms.map((perm) => (
                                <label
                                  key={perm.key}
                                  className="flex items-center gap-2 py-1 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={formPermissions.includes(
                                      perm.key
                                    )}
                                    onChange={() =>
                                      togglePermission(perm.key)
                                    }
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-600">
                                    {perm.label}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
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
                  {saving ? "Guardando..." : editingRole ? "Actualizar" : "Crear"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

