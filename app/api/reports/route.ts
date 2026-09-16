import { NextRequest, NextResponse } from 'next/server';
import { getReports, submitReport } from '@/lib/server/reportStore';
import { ReportStatus, SubmitReportDTO } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const officeId = searchParams.get('officeId') || undefined;
  const serviceId = searchParams.get('serviceId') || undefined;
  const status = (searchParams.get('status') as ReportStatus) || undefined;

  const data = await getReports({ officeId, serviceId, status });
  return NextResponse.json({
    success: true,
    data,
    count: data.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SubmitReportDTO;
    const result = await submitReport(body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.report }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
  }
}
