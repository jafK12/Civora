import { NextRequest, NextResponse } from 'next/server';
import { DEMO_USERS } from '@/lib/data/demoUsers';
import { SupportedLanguage } from '@/lib/types';

// In-memory update cache for demo server session
const memoryProfiles = new Map<string, { fullName?: string; preferredLanguage?: SupportedLanguage; country?: string | null }>();

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, fullName, preferredLanguage, country } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const current = memoryProfiles.get(userId) || {};
    if (fullName !== undefined) {
      current.fullName = fullName;
    }
    if (preferredLanguage !== undefined) {
      current.preferredLanguage = preferredLanguage;
    }
    if (country !== undefined) {
      current.country = country;
    }
    memoryProfiles.set(userId, current);

    // Also update in DEMO_USERS array if found
    const demoUser = DEMO_USERS.find((u) => u.id === userId);
    if (demoUser) {
      if (fullName !== undefined) demoUser.fullName = fullName;
      if (preferredLanguage !== undefined) demoUser.preferredLanguage = preferredLanguage;
      if (country !== undefined) demoUser.country = country;
    }

    return NextResponse.json({
      success: true,
      data: {
        userId,
        fullName: current.fullName,
        preferredLanguage: current.preferredLanguage,
        country: current.country,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
