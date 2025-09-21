import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // You can parse form-encoded payloads here when you add buttons/modals
  return new NextResponse(null, { status: 200 });
}

export async function GET() {
  return new NextResponse("ok", { status: 200 });
}
