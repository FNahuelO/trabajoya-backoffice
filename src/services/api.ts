import axios from "axios";
import type { ApiResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // No redirigir si el error 401 es de la ruta de login
      const isLoginRequest = error.config?.url?.includes("/api/auth/login");
      if (!isLoginRequest) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post<
      ApiResponse<{ accessToken: string; refreshToken: string }>
    >("/api/auth/login", {
      email,
      password,
    });
    return response.data;
  },
  me: async () => {
    const response = await api.get<ApiResponse<{ userId: string }>>(
      "/api/auth/me"
    );
    return response.data;
  },
};

// Jobs
export const jobsApi = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
  }) => {
    const response = await api.get<ApiResponse<any>>("/api/jobs", { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<any>>(`/api/jobs/${id}`);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/api/jobs/${id}`);
    return response.data;
  },
};

// Moderation
export const moderationApi = {
  getPendingJobs: async (page = 1, pageSize = 10) => {
    const response = await api.get<ApiResponse<any>>(
      "/api/moderation/jobs/pending",
      {
        params: { page, pageSize },
      }
    );
    return response.data;
  },
  getRejectedJobs: async (page = 1, pageSize = 10) => {
    const response = await api.get<ApiResponse<any>>(
      "/api/moderation/jobs/rejected",
      {
        params: { page, pageSize },
      }
    );
    return response.data;
  },
  approveJob: async (id: string) => {
    const response = await api.post<ApiResponse<any>>(
      `/api/moderation/jobs/${id}/approve`
    );
    return response.data;
  },
  rejectJob: async (id: string, reason: string) => {
    const response = await api.post<ApiResponse<any>>(
      `/api/moderation/jobs/${id}/reject`,
      { reason }
    );
    return response.data;
  },
  getJobDetails: async (id: string) => {
    const response = await api.get<ApiResponse<any>>(
      `/api/moderation/jobs/${id}`
    );
    return response.data;
  },
};

// Admin API
export const adminApi = {
  getUsers: async (params?: {
    page?: number;
    pageSize?: number;
    userType?: string;
  }) => {
    const response = await api.get<ApiResponse<any>>("/api/admin/users", {
      params,
    });
    return response.data;
  },
  getEmpresas: async (params?: { page?: number; pageSize?: number }) => {
    const response = await api.get<ApiResponse<any>>("/api/admin/empresas", {
      params,
    });
    return response.data;
  },
  getPostulantes: async (params?: { page?: number; pageSize?: number }) => {
    const response = await api.get<ApiResponse<any>>("/api/admin/postulantes", {
      params,
    });
    return response.data;
  },
  getAllJobs: async (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    moderationStatus?: string;
  }) => {
    const response = await api.get<ApiResponse<any>>("/api/admin/jobs/all", {
      params,
    });
    return response.data;
  },
  getApplications: async (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }) => {
    const response = await api.get<ApiResponse<any>>(
      "/api/admin/applications",
      { params }
    );
    return response.data;
  },
  getMessages: async (params?: { page?: number; pageSize?: number }) => {
    const response = await api.get<ApiResponse<any>>("/api/admin/messages", {
      params,
    });
    return response.data;
  },
  getCalls: async (params?: { page?: number; pageSize?: number }) => {
    const response = await api.get<ApiResponse<any>>("/api/admin/calls", {
      params,
    });
    return response.data;
  },
  getSubscriptions: async (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }) => {
    const response = await api.get<ApiResponse<any>>(
      "/api/admin/subscriptions",
      { params }
    );
    return response.data;
  },
  getStats: async () => {
    const response = await api.get<ApiResponse<any>>("/api/admin/stats");
    return response.data;
  },
};

// Options API
export const optionsApi = {
  getAll: async (lang?: string) => {
    const response = await api.get<ApiResponse<any>>("/api/options", {
      params: { lang: lang || "es" },
    });
    return response.data;
  },
  getByCategory: async (category: string, lang?: string) => {
    const response = await api.get<ApiResponse<any>>(
      `/api/options/${category}`,
      {
        params: { lang: lang || "es" },
      }
    );
    return response.data;
  },
  // Admin endpoints
  list: async (params?: {
    category?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const response = await api.get<ApiResponse<any>>("/api/admin/options", {
      params,
    });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<any>>(
      `/api/admin/options/${id}`
    );
    return response.data;
  },
  create: async (data: {
    type: string;
    code: string;
    translations: { es: string; en: string; pt: string };
    isActive?: boolean;
    order?: number;
  }) => {
    const response = await api.post<ApiResponse<any>>(
      "/api/admin/options",
      data
    );
    return response.data;
  },
  update: async (
    id: string,
    data: {
      translations?: { es?: string; en?: string; pt?: string };
      isActive?: boolean;
      order?: number;
    }
  ) => {
    const response = await api.patch<ApiResponse<any>>(
      `/api/admin/options/${id}`,
      data
    );
    return response.data;
  },
  toggleActive: async (id: string) => {
    const response = await api.patch<ApiResponse<any>>(
      `/api/admin/options/${id}/activate`
    );
    return response.data;
  },
  reorder: async (items: { id: string; order: number }[]) => {
    const response = await api.patch<ApiResponse<any>>(
      "/api/admin/options/reorder",
      { items }
    );
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<any>>(
      `/api/admin/options/${id}`
    );
    return response.data;
  },
};

// Terms API
export const termsApi = {
  getAll: async (type?: string) => {
    const response = await api.get<ApiResponse<any>>("/api/terms/all", {
      params: type ? { type } : undefined,
    });
    return response.data;
  },
  upload: async (
    file: File,
    type: string,
    version: string,
    description?: string
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("version", version);
    if (description) {
      formData.append("description", description);
    }
    const response = await api.post<ApiResponse<any>>(
      "/api/terms/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
  getActive: async (type?: string) => {
    const response = await api.get<ApiResponse<any>>("/api/terms/active", {
      params: type ? { type } : undefined,
    });
    return response.data;
  },
};

// Catalogs API
export const catalogsApi = {
  getPublic: async (lang?: "es" | "en" | "pt") => {
    const response = await api.get<ApiResponse<any>>("/api/catalogs", {
      params: { lang: lang || "es" },
    });
    return response.data;
  },
  list: async (params?: {
    type?:
      | "JOB_AREA"
      | "JOB_TYPE"
      | "JOB_LEVEL"
      | "JOB_TYPES"
      | "EXPERIENCE_LEVELS"
      | "APPLICATION_STATUSES"
      | "MODALITIES"
      | "LANGUAGE_LEVELS"
      | "COMPANY_SIZES"
      | "SECTORS"
      | "STUDY_TYPES"
      | "STUDY_STATUSES"
      | "MARITAL_STATUSES";
    search?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const response = await api.get<ApiResponse<any>>("/api/admin/catalogs", {
      params,
    });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<any>>(
      `/api/admin/catalogs/${id}`
    );
    return response.data;
  },
  create: async (data: {
    type:
      | "JOB_AREA"
      | "JOB_TYPE"
      | "JOB_LEVEL"
      | "JOB_TYPES"
      | "EXPERIENCE_LEVELS"
      | "APPLICATION_STATUSES"
      | "MODALITIES"
      | "LANGUAGE_LEVELS"
      | "COMPANY_SIZES"
      | "SECTORS"
      | "STUDY_TYPES"
      | "STUDY_STATUSES"
      | "MARITAL_STATUSES";
    code: string;
    translations: { es: string; en: string; pt: string };
    isActive?: boolean;
    order?: number;
  }) => {
    const response = await api.post<ApiResponse<any>>(
      "/api/admin/catalogs",
      data
    );
    return response.data;
  },
  update: async (
    id: string,
    data: {
      translations?: { es?: string; en?: string; pt?: string };
      isActive?: boolean;
      order?: number;
    }
  ) => {
    const response = await api.patch<ApiResponse<any>>(
      `/api/admin/catalogs/${id}`,
      data
    );
    return response.data;
  },
  toggleActive: async (id: string) => {
    const response = await api.patch<ApiResponse<any>>(
      `/api/admin/catalogs/${id}/activate`
    );
    return response.data;
  },
  reorder: async (items: { id: string; order: number }[]) => {
    const response = await api.patch<ApiResponse<any>>(
      "/api/admin/catalogs/reorder",
      { items }
    );
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<any>>(
      `/api/admin/catalogs/${id}`
    );
    return response.data;
  },
};

// Plans API
export const plansApi = {
  list: async (params?: {
    search?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const response = await api.get<ApiResponse<any>>("/api/admin/plans", {
      params,
    });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<any>>(
      `/api/admin/plans/${id}`
    );
    return response.data;
  },
  create: async (data: {
    name: string;
    code: string;
    price: number;
    currency?: string;
    durationDays: number;
    unlimitedCvs?: boolean;
    allowedModifications?: number;
    canModifyCategory?: boolean;
    categoryModifications?: number;
    hasFeaturedOption?: boolean;
    hasAIFeature?: boolean;
    launchBenefitAvailable?: boolean;
    launchBenefitDuration?: number | null;
    isActive?: boolean;
    order?: number;
    description?: string;
  }) => {
    const response = await api.post<ApiResponse<any>>(
      "/api/admin/plans",
      data
    );
    return response.data;
  },
  update: async (
    id: string,
    data: {
      name?: string;
      price?: number;
      currency?: string;
      durationDays?: number;
      unlimitedCvs?: boolean;
      allowedModifications?: number;
      canModifyCategory?: boolean;
      categoryModifications?: number;
      hasFeaturedOption?: boolean;
      hasAIFeature?: boolean;
      launchBenefitAvailable?: boolean;
      launchBenefitDuration?: number | null;
      isActive?: boolean;
      order?: number;
      description?: string;
    }
  ) => {
    const response = await api.patch<ApiResponse<any>>(
      `/api/admin/plans/${id}`,
      data
    );
    return response.data;
  },
  toggleActive: async (id: string) => {
    const response = await api.patch<ApiResponse<any>>(
      `/api/admin/plans/${id}/activate`
    );
    return response.data;
  },
  reorder: async (items: { id: string; order: number }[]) => {
    const response = await api.patch<ApiResponse<any>>(
      "/api/admin/plans/reorder",
      { items }
    );
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<any>>(
      `/api/admin/plans/${id}`
    );
    return response.data;
  },
};

// Helper para obtener todos los usuarios usando Prisma directamente
// Por ahora, vamos a crear servicios básicos que funcionen con lo disponible
export default api;
