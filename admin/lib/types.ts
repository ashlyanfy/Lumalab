export type Role = "ADMIN" | "MANAGER";

export type LeadKind = "COMPANY" | "TALENT";

export type LeadStatus =
  | "NEW"
  | "IN_PROGRESS"
  | "CONTACTED"
  | "NDA_SIGNED"
  | "PILOT"
  | "PARTNERSHIP"
  | "REJECTED"
  | "ARCHIVED";

export type LeadSource = "WEBSITE" | "TELEGRAM" | "REFERRAL" | "OTHER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface AdminUser extends User {
  createdAt: string;
  updatedAt: string;
}

export interface LeadAssignee {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface LeadNote {
  id: string;
  body: string;
  author?: LeadAssignee | null;
  createdAt: string;
}

export interface Lead {
  id: string;
  kind: LeadKind;
  status: LeadStatus;
  source: LeadSource;

  contactName: string;
  email: string;
  whatsapp: string | null;
  comment: string | null;
  locale: string | null;

  companyName: string | null;
  companySite: string | null;
  industry: string | null;
  stage: string | null;
  revenueRange: string | null;
  equityReady: string | null;

  desiredRole: string | null;
  workFormat: string | null;
  country: string | null;

  data: Record<string, unknown>;

  assigneeId: string | null;
  assignee: LeadAssignee | null;
  notes?: LeadNote[];

  createdAt: string;
  updatedAt: string;
}

export interface LeadListResponse {
  items: Lead[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

export interface LeadFilters {
  kind?: LeadKind | "";
  status?: LeadStatus | "";
  desiredRole?: string;
  industry?: string;
  q?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface LeadStats {
  total: number;
  byStatus: Record<LeadStatus, number>;
  last7: number;
}

export interface CmsBlock {
  id: number;
  type: string;
  order: number;
  enabled: boolean;
  data: Record<string, unknown>;
}

export interface CmsSeo {
  id: number;
  pageId: number;
  title: string;
  description: string;
  keywords: string | null;
  ogImage: string | null;
}

export interface CmsPage {
  id: number;
  slug: string;
  title: string;
  updatedAt: string;
  blocks?: CmsBlock[];
  seo?: CmsSeo | null;
}
