import { useEffect, useMemo, useState } from "react";
import { settingsApi } from "../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/hooks/useAlert";
import { Settings, MessageCircle, Mail, Save, Loader2 } from "lucide-react";

// Solo dígitos (lo que acepta wa.me).
const sanitizeWhatsApp = (value: string) => value.replace(/\D/g, "");

export default function SettingsPage() {
  const { showAlert, AlertComponent } = useAlert();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [email, setEmail] = useState("");
  const [initial, setInitial] = useState({ whatsappNumber: "", email: "" });

  const loadConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await settingsApi.getSupport();
      const data = res.data;
      setWhatsappNumber(data.whatsappNumber ?? "");
      setEmail(data.email ?? "");
      setInitial({
        whatsappNumber: data.whatsappNumber ?? "",
        email: data.email ?? "",
      });
    } catch (_err) {
      setError(
        "No se pudo cargar la configuración de soporte. Intentá nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const normalizedWhatsapp = useMemo(
    () => sanitizeWhatsApp(whatsappNumber),
    [whatsappNumber]
  );

  const hasChanges =
    normalizedWhatsapp !== sanitizeWhatsApp(initial.whatsappNumber) ||
    email.trim() !== initial.email.trim();

  const isEmailValid = email.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const waPreview = normalizedWhatsapp
    ? `https://wa.me/${normalizedWhatsapp}`
    : null;

  const handleSave = async () => {
    if (!isEmailValid) {
      showAlert({
        title: "Email inválido",
        message: "Ingresá un email de soporte válido.",
      });
      return;
    }
    if (!email.trim()) {
      showAlert({
        title: "Email requerido",
        message:
          "El email de soporte es el canal de respaldo y no puede quedar vacío.",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await settingsApi.updateSupport({
        whatsappNumber: normalizedWhatsapp,
        email: email.trim(),
      });
      const data = res.data;
      setWhatsappNumber(data.whatsappNumber ?? "");
      setEmail(data.email ?? "");
      setInitial({
        whatsappNumber: data.whatsappNumber ?? "",
        email: data.email ?? "",
      });
      showAlert({
        title: "Guardado",
        message:
          "La configuración de soporte se actualizó. Los cambios aplican en la app sin necesidad de recompilar.",
      });
    } catch (_err) {
      showAlert({
        title: "Error",
        message:
          "No se pudo guardar la configuración. Verificá los datos e intentá nuevamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-sm text-gray-500">
            Datos de contacto de soporte que usa la app.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border bg-white p-6 text-gray-500 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando configuración…
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="mb-3 text-sm font-medium text-red-700">{error}</p>
          <Button variant="outline" onClick={loadConfig}>
            Reintentar
          </Button>
        </div>
      ) : (
        <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-green-600" />
              WhatsApp de soporte
            </Label>
            <Input
              id="whatsapp"
              inputMode="numeric"
              placeholder="5491133902772"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Solo dígitos, con código de país (Argentina: 54 + 9 + área +
              número). Se guarda como{" "}
              <span className="font-mono">{normalizedWhatsapp || "—"}</span>.
              Dejalo vacío para usar solo email.
            </p>
            {waPreview && (
              <a
                href={waPreview}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs font-medium text-blue-600 hover:underline"
              >
                Probar enlace: {waPreview}
              </a>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              Email de soporte
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="soporte@trabajo-ya.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {!isEmailValid && (
              <p className="text-xs font-medium text-red-600">
                El email no tiene un formato válido.
              </p>
            )}
            <p className="text-xs text-gray-500">
              Canal de respaldo si el usuario no tiene WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-3 border-t pt-4">
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges || !isEmailValid}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar cambios
            </Button>
            {hasChanges && !saving && (
              <span className="text-xs text-amber-600">
                Tenés cambios sin guardar.
              </span>
            )}
          </div>
        </div>
      )}

      <AlertComponent />
    </div>
  );
}
