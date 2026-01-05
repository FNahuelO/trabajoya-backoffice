import { useEffect, useState } from "react";
import { adminApi } from "../services/api";
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Settings,
  FileCheck,
  MessageSquare,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Stats {
  totalUsers: number;
  totalEmpresas: number;
  totalPostulantes: number;
  totalJobs: number;
  pendingJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalMessages: number;
  totalCalls: number;
  activeSubscriptions: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminApi.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500">
        Error cargando estadísticas
      </div>
    );
  }

  const statCards = [
    {
      title: "Usuarios Totales",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-blue-500",
      link: "/users",
    },
    {
      title: "Empresas",
      value: stats.totalEmpresas,
      icon: Building2,
      color: "bg-green-500",
      link: "/empresas",
    },
    {
      title: "Postulantes",
      value: stats.totalPostulantes,
      icon: Users,
      color: "bg-purple-500",
      link: "/postulantes",
    },
    {
      title: "Trabajos Totales",
      value: stats.totalJobs,
      icon: Briefcase,
      color: "bg-orange-500",
      link: "/jobs",
    },
    {
      title: "Trabajos Pendientes",
      value: stats.pendingJobs,
      icon: AlertCircle,
      color: "bg-yellow-500",
      link: "/jobs/pending",
    },
    {
      title: "Trabajos Activos",
      value: stats.activeJobs,
      icon: CheckCircle,
      color: "bg-green-500",
      link: "/jobs?status=active",
    },
    {
      title: "Aplicaciones",
      value: stats.totalApplications,
      icon: FileText,
      color: "bg-indigo-500",
      link: "/applications",
    },
    {
      title: "Mensajes",
      value: stats.totalMessages,
      icon: MessageSquare,
      color: "bg-cyan-500",
      link: "/messages",
    },
    {
      title: "Llamadas",
      value: stats.totalCalls,
      icon: Phone,
      color: "bg-teal-500",
      link: "/calls",
    },
    {
      title: "Suscripciones Activas",
      value: stats.activeSubscriptions,
      icon: CreditCard,
      color: "bg-red-500",
      link: "/subscriptions",
    },
    {
      title: "Opciones",
      value: "Ver",
      icon: Settings,
      color: "bg-gray-500",
      link: "/options",
    },
    {
      title: "Términos y Condiciones",
      value: "Gestionar",
      icon: FileCheck,
      color: "bg-blue-500",
      link: "/terms",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          const content = (
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {typeof card.value === "number"
                      ? card.value.toLocaleString()
                      : card.value}
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          );

          if (card.link) {
            return (
              <Link key={card.title} to={card.link}>
                {content}
              </Link>
            );
          }

          return <div key={card.title}>{content}</div>;
        })}
      </div>
    </div>
  );
}
