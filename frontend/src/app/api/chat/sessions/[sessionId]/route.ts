import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8000";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id") || "guest_default";

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/chat/sessions/${encodeURIComponent(sessionId)}?user_id=${encodeURIComponent(userId)}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      return NextResponse.json(
        { session_id: sessionId, user_id: userId, turns: [] },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { session_id: sessionId, user_id: userId, turns: [], error: err.message },
      { status: 200 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id") || "guest_default";

  try {
    const body = await req.json();
    const res = await fetch(
      `${BACKEND_URL}/api/chat/sessions/${encodeURIComponent(sessionId)}?user_id=${encodeURIComponent(userId)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ status: "error", error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id") || "guest_default";

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/chat/sessions/${encodeURIComponent(sessionId)}?user_id=${encodeURIComponent(userId)}`,
      { method: "DELETE" }
    );
    const data = await res.json().catch(() => ({ status: "deleted" }));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: "deleted", session_id: sessionId });
  }
}

