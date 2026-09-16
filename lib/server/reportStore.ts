import {
  Report,
  PublicReport,
  SubmitReportDTO,
  SubmitReplyDTO,
  ReportStatus,
  UserProfile,
} from '../types';
import { SEED_REPORTS } from '../data/seedReports';
import { DEMO_USERS } from '../data/demoUsers';

// Global singleton in Node.js runtime to persist across hot reloads / requests in dev
const globalForStore = global as unknown as {
  civoraReports?: Report[];
  civoraUsers?: UserProfile[];
};

if (!globalForStore.civoraReports) {
  globalForStore.civoraReports = JSON.parse(JSON.stringify(SEED_REPORTS));
}

if (!globalForStore.civoraUsers) {
  globalForStore.civoraUsers = JSON.parse(JSON.stringify(DEMO_USERS));
}

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const PATTERN_WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const PATTERN_THRESHOLD = 3; // 3+ reports required

export const toPublicReport = (report: Report): PublicReport => {
  const { submitterId: _s, helpfulUserIds: _h, ...publicFields } = report;
  void _s;
  void _h;
  return publicFields;
};

export const resetToSeed = (): void => {
  globalForStore.civoraReports = JSON.parse(JSON.stringify(SEED_REPORTS));
  globalForStore.civoraUsers = JSON.parse(JSON.stringify(DEMO_USERS));
};

export const getReports = async (filter?: {
  officeId?: string;
  serviceId?: string;
  status?: ReportStatus;
}): Promise<PublicReport[]> => {
  let result = [...(globalForStore.civoraReports || [])];

  if (filter?.officeId) {
    result = result.filter((r) => r.officeId === filter.officeId);
  }
  if (filter?.serviceId) {
    result = result.filter((r) => r.serviceId === filter.serviceId);
  }
  if (filter?.status) {
    result = result.filter((r) => r.status === filter.status);
  }

  // Sort newest first
  result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return result.map(toPublicReport);
};

export const submitReport = async (
  dto: SubmitReportDTO
): Promise<{ success: boolean; report?: PublicReport; error?: string }> => {
  if (!dto.submitterId) {
    return { success: false, error: 'Submission requires authenticated user context.' };
  }
  if (!dto.officeId || !dto.serviceId || !dto.issueType) {
    return { success: false, error: 'Missing required report fields (office, service, or issue).' };
  }

  const reports = globalForStore.civoraReports || [];
  const now = Date.now();

  // 1. Rate-Limiting / Duplicate Check:
  const recentDuplicate = reports.find((r) => {
    if (
      r.submitterId === dto.submitterId &&
      r.officeId === dto.officeId &&
      r.serviceId === dto.serviceId &&
      r.issueType === dto.issueType
    ) {
      const age = now - new Date(r.timestamp).getTime();
      return age < RATE_LIMIT_WINDOW_MS;
    }
    return false;
  });

  if (recentDuplicate) {
    return {
      success: false,
      error:
        'Rate limit notice: A similar report was submitted from your account within the past 10 minutes. Please allow 10 minutes between duplicate submissions.',
    };
  }

  // 2. Construct new report
  const newReport: Report = {
    id: `REP-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    officeId: dto.officeId,
    serviceId: dto.serviceId,
    officeName: dto.officeName,
    serviceName: dto.serviceName,
    issueType: dto.issueType,
    details: dto.details?.trim() || undefined,
    timestamp: new Date(now).toISOString(),
    anonymous: !!dto.anonymous,
    submitterId: dto.submitterId,
    status: 'unverified',
    officialReply: null,
    helpfulCount: 0,
    helpfulUserIds: [],
  };

  reports.unshift(newReport);

  // 3. Automated Pattern Confirmation Check:
  // Check if 3+ reports hit the same officeId + serviceId + issueType within 30 days
  const matchingCluster = reports.filter((r) => {
    const isMatch =
      r.officeId === dto.officeId &&
      r.serviceId === dto.serviceId &&
      r.issueType === dto.issueType;
    const isWithin30Days = now - new Date(r.timestamp).getTime() <= PATTERN_WINDOW_MS;
    return isMatch && isWithin30Days;
  });

  if (matchingCluster.length >= PATTERN_THRESHOLD) {
    for (const item of matchingCluster) {
      if (item.status === 'unverified') {
        item.status = 'pattern_confirmed';
      }
    }
  }

  return {
    success: true,
    report: toPublicReport(newReport),
  };
};

export const submitOfficialReply = async (
  dto: SubmitReplyDTO
): Promise<{ success: boolean; report?: PublicReport; error?: string }> => {
  const reports = globalForStore.civoraReports || [];
  const report = reports.find((r) => r.id === dto.reportId);
  if (!report) {
    return { success: false, error: 'Report not found.' };
  }

  if (report.officialReply !== null) {
    return { success: false, error: 'This report already has an official response.' };
  }

  // Validate admin permissions
  const users = globalForStore.civoraUsers || DEMO_USERS;
  const adminUser = users.find((u) => u.id === dto.replierId);
  if (!adminUser) {
    return { success: false, error: 'User profile not found.' };
  }

  if (adminUser.role !== 'office_admin') {
    return { success: false, error: 'Permission denied: User does not have office_admin role.' };
  }

  if (adminUser.officeId !== report.officeId) {
    return {
      success: false,
      error: `Permission denied: User is admin for office "${adminUser.officeId}", not "${report.officeId}".`,
    };
  }

  const reply = {
    id: `reply-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    reportId: report.id,
    replierId: dto.replierId,
    replierEmail: dto.replierEmail || adminUser.email,
    officeName: dto.officeName || report.officeName || 'Official Administration',
    text: dto.text.trim(),
    timestamp: new Date().toISOString(),
  };

  report.officialReply = reply;
  report.status = 'responded';

  return {
    success: true,
    report: toPublicReport(report),
  };
};

export const voteHelpful = async (
  reportId: string,
  userId: string
): Promise<{ success: boolean; helpfulCount: number; hasVoted: boolean; error?: string }> => {
  const reports = globalForStore.civoraReports || [];
  const report = reports.find((r) => r.id === reportId);
  if (!report) {
    return { success: false, helpfulCount: 0, hasVoted: false, error: 'Report not found.' };
  }

  if (!report.helpfulUserIds) {
    report.helpfulUserIds = [];
  }

  const alreadyVoted = report.helpfulUserIds.includes(userId);

  if (alreadyVoted) {
    return {
      success: true,
      helpfulCount: report.helpfulCount,
      hasVoted: true,
    };
  }

  report.helpfulUserIds.push(userId);
  report.helpfulCount += 1;

  return {
    success: true,
    helpfulCount: report.helpfulCount,
    hasVoted: true,
  };
};

export const getDemoUsers = (): UserProfile[] => {
  return globalForStore.civoraUsers || DEMO_USERS;
};
