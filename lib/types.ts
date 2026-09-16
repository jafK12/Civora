export type OfficeLevel = 'local' | 'district' | 'regional';

export type ServiceCategory =
  | 'All Services'
  | 'ID & Civil Registration'
  | 'Business & Licensing'
  | 'Land & Property';

export interface Office {
  id: string;
  name: string;
  country: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  officeLevel: OfficeLevel;
  serviceIds: string[];
}

export interface Service {
  id: string;
  name: string;
  category: Exclude<ServiceCategory, 'All Services'>;
  requiredDocuments: string[];
  fee: string;
  hours: string;
  officeIds: string[];
  source: string;
  lastVerified: string;
}

export type ReportIssueType =
  | 'wrong info'
  | 'bribe requested'
  | 'closed during posted hours'
  | 'extra undocumented requirement'
  | 'other';

export type UserRole = 'citizen' | 'pending_officer' | 'office_admin';

export type SupportedLanguage = 'en' | 'am' | 'om';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
  officeId?: string; // Assigned office ID (only present when role === 'office_admin')
  country?: string | null; // Country name for one-time jurisdiction filtering (e.g. 'Ethiopia')
  preferredLanguage?: SupportedLanguage;
  createdAt: string;
}

export type ReportStatus = 'unverified' | 'pattern_confirmed' | 'responded';

export interface OfficialReply {
  id?: string;
  reportId?: string;
  replierId: string;   // Authenticated office_admin user ID
  replierEmail?: string;
  officeName?: string;
  text: string;
  timestamp: string;   // ISO 8601 string
}

export interface Report {
  id: string;
  officeId: string;
  serviceId: string;
  officeName?: string;
  serviceName?: string;
  issueType: ReportIssueType;
  details?: string;
  timestamp: string;
  anonymous: boolean;

  /**
   * References authenticated user ID.
   * STRICT PRIVACY: NEVER exposed or displayed in public views.
   * Used strictly for duplicate prevention & rate limiting.
   */
  submitterId: string;

  /**
   * 'unverified': default on submission
   * 'pattern_confirmed': auto-flips when 3+ reports hit the same officeId + serviceId + issueType within 30 days
   * 'responded': set when an authorized office_admin posts an officialReply
   */
  status: ReportStatus;

  /**
   * Official institutional response.
   * Only an authenticated office_admin belonging to report.officeId can submit this.
   * Exactly one reply per report.
   */
  officialReply: OfficialReply | null;

  /**
   * Binary upvote tally from citizens.
   */
  helpfulCount: number;

  /**
   * User IDs who have already marked this report helpful.
   */
  helpfulUserIds?: string[];
}

export type PublicReport = Omit<Report, 'submitterId' | 'helpfulUserIds'>;

export interface SubmitReportDTO {
  officeId: string;
  serviceId: string;
  officeName?: string;
  serviceName?: string;
  issueType: ReportIssueType;
  details?: string;
  anonymous?: boolean;
  submitterId: string;
}

export interface SubmitReplyDTO {
  reportId: string;
  replierId: string;
  replierEmail?: string;
  officeName?: string;
  text: string;
}
