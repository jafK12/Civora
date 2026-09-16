import { NextResponse } from 'next/server';
import { resetToSeed } from '@/lib/server/reportStore';

export async function POST() {
  resetToSeed();
  return NextResponse.json({
    success: true,
    message: 'Database reset to initial seed data.',
  });
}
