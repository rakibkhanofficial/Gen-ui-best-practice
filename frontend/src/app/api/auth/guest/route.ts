import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Extract client IP from forwarding headers or connection
  const forwarded = req.headers.get("x-forwarded-for");
  const rawIp = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";
  const sanitizedIp = rawIp.replace(/[^a-zA-Z0-9]/g, "_");

  // Check if an existing guest ID cookie is present
  const existingGuestId = req.cookies.get("genui_guest_id")?.value;
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  const guestId = existingGuestId || `guest_${sanitizedIp}_${timestamp}_${randomSuffix}`;

  const guestUser = {
    id: guestId,
    name: "Guest Explorer",
    email: "guest@genui.presentation.local",
    role: "guest",
    ip: rawIp,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(guestId)}`,
    createdAt: new Date().toISOString(),
  };

  const response = NextResponse.json({
    success: true,
    user: guestUser,
  });

  // Set long-lived cookie for stable guest identity
  response.cookies.set("genui_guest_id", guestId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: "lax",
  });
  response.cookies.set("genui_user_id", guestId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });

  return response;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const customName = body.name || "Guest Presenter";

    const forwarded = req.headers.get("x-forwarded-for");
    const rawIp = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";
    const sanitizedIp = rawIp.replace(/[^a-zA-Z0-9]/g, "_");

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const guestId = `guest_${sanitizedIp}_${timestamp}_${randomSuffix}`;

    const guestUser = {
      id: guestId,
      name: customName,
      email: "guest@genui.presentation.local",
      role: "guest",
      ip: rawIp,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(guestId)}`,
      createdAt: new Date().toISOString(),
    };

    const response = NextResponse.json({
      success: true,
      user: guestUser,
    });

    response.cookies.set("genui_guest_id", guestId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
    response.cookies.set("genui_user_id", guestId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
