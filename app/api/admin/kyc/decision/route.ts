// app/api/admin/kyc/decision/route.ts
import { UserService } from '@/services/user.service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, decision, extractedName, reason } = body;

    // Validate required fields
    if (!requestId || !decision) {
      return NextResponse.json(
        { error: 'Missing required fields: requestId, decision' },
        { status: 400 }
      );
    }

    const userService = new UserService();
    const result = await userService.kycDecision(requestId, decision, extractedName, reason);
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: result.status }
      );
    }
    return NextResponse.json(result, {status: result.status});
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to process KYC decision. ${error}` },
      { status: 500 }
    );
  }
}