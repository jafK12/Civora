import { NextRequest, NextResponse } from 'next/server';

interface SupportRequestItem {
  id: string;
  userId?: string | null;
  contactEmail?: string | null;
  message: string;
  createdAt: string;
}

const memorySupportRequests: SupportRequestItem[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, contactEmail, message } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Message cannot be empty' }, { status: 400 });
    }

    const newTicket: SupportRequestItem = {
      id: 'supp-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7),
      userId: userId || null,
      contactEmail: contactEmail?.trim() || null,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    memorySupportRequests.unshift(newTicket);

    return NextResponse.json({
      success: true,
      message: 'Support request recorded successfully',
      data: { id: newTicket.id, createdAt: newTicket.createdAt },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
