export type UserType = "POSTULANTE" | "EMPRESA";

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
