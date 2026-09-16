import { Report } from '../types';

export const SEED_REPORTS: Report[] = [
  // Cluster demonstrating pattern_confirmed (3 reports on same office + service + issue within 30 days)
  {
    id: 'seed-rep-pattern-1',
    officeId: 'office-1',
    serviceId: 'srv-id-replace',
    officeName: 'Central District Civic Center',
    serviceName: 'National Identity Card Replacement',
    issueType: 'extra undocumented requirement',
    details: 'The front counter clerk demanded an extra stamped affidavit not listed in the published documentation checklist.',
    timestamp: '2026-09-13T10:00:00.000Z', // 2 days ago
    anonymous: false,
    submitterId: 'demo-citizen-cluster-1',
    status: 'pattern_confirmed',
    helpfulCount: 8,
    helpfulUserIds: ['user-a', 'user-b'],
    officialReply: null,
  },
  {
    id: 'seed-rep-pattern-2',
    officeId: 'office-1',
    serviceId: 'srv-id-replace',
    officeName: 'Central District Civic Center',
    serviceName: 'National Identity Card Replacement',
    issueType: 'extra undocumented requirement',
    details: 'Was told I needed two additional passport photos with blue background, despite the guidelines explicitly stating white background only.',
    timestamp: '2026-09-10T14:30:00.000Z', // 5 days ago
    anonymous: true,
    submitterId: 'demo-citizen-cluster-2',
    status: 'pattern_confirmed',
    helpfulCount: 5,
    helpfulUserIds: ['user-c'],
    officialReply: null,
  },
  {
    id: 'seed-rep-pattern-3',
    officeId: 'office-1',
    serviceId: 'srv-id-replace',
    officeName: 'Central District Civic Center',
    serviceName: 'National Identity Card Replacement',
    issueType: 'extra undocumented requirement',
    details: 'Staff requested an unannounced utility bill verification letter before accepting the ID renewal dossier.',
    timestamp: '2026-09-07T09:15:00.000Z', // 8 days ago
    anonymous: false,
    submitterId: 'demo-citizen-cluster-3',
    status: 'pattern_confirmed',
    helpfulCount: 12,
    helpfulUserIds: ['user-d', 'user-e', 'user-f'],
    officialReply: null,
  },

  // Report demonstrating institutional right-of-reply (responded)
  {
    id: 'seed-rep-responded-1',
    officeId: 'office-1',
    serviceId: 'srv-biz-license',
    officeName: 'Central District Civic Center',
    serviceName: 'Commercial Business License Renewal',
    issueType: 'closed during posted hours',
    details: 'Arrived at the licensing counter at 11:30 AM on Thursday, but the window was shut with a handwritten note saying back at 2 PM.',
    timestamp: '2026-09-03T11:30:00.000Z', // 12 days ago
    anonymous: false,
    submitterId: 'demo-citizen-rep-4',
    status: 'responded',
    helpfulCount: 15,
    helpfulUserIds: ['user-g', 'user-h'],
    officialReply: {
      id: 'seed-reply-1',
      reportId: 'seed-rep-responded-1',
      replierId: 'demo-admin-central-001',
      replierEmail: 'admin.central@civic.gov.et',
      officeName: 'Central District Civic Center',
      text: 'Thank you for bringing this to our attention. On Thursday the 3rd, our counter system underwent an unscheduled server reboot between 11:15 AM and 1:30 PM. We apologize for the inconvenience and have implemented a protocol to ensure temporary manual intake desks remain open during any future IT maintenance.',
      timestamp: '2026-09-04T16:00:00.000Z',
    },
  },

  // Single unverified report for Southern Local Civic Office
  {
    id: 'seed-rep-unverified-1',
    officeId: 'office-2',
    serviceId: 'srv-id-replace',
    officeName: 'Southern Local Civic Office',
    serviceName: 'National Identity Card Replacement',
    issueType: 'wrong info',
    details: 'The official fee displayed on the bulletin board was listed as 250 ETB, but the website stated 50 ETB.',
    timestamp: '2026-09-14T08:45:00.000Z', // 1 day ago
    anonymous: true,
    submitterId: 'demo-citizen-rep-5',
    status: 'unverified',
    helpfulCount: 2,
    helpfulUserIds: ['user-i'],
    officialReply: null,
  },

  // Kenya report for Nairobi Central Citizens Bureau
  {
    id: 'seed-rep-ke-1',
    officeId: 'office-4',
    serviceId: 'srv-ke-biz-permit',
    officeName: 'Nairobi Central Citizens Bureau',
    serviceName: 'Single Business Permit Renewal',
    issueType: 'extra undocumented requirement',
    details: 'Desk officer required an uncertified environmental audit stamped copy not mentioned on the county portal.',
    timestamp: '2026-09-12T14:10:00.000Z',
    anonymous: false,
    submitterId: 'demo-citizen-ke-1',
    status: 'unverified',
    helpfulCount: 4,
    helpfulUserIds: ['user-k1'],
    officialReply: null,
  },

  // Rwanda report for Kigali Urban Civic Service Desk
  {
    id: 'seed-rep-rw-1',
    officeId: 'office-5',
    serviceId: 'srv-rw-irembbo-cert',
    officeName: 'Kigali Urban Civic Service Desk',
    serviceName: 'Civil Status Certificate & Notarization',
    issueType: 'closed during posted hours',
    details: 'Attended the desk at 4:15 PM on Friday but staff had closed the processing booth early.',
    timestamp: '2026-09-11T16:20:00.000Z',
    anonymous: true,
    submitterId: 'demo-citizen-rw-1',
    status: 'unverified',
    helpfulCount: 3,
    helpfulUserIds: ['user-rw1'],
    officialReply: null,
  },
];
