import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const backendRes = await fetch(`${BACKEND_URL}/api/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.message ||
          "Upload proxy error communicating with agent backend",
      },
      { status: 502 }
    );
  }
}
