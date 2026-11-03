import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!filename) {
    return NextResponse.json({ error: "Filename required" }, { status: 400 });
  }

  // Primary: Direct MinIO public bucket URL
  const minioUrl = `http://localhost:9000/genui-uploads/${encodeURIComponent(filename)}`;

  try {
    const minioRes = await fetch(minioUrl);
    if (minioRes.ok) {
      const contentType = minioRes.headers.get("content-type") || "application/octet-stream";
      return new NextResponse(minioRes.body, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400",
        },
      });
    }
  } catch {}

  // Fallback: Backend file endpoint
  try {
    const backendUrl = `http://localhost:8000/api/files/${encodeURIComponent(filename)}`;
    const backendRes = await fetch(backendUrl);
    if (backendRes.ok) {
      const contentType = backendRes.headers.get("content-type") || "application/octet-stream";
      return new NextResponse(backendRes.body, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400",
        },
      });
    }
  } catch {}

  return NextResponse.json({ error: "File not found" }, { status: 404 });
}

