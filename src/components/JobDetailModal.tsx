import { useEffect, useRef, useState } from "react";
import {
  X,
  Building2,
  MapPin,
  Briefcase,
  Home,
  Users,
  GraduationCap,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";
import type { Job } from "../types";

interface JobDetailModalProps {
  visible: boolean;
  job: Job | null;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
}

export default function JobDetailModal({
  visible,
  job,
  onClose,
  onApprove,
  onReject,
}: JobDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  // Resetear estado del formulario de rechazo al cerrar/cambiar de job
  useEffect(() => {
    if (!visible) {
      setShowRejectForm(false);
      setRejectReason("");
      setRejectError("");
    }
  }, [visible]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showRejectForm) {
          setShowRejectForm(false);
          setRejectReason("");
          setRejectError("");
        } else {
          onClose();
        }
      }
    };
    if (visible) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [visible, onClose, showRejectForm]);

  if (!visible || !job) return null;

  const titulo = job.title || "Sin título";
  const descripcion = job.description || "Sin descripción";
  const requisitos = job.requirements || "";

  const getLocation = () => {
    if (job.city && job.state) return `${job.city}, ${job.state}`;
    if (job.location) return job.location;
    return "Ubicación no especificada";
  };

  const getModalidad = () => {
    if (job.workMode) {
      const modalidades: Record<string, string> = {
        presencial: "Presencial",
        remoto: "Remoto",
        hibrido: "Híbrido",
        PRESENCIAL: "Presencial",
        REMOTO: "Remoto",
        HIBRIDO: "Híbrido",
      };
      return modalidades[job.workMode] || job.workMode;
    }
    return null;
  };

  const getTipoEmpleo = () => {
    const value = job.jobType || "";
    const tipos: Record<string, string> = {
      TIEMPO_COMPLETO: "Tiempo Completo",
      MEDIO_TIEMPO: "Medio Tiempo",
      FREELANCE: "Freelance",
      REMOTO: "Remoto",
      HIBRIDO: "Híbrido",
      PASANTIA: "Pasantía",
      TEMPORAL: "Temporal",
      tiempo_completo: "Tiempo Completo",
      medio_tiempo: "Medio Tiempo",
    };
    return tipos[value] || value || "No especificado";
  };

  const getExperienceLevel = () => {
    if (!job.experienceLevel) return null;
    const niveles: Record<string, string> = {
      junior: "Junior",
      semi_senior: "Semi Senior",
      senior: "Senior",
      trainee: "Trainee",
      lead: "Lead",
      manager: "Manager",
      director: "Director",
      JUNIOR: "Junior",
      SEMI_SENIOR: "Semi Senior",
      SENIOR: "Senior",
      TRAINEE: "Trainee",
      LEAD: "Lead",
      MANAGER: "Manager",
      DIRECTOR: "Director",
      sin_experiencia: "Sin experiencia",
      SIN_EXPERIENCIA: "Sin experiencia",
    };
    return niveles[job.experienceLevel] || job.experienceLevel;
  };

  const getTimeAgo = () => {
    if (!job.publishedAt) return null;
    return formatDistanceToNow(new Date(job.publishedAt), {
      addSuffix: true,
      locale: es,
    });
  };

  const isPending =
    job.moderationStatus === "PENDING" ||
    job.moderationStatus === "PENDING_PAYMENT";

  const applicationsCount = job.applications?.length || 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl overflow-hidden"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <h2 className="text-xl font-bold text-gray-900 truncate pr-4">
            {titulo}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Badge de estado y fecha */}
        <div className="px-6 pb-4 flex items-center gap-3 flex-wrap">
          
          {getTimeAgo() && (
            <span className="text-sm text-gray-400">
              Publicado {getTimeAgo()}
            </span>
          )}
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Info principal */}
          <div className="mb-6 space-y-3">
            {job.empresa && (
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 flex-shrink-0 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {job.empresa.companyName || "Empresa"}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 flex-shrink-0 text-gray-400" />
              <span className="text-sm text-gray-700">{getLocation()}</span>
            </div>

            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 flex-shrink-0 text-gray-400" />
              <span className="text-sm text-gray-700">{getTipoEmpleo()}</span>
            </div>

            {getModalidad() && (
              <div className="flex items-center gap-3">
                <Home className="h-5 w-5 flex-shrink-0 text-gray-400" />
                <span className="text-sm text-gray-700">{getModalidad()}</span>
              </div>
            )}

            {getExperienceLevel() && (
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 flex-shrink-0 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {getExperienceLevel()}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 flex-shrink-0 text-gray-400" />
              <span className="text-sm text-gray-700">
                {applicationsCount}{" "}
                {applicationsCount === 1 ? "postulante" : "postulantes"}
              </span>
            </div>

           
          </div>

          {/* Descripción */}
          <div className="mb-5">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">
              Descripción
            </h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
              {descripcion}
            </p>
          </div>

          {/* Requisitos */}
          {requisitos && (
            <div className="mb-5">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">
                Requerimientos
              </h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
                {requisitos}
              </p>
            </div>
          )}

          {/* Razón de rechazo */}
          {(job.moderationStatus === "REJECTED" ||
            job.moderationStatus === "AUTO_REJECTED") &&
            (job.moderationReason || job.autoRejectionReason) && (
              <div className="mb-5 rounded-lg bg-red-50 border border-red-200 p-4">
                <h3 className="text-sm font-semibold text-red-800">
                  Razón de rechazo:
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {job.moderationReason || job.autoRejectionReason}
                </p>
              </div>
            )}

          {/* Info de moderación */}
          {job.moderatedAt && (
            <div className="mb-5 rounded-lg bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs text-gray-500">
                Moderado el{" "}
                {format(new Date(job.moderatedAt), "dd/MM/yyyy HH:mm", {
                  locale: es,
                })}
              </p>
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        {onReject && (
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            {showRejectForm ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Razón del rechazo
                </h3>
                <textarea
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    if (rejectError) setRejectError("");
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none ${
                    rejectError ? "border-red-400" : "border-gray-300"
                  }`}
                  rows={3}
                  placeholder="Ingresá la razón por la que se rechaza este trabajo..."
                  autoFocus
                />
                {rejectError && (
                  <p className="text-xs text-red-600">{rejectError}</p>
                )}
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectReason("");
                      setRejectError("");
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (!rejectReason.trim()) {
                        setRejectError("Por favor ingresá una razón para el rechazo");
                        return;
                      }
                      onReject(job.id, rejectReason.trim());
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    Confirmar rechazo
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                {isPending && onApprove && (
                  <button
                    onClick={() => onApprove(job.id)}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Aprobar
                  </button>
                )}
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  Rechazar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

