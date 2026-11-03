import { NextRequest } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendRes = await fetch(`${BACKEND_URL}/api/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!backendRes.ok || !backendRes.body) {
      return new Response(
        JSON.stringify({
          error: `Agent backend returned status ${backendRes.status}`,
        }),
        {
          status: backendRes.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(backendRes.body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error:
          error.message ||
          "Could not establish streaming connection with FastAPI agent backend on port 8000",
      }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
