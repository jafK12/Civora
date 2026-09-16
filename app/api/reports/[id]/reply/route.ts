import { NextRequest, NextResponse } from 'next/server';
import { submitOfficialReply } from '@/lib/server/reportStore';
import { SubmitReplyDTO } from '@/lib/types';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as Omit<SubmitReplyDTO, 'reportId'>;

    const result = await submitOfficialReply({
      reportId: id,
      replierId: body.replierId,
      replierEmail: body.replierEmail,
      officeName: body.officeName,
      text: body.text,
    });

    if (!result.success) {
      const status = result.error?.includes('Permission denied') ? 403 : 400;
      return NextResponse.json({ success: false, error: result.error }, { status });
    }

    return NextResponse.json({ success: true, data: result.report }, { status: 200 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
