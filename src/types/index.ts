export type UserType = "POSTULANTE" | "EMPRESA" | "ADMIN";

export interface User {
  id: string;
  email: string;
  userType: UserType;
  isVerified: boolean;
  language: string;
  createdAt: string;
  updatedAt: string;
  empresa?: EmpresaProfile;
  postulante?: PostulanteProfile;
}

export interface EmpresaProfile {
  id: string;
  userId: string;
  companyName: string;
  razonSocial?: string;
  cuit: string;
  documento?: string;
  email: string;
  phone?: string;
  sitioWeb?: string;
  descripcion?: string;
  sector?: string;
  industria?: string;
  tamano?: string;
  cantidadEmpleados?: string;
  condicionFiscal?: string;
  contribuyenteIngresosBrutos?: boolean;
  calle?: string;
  numero?: string;
  piso?: string;
  depto?: string;
  codigoPostal?: string;
  localidad?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  nombreContacto?: string;
  apellidoContacto?: string;
  encabezadosAvisos?: string[];
  beneficiosEmpresa?: string[];
  logo?: string;
  user?: {
    id: string;
    email: string;
    isVerified: boolean;
    createdAt: string;
  };
  subscriptions?: Subscription[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PostulanteProfile {
  id: string;
  userId: string;
  fullName: string;
  city?: string;
  country?: string;
  skills: string[];
  normalizedSkills?: string[];
  profilePicture?: string;
  cvUrl?: string;
  videoUrl?: string;
  birthDate?: string;
  gender?: string;
  nationality?: string;
  maritalStatus?: string;
  documentType?: string;
  documentNumber?: string;
  hasOwnVehicle?: boolean;
  hasDriverLicense?: boolean;
  phone?: string;
  alternatePhone?: string;
  province?: string;
  postalCode?: string;
  searchingFirstJob?: boolean;
  resumeTitle?: string;
  professionalDescription?: string;
  employmentStatus?: string;
  minimumSalary?: number;
  coverLetter?: string;
  additionalInformation?: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  websiteUrl?: string;
  githubUrl?: string;
  languages?: Array<{ language: string; level: string }>;
  user?: {
    id: string;
    email: string;
    isVerified: boolean;
    createdAt: string;
  };
  experiences?: Experience[];
  education?: Education[];
  certifications?: Certification[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Experience {
  id: string;
  postulanteId: string;
  position: string;
  company: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  experienceLevel?: "JUNIOR" | "SEMISENIOR" | "SENIOR";
  companyCountry?: string;
  jobArea?: string;
  companyActivity?: string;
  description?: string;
  peopleInCharge?: string;
}

export interface Education {
  id: string;
  postulanteId: string;
  degree: string;
  institution: string;
  country?: string;
  studyArea?: string;
  studyType?: string;
  status?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  gpa?: number;
  honors?: string;
}

export interface Certification {
  id: string;
  postulanteId: string;
  name: string;
  issuer: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  empresaId: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  city?: string;
  state?: string;
  jobType: string;
  workMode?: string;
  category: string;
  experienceLevel: string;
  status: string;
  publishedAt: string;
  moderationStatus:
    | "PENDING_PAYMENT"
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "AUTO_REJECTED";
  moderationReason?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  autoRejectionReason?: string;
  // Payment fields
  isPaid?: boolean;
  paymentOrderId?: string;
  paymentAmount?: number;
  paymentCurrency?: string;
  paymentStatus?: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  paidAt?: string;
  empresa?: EmpresaProfile;
  applications?: { id: string }[];
}

export interface Application {
  id: string;
  postulanteId: string;
  jobId: string;
  status: "PENDING" | "REVIEWED" | "ACCEPTED" | "REJECTED" | "INTERVIEW";
  appliedAt: string;
  coverLetter?: string;
  isRead: boolean;
  job?: Job;
  postulante?: PostulanteProfile;
}

export interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  fromUser?: User;
  toUser?: User;
}

export interface Call {
  id: string;
  fromUserId: string;
  toUserId: string;
  status:
    | "PENDING"
    | "ACCEPTED"
    | "REJECTED"
    | "MISSED"
    | "ENDED"
    | "CANCELLED";
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  createdAt: string;
}

export interface Subscription {
  id: string;
  empresaId: string;
  planType: "BASIC" | "PREMIUM" | "ENTERPRISE";
  status: "ACTIVE" | "CANCELED" | "EXPIRED" | "PENDING";
  paypalOrderId?: string;
  paypalSubscriptionId?: string;
  startDate: string;
  endDate?: string;
  canceledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
  empresa?: EmpresaProfile;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type PromotionStatus = "AVAILABLE" | "CLAIMED" | "USED" | "EXPIRED";

export interface UserPromotion {
  id: string;
  userId: string;
  promoKey: string;
  status: PromotionStatus;
  claimedAt?: string;
  usedAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    userType: UserType;
  };
}

export type PaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";
export type PaymentMethod = "PAYPAL" | "MERCADOPAGO" | "STRIPE" | "APPLE_IAP" | "GOOGLE_PLAY";

export interface PaymentTransaction {
  id: string;
  userId: string;
  empresaId?: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  description?: string;
  planType?: string;
  planId?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    userType: UserType;
  };
  empresa?: {
    id: string;
    companyName: string;
  };
  plan?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface PaymentStats {
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalRevenue: number;
  byMethod: {
    paypal: number;
    appleIap: number;
    googlePlay: number;
  };
  todayPayments: number;
}

export type VideoMeetingStatus =
  | "SCHEDULED"
  | "ACCEPTED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "MISSED";

export interface VideoMeeting {
  id: string;
  createdById: string;
  invitedUserId: string;
  title?: string;
  description?: string;
  scheduledAt: string;
  duration?: number;
  status: VideoMeetingStatus;
  meetingUrl?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  endedAt?: string;
  createdBy?: {
    id: string;
    email: string;
    userType: UserType;
  };
  invitedUser?: {
    id: string;
    email: string;
    userType: UserType;
  };
}

export type EntitlementSource =
  | "APPLE_IAP"
  | "GOOGLE_PLAY"
  | "PROMO"
  | "MANUAL";
export type EntitlementStatus = "ACTIVE" | "EXPIRED" | "REVOKED" | "REFUNDED";

export interface JobPostEntitlement {
  id: string;
  userId: string;
  jobPostId: string;
  source: EntitlementSource;
  planKey: string;
  expiresAt: string;
  status: EntitlementStatus;
  maxEdits: number;
  editsUsed: number;
  allowCategoryChange: boolean;
  maxCategoryChanges: number;
  categoryChangesUsed: number;
  transactionId?: string;
  originalTransactionId?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    userType: UserType;
  };
  job?: {
    id: string;
    title: string;
    status: string;
  };
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { users: number };
}

export interface InternalUser {
  id: string;
  email: string;
  userType: UserType;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  role?: {
    id: string;
    name: string;
    displayName: string;
  } | null;
}

// Lista de permisos disponibles del sistema
export const AVAILABLE_PERMISSIONS = [
  { key: "users:read", label: "Usuarios: Ver", group: "Usuarios" },
  { key: "users:write", label: "Usuarios: Editar", group: "Usuarios" },
  { key: "users:delete", label: "Usuarios: Eliminar", group: "Usuarios" },
  { key: "jobs:read", label: "Trabajos: Ver", group: "Trabajos" },
  { key: "jobs:write", label: "Trabajos: Editar", group: "Trabajos" },
  { key: "jobs:delete", label: "Trabajos: Eliminar", group: "Trabajos" },
  { key: "empresas:read", label: "Empresas: Ver", group: "Empresas" },
  { key: "empresas:write", label: "Empresas: Editar", group: "Empresas" },
  { key: "postulantes:read", label: "Postulantes: Ver", group: "Postulantes" },
  { key: "postulantes:write", label: "Postulantes: Editar", group: "Postulantes" },
  { key: "applications:read", label: "Aplicaciones: Ver", group: "Aplicaciones" },
  { key: "applications:write", label: "Aplicaciones: Editar", group: "Aplicaciones" },
  { key: "payments:read", label: "Pagos: Ver", group: "Pagos" },
  { key: "payments:write", label: "Pagos: Editar", group: "Pagos" },
  { key: "plans:read", label: "Planes: Ver", group: "Planes" },
  { key: "plans:write", label: "Planes: Editar", group: "Planes" },
  { key: "catalogs:read", label: "Catálogos: Ver", group: "Catálogos" },
  { key: "catalogs:write", label: "Catálogos: Editar", group: "Catálogos" },
  { key: "terms:read", label: "Términos: Ver", group: "Términos" },
  { key: "terms:write", label: "Términos: Editar", group: "Términos" },
  { key: "reports:read", label: "Denuncias: Ver", group: "Denuncias" },
  { key: "reports:write", label: "Denuncias: Gestionar", group: "Denuncias" },
  { key: "promotions:read", label: "Promociones: Ver", group: "Promociones" },
  { key: "promotions:write", label: "Promociones: Editar", group: "Promociones" },
  { key: "subscriptions:read", label: "Suscripciones: Ver", group: "Suscripciones" },
  { key: "subscriptions:write", label: "Suscripciones: Editar", group: "Suscripciones" },
  { key: "messages:read", label: "Mensajes: Ver", group: "Mensajes" },
  { key: "calls:read", label: "Llamadas: Ver", group: "Llamadas" },
  { key: "video-meetings:read", label: "Videollamadas: Ver", group: "Videollamadas" },
  { key: "entitlements:read", label: "Entitlements: Ver", group: "Entitlements" },
  { key: "entitlements:write", label: "Entitlements: Editar", group: "Entitlements" },
  { key: "iap-products:read", label: "IAP Products: Ver", group: "IAP" },
  { key: "iap-products:write", label: "IAP Products: Editar", group: "IAP" },
  { key: "moderation:read", label: "Moderación: Ver", group: "Moderación" },
  { key: "moderation:write", label: "Moderación: Gestionar", group: "Moderación" },
  { key: "roles:read", label: "Roles: Ver", group: "Sistema" },
  { key: "roles:write", label: "Roles: Editar", group: "Sistema" },
  { key: "internal-users:read", label: "Usuarios internos: Ver", group: "Sistema" },
  { key: "internal-users:write", label: "Usuarios internos: Editar", group: "Sistema" },
  { key: "internal-users:delete", label: "Usuarios internos: Eliminar", group: "Sistema" },
] as const;

export type IapPlatform = "IOS" | "ANDROID";

export interface IapProduct {
  id: string;
  productId: string;
  platform: IapPlatform;
  planKey: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
