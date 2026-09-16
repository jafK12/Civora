import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'civora-backend',
    version: '1.0.0',
    time: new Date().toISOString(),
  });
}
