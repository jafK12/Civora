import { NextResponse } from 'next/server';
import { getDemoUsers } from '@/lib/server/reportStore';

export async function GET() {
  const users = getDemoUsers();
  return NextResponse.json({
    success: true,
    data: users,
  });
}
