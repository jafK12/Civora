import { SupportedLanguage } from '../types';

export interface TranslationDictionary {
  nav: {
    officeMap: string;
    civicReports: string;
    adminMode: string;
    citizenMode: string;
    pendingOfficerMode: string;
    settings: string;
  };
  categories: {
    allServices: string;
    idCivilRegistration: string;
    businessLicensing: string;
    landProperty: string;
    showing: string;
    officesOffering: string;
  };
  issues: {
    wrongInfo: string;
    bribeRequested: string;
    closedHours: string;
    extraRequirement: string;
    other: string;
  };
  officeDetail: {
    verifiedServices: string;
    verifiedCount: string;
    hoursLabel: string;
    requirementsLabel: string;
    statutoryCitation: string;
    lastVerified: string;
    reportDiscrepancy: string;
    reportsForOffice: string;
    feeLabel: string;
    tapToInspect: string;
    close: string;
    verifiedTariffs: string;
  };
  settings: {
    title: string;
    subtitle: string;
    profile: string;
    language: string;
    theme: string;
    faq: string;
    aboutUs: string;
    terms: string;
    privacy: string;
    support: string;
    logout: string;
    deleteAccount: string;
    lightTheme: string;
    darkTheme: string;
    systemTheme: string;
  };
  profileSection: {
    fullNameLabel: string;
    emailLabel: string;
    roleLabel: string;
    officeLabel: string;
    citizenRole: string;
    pendingOfficerRole: string;
    officeAdminRole: string;
    saveChanges: string;
    savedSuccess: string;
    roleBadgeNote: string;
  };
  accountDeletion: {
    title: string;
    warning: string;
    purgedHeader: string;
    purgedNotice: string;
    retainedHeader: string;
    retainedNotice: string;
    confirmButton: string;
    cancelButton: string;
    deleting: string;
    deletedSuccess: string;
  };
  support: {
    title: string;
    desc: string;
    messagePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    submit: string;
    submitting: string;
    successMessage: string;
  };
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    nav: {
      officeMap: 'Office Map',
      civicReports: 'Civic Reports',
      adminMode: 'Admin Mode',
      citizenMode: 'Citizen Mode',
      pendingOfficerMode: 'Verification Pending',
      settings: 'Settings',
    },
    categories: {
      allServices: 'All Services',
      idCivilRegistration: 'ID & Civil Registration',
      businessLicensing: 'Business & Licensing',
      landProperty: 'Land & Property',
      showing: 'Showing',
      officesOffering: 'offices offering',
    },
    issues: {
      wrongInfo: 'Incorrect Information',
      bribeRequested: 'Bribe or Irregular Fee Requested',
      closedHours: 'Closed During Posted Working Hours',
      extraRequirement: 'Extra Undocumented Requirements',
      other: 'Other Service Delivery Issue',
    },
    officeDetail: {
      verifiedServices: 'Verified Statutory Services',
      verifiedCount: 'verified services',
      hoursLabel: 'Service Hours',
      requirementsLabel: 'Legally Required Documentation',
      statutoryCitation: 'Statutory Citation',
      lastVerified: 'Last verified',
      reportDiscrepancy: 'Report Discrepancy / Irregularity',
      reportsForOffice: 'Civic Reports for this Office',
      feeLabel: 'Statutory Fee',
      tapToInspect: 'Tap a service to inspect statutory rules',
      close: 'Close',
      verifiedTariffs: 'Statutory Services & Verified Tariffs',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Profile, multilingual preferences, and civic trust controls',
      profile: 'User Profile',
      language: 'Language / ቋንቋ / Afaan',
      theme: 'Display Theme',
      faq: 'Frequently Asked Questions',
      aboutUs: 'About Civora',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      support: 'Help & Citizen Support',
      logout: 'Log Out',
      deleteAccount: 'Delete Account',
      lightTheme: 'Light Mode',
      darkTheme: 'Dark Mode',
      systemTheme: 'System Default',
    },
    profileSection: {
      fullNameLabel: 'Full Legal Name',
      emailLabel: 'Email Address',
      roleLabel: 'Civic Access Tier',
      officeLabel: 'Assigned Municipal Office',
      citizenRole: 'Citizen Contributor',
      pendingOfficerRole: 'Pending Verification Officer',
      officeAdminRole: 'Verified Municipal Administrator',
      saveChanges: 'Save Profile Changes',
      savedSuccess: 'Profile saved successfully',
      roleBadgeNote: 'Role permissions are read-only and governed by official verification credentials.',
    },
    accountDeletion: {
      title: 'Delete Account & Purge Identity',
      warning: 'This action permanently removes your personal records from Civora.',
      purgedHeader: 'What is permanently purged:',
      purgedNotice: 'Your account credentials, email, full name, profile row, and any submitted ID verification documents are completely destroyed.',
      retainedHeader: 'What remains on the public ledger:',
      retainedNotice: 'Public accountability reports you submitted remain visible to prevent retroactive erasure of civic records, but are strictly anonymized (your submitter ID is permanently cleared).',
      confirmButton: 'Permanently Purge My Account',
      cancelButton: 'Cancel & Keep Account',
      deleting: 'Purging Account Data...',
      deletedSuccess: 'Your account has been deleted and identity purged.',
    },
    support: {
      title: 'Civic Support Request',
      desc: 'Send technical or data inquiry to the open civic maintenance team.',
      messagePlaceholder: 'Describe your issue, incorrect statutory fee, or platform inquiry...',
      emailLabel: 'Contact Email (Optional)',
      emailPlaceholder: 'you@example.com',
      submit: 'Submit Support Request',
      submitting: 'Submitting Ticket...',
      successMessage: 'Your message has been logged. Thank you for supporting civic transparency.',
    },
  },

  am: {
    nav: {
      officeMap: 'የቢሮዎች ካርታ',
      civicReports: 'የህዝብ ሪፖርቶች',
      adminMode: 'የቢሮ አስተዳዳሪ',
      citizenMode: 'የዜጋ ሁነታ',
      pendingOfficerMode: 'ማረጋገጫ በመጠባበቅ ላይ',
      settings: 'ቅንብሮች',
    },
    categories: {
      allServices: 'ሁሉም አገልግሎቶች',
      idCivilRegistration: 'መታወቂያ እና ወሳኝ ኩነቶች',
      businessLicensing: 'ንግድ እና ፈቃድ',
      landProperty: 'መሬት እና ንብረት',
      showing: 'የሚታዩት',
      officesOffering: 'አገልግሎት የሚሰጡ ቢሮዎች',
    },
    issues: {
      wrongInfo: 'የተሳሳተ መረጃ',
      bribeRequested: 'ጉቦ ወይም ያልተፈቀደ ክፍያ ተጠይቋል',
      closedHours: 'በስራ ሰዓት ዝግ ነው',
      extraRequirement: 'ያልተጠቀሰ ተጨማሪ መስፈርት',
      other: 'ሌላ የአገልግሎት ችግር',
    },
    officeDetail: {
      verifiedServices: 'የተረጋገጡ ህጋዊ አገልግሎቶች',
      verifiedCount: 'የተረጋገጡ አገልግሎቶች',
      hoursLabel: 'የአገልግሎት ሰዓታት',
      requirementsLabel: 'በህግ የሚፈለጉ ሰነዶች',
      statutoryCitation: 'ህጋዊ ማጣቀሻ',
      lastVerified: 'የመጨረሻ ማረጋገጫ',
      reportDiscrepancy: 'የአሰራር ግድፈት ሪፖርት አድርግ',
      reportsForOffice: 'ለዚህ ቢሮ የተመዘገቡ ሪፖርቶች',
      feeLabel: 'ህጋዊ ተመን',
      tapToInspect: 'ህጋዊ ደንቦችን ለመመልከት አገልግሎቱን ይጫኑ',
      close: 'ዝጋ',
      verifiedTariffs: 'ህጋዊ አገልግሎቶች እና የተረጋገጡ ተመኖች',
    },
    settings: {
      title: 'ቅንብሮች',
      subtitle: 'የመገለጫ መረጃ፣ የቋንቋ ምርጫ እና የግላዊነት መቆጣጠሪያ',
      profile: 'የተጠቃሚ መገለጫ',
      language: 'ቋንቋ / Language',
      theme: 'የገጽታ ቀለም',
      faq: 'ተደጋግመው የሚጠየቁ ጥያቄዎች',
      aboutUs: 'ስለ ሲቮራ (Civora)',
      terms: 'የአገልግሎት ውሎች',
      privacy: 'የግላዊነት ፖሊሲ',
      support: 'እርዳታ እና ድጋፍ',
      logout: 'ውጣ',
      deleteAccount: 'መለያ ሰርዝ',
      lightTheme: 'ነጭ ገጽታ',
      darkTheme: 'ጨለማ ገጽታ',
      systemTheme: 'የስርዓት ነባሪ',
    },
    profileSection: {
      fullNameLabel: 'ሙሉ ህጋዊ ስም',
      emailLabel: 'የኢሜይል አድራሻ',
      roleLabel: 'የተጠቃሚ ሚና',
      officeLabel: 'የተመደበው ማዘጋጃ ቤት / ቢሮ',
      citizenRole: 'የዜጋ ተጠቃሚ',
      pendingOfficerRole: 'ማረጋገጫ በመጠባበቅ ላይ ያለ',
      officeAdminRole: 'የተረጋገጠ የቢሮ አስተዳዳሪ',
      saveChanges: 'ለውጦችን መዝግብ',
      savedSuccess: 'መገለጫዎ በተሳካ ሁኔታ ተስተካክሏል',
      roleBadgeNote: 'የተጠቃሚ ሚና በህጋዊ ማስረጃዎች ብቻ የሚወሰን ሲሆን በቀጥታ አይቀየርም።',
    },
    accountDeletion: {
      title: 'መለያን በቋሚነት ሰርዝ',
      warning: 'ይህ እርምጃ የመለያ መረጃዎን በቋሚነት ከሲቮራ ያስወግዳል።',
      purgedHeader: 'በቋሚነት የሚሰረዙ መረጃዎች:',
      purgedNotice: 'የመግቢያ መረጃዎ፣ ኢሜይልዎ፣ ሙሉ ስምዎ፣ የመገለጫ መዝገብዎ እና ያቀረቧቸው የማረጋገጫ ሰነዶች ሙሉ በሙሉ ይወገዳሉ።',
      retainedHeader: 'በህዝብ መዝገብ ላይ የሚቀሩ መረጃዎች:',
      retainedNotice: 'ያቀረቧቸው የህዝብ ሪፖርቶች ለማህበረሰብ ተጠያቂነት በይፋዊ መዝገብ ላይ ይቀጥላሉ፣ ነገር ግን ከእርስዎ ጋር ያላቸው ግንኙነት ሙሉ በሙሉ ተሰርዞ ማንነታቸው ያልታወቀ ይሆናል።',
      confirmButton: 'መለያዬን በቋሚነት ሰርዝ',
      cancelButton: 'ተመለስ',
      deleting: 'መለያ እየተሰረዘ ነው...',
      deletedSuccess: 'መለያዎ እና የግል መረጃዎ ተሰርዟል።',
    },
    support: {
      title: 'የዜጋ ድጋፍ ጥያቄ',
      desc: 'ቴክኒካዊ ወይም የመረጃ ጥያቄዎን ለሲቮራ ቡድን ይላኩ።',
      messagePlaceholder: 'የአገልግሎት ችግር፣ የተሳሳተ ተመን ወይም ጥያቄዎን እዚህ ይጻፉ...',
      emailLabel: 'የመገናኛ ኢሜይል (አማራጭ)',
      emailPlaceholder: 'you@example.com',
      submit: 'ጥያቄውን ላክ',
      submitting: 'በመላክ ላይ...',
      successMessage: 'መልዕክትዎ ደርሶናል፤ ለህዝብ አገልግሎት ግልጽነት ስላበረከቱ እናመሰግናለን።',
    },
  },

  om: {
    nav: {
      officeMap: 'Kaartaa Waajjiraalee',
      civicReports: 'Gabaasota Hawaasaa',
      adminMode: 'Haala Bulchaa',
      citizenMode: 'Haala Lammii',
      pendingOfficerMode: 'Mirkaneessi Eeggamaa Jira',
      settings: 'Qindaa’inoota',
    },
    categories: {
      allServices: 'Tajaajiloota Hundumaa',
      idCivilRegistration: 'Waraqaa Eenyummaa fi Galmee',
      businessLicensing: 'Daldala fi Hayyama',
      landProperty: 'Lafaa fi Qabeenya',
      showing: 'Agarsiisaa jira',
      officesOffering: 'waajjiraalee tajaajila kennan',
    },
    issues: {
      wrongInfo: 'Oodeeffannoo Dogoggoraa',
      bribeRequested: 'Mattaanaa ykn Kaffaltii Seeraan Alaa',
      closedHours: 'Sa’aatii Hojiitti Cufameera',
      extraRequirement: 'Ulaagaa Dabalataa Seeraan Alaa',
      other: 'Rakkoo Tajaajilaa Biraa',
    },
    officeDetail: {
      verifiedServices: 'Tajaajiloota Mirkanaa’an',
      verifiedCount: 'tajaajiloota mirkanaa’an',
      hoursLabel: 'Sa’aatii Tajaajilaa',
      requirementsLabel: 'Sanadoota Seeraan Barbaachisan',
      statutoryCitation: 'Wabii Seeraa',
      lastVerified: 'Mirkaneessa Dhumaa',
      reportDiscrepancy: 'Haniina Tajaajilaa Gabaasi',
      reportsForOffice: 'Gabaasota Waajjira Kanaa',
      feeLabel: 'Kaffaltii Seeraa',
      tapToInspect: 'Seera tajaajilichaa ilaaluuf tuqi',
      close: 'Cufi',
      verifiedTariffs: 'Tajaajiloota Seeraa fi Kaffaltii Mirkanaa’e',
    },
    settings: {
      title: 'Qindaa’inoota',
      subtitle: 'Eenyummaa, filannoo afaanii fi eegumsa ragaa',
      profile: 'Eenyummaa Fayyadamaa',
      language: 'Afaan / Language',
      theme: 'Bifa Agarsiisaa',
      faq: 'Gaaffilee Yeroo Baay’ee Gaafataman',
      aboutUs: 'Waa’ee Civora',
      terms: 'Waliigaltee Tajaajilaa',
      privacy: 'Imaammata Eegumsa Ragaa',
      support: 'Gargaarsa fi Deeggarsa',
      logout: 'Ba’i',
      deleteAccount: 'Herrega Balleessi',
      lightTheme: 'Ifaa',
      darkTheme: 'Dukkana',
      systemTheme: 'Kan Sirnaa',
    },
    profileSection: {
      fullNameLabel: 'Maqaa Seeraa Guutuu',
      emailLabel: 'Teessoo Imeelii',
      roleLabel: 'Sadarkaa Fayyadamaa',
      officeLabel: 'Waajjira Ramadame',
      citizenRole: 'Lammii Hawaasaa',
      pendingOfficerRole: 'Mirkaneessi Eeggamaa Jira',
      officeAdminRole: 'Bulchaa Waajjiraa Mirkanaa’e',
      saveChanges: 'Jijjiirama Galmeessi',
      savedSuccess: 'Oodeeffannoon kee sirreeffameera',
      roleBadgeNote: 'Sadarkaan fayyadamaa ragaa qofaan murtaa’a, kallattiin jijjiiramuu hin danda’u.',
    },
    accountDeletion: {
      title: 'Herrega Guutummaatti Balleessi',
      warning: 'Tarkaanfiin kun dhaabbataadha, ragaa kee guutummaatti haqa.',
      purgedHeader: 'Kan guutummaatti haqamu:',
      purgedNotice: 'Galmeen kee, imeelii, maqaafi sanadoonni ragaa eenyummaa guutummaatti ni haqamu.',
      retainedHeader: 'Galmee hawaasaa irratti kan hafu:',
      retainedNotice: 'Gabaasonni hawaasaa ati dhiheessite itti gaafatamummaa hawaasaatiif ni tursiifamu, garuu eenyummaan kee guutummaatti ni haqama.',
      confirmButton: 'Herrega Koo Guutummaatti Haqi',
      cancelButton: 'Dhiisi',
      deleting: 'Haqamaa jira...',
      deletedSuccess: 'Herregni kee haqameera.',
    },
    support: {
      title: 'Gargaarsa Lammii',
      desc: 'Gaaffii ykn haniina tajaajilaa garee Civora tiif ergaa.',
      messagePlaceholder: 'Rakkoo tajaajilaa ykn gaaffii qabdu asitti barreessaa...',
      emailLabel: 'Imeelii Qunnamtii (Dirqama Miti)',
      emailPlaceholder: 'you@example.com',
      submit: 'Ergaa Galchi',
      submitting: 'Ergamaa jira...',
      successMessage: 'Ergaan kee nu gaheera. Galatoomaa!',
    },
  },
};
