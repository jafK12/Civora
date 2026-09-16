import { NextRequest, NextResponse } from 'next/server';
import { voteHelpful } from '@/lib/server/reportStore';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const userId = body.userId || 'anonymous-user';

    const result = await voteHelpful(id, userId);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        helpfulCount: result.helpfulCount,
        hasVoted: result.hasVoted,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
