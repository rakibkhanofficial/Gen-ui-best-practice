import { NextRequest } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8000";

export async function GET(req: NextRequest) {
  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/download-sample-excel`);

    if (!backendRes.ok || !backendRes.body) {
      return new Response("Failed to fetch sample excel", {
        status: backendRes.status,
      });
    }

    return new Response(backendRes.body, {
      headers: {
        "Content-Type":
          backendRes.headers.get("Content-Type") ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          backendRes.headers.get("Content-Disposition") ||
          'attachment; filename="sample_enterprise_sales.xlsx"',
      },
    });
  } catch (error: any) {
    return new Response(
      `Error connecting to backend: ${error.message || "Unknown error"}`,
      { status: 502 }
    );
  }
}
