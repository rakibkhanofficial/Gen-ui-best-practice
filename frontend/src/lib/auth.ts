export interface UserSession {
  id: string; // guest_${ip}_${timestamp}_${hash} or usr_google_${slug}_${timestamp}
  name: string;
  email: string;
  role: "guest" | "google";
  avatar: string;
  ip?: string;
  createdAt: string;
}

const GUEST_STORAGE_KEY = "genui_guest_session";

/**
 * Generate a clean 14-character alphanumeric chat/session ID (e.g., "egr67e8vbtyw3e")
 */
export function generateChatId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 14; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * User-wise localStorage key for chat sessions list
 */
export function getUserSessionsKey(userId: string): string {
  return `genui_sessions_v3_${userId}`;
}

/**
 * User-wise localStorage key for a specific session's messages
 */
export function getUserMessagesKey(userId: string, sessionId: string): string {
  return `genui_msgs_v3_${userId}_${sessionId}`;
}

/**
 * Set active chat ID cookie
 */
export function setActiveChatCookie(chatId: string): void {
  if (typeof document !== "undefined") {
    document.cookie = `genui_active_chat=${chatId}; path=/; max-age=2592000; SameSite=Lax`;
  }
}

/**
 * Read active chat ID from cookies
 */
export function getActiveChatCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )genui_active_chat=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Retrieve cached guest user from localStorage
 */
export function getGuestUser(): UserSession | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(GUEST_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Create a guest session with a unique ID based on IP and timestamp
 */
export function createGuestSession(customName?: string, ip?: string): UserSession {
  const rawIp = ip || "127.0.0.1";
  const sanitizedIp = rawIp.replace(/[^a-zA-Z0-9]/g, "_");
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const guestId = `guest_${sanitizedIp}_${timestamp}_${randomSuffix}`;

  const session: UserSession = {
    id: guestId,
    name: customName || "Guest Explorer",
    email: "guest@genui.presentation.local",
    role: "guest",
    ip: rawIp,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(guestId)}`,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(session));
    document.cookie = `genui_guest_id=${session.id}; path=/; max-age=2592000; SameSite=Lax`;
    document.cookie = `genui_user_id=${session.id}; path=/; max-age=2592000; SameSite=Lax`;
  }

  return session;
}

/**
 * Ensure guest identity is established (fetching server-detected IP if needed)
 */
export async function getOrCreateGuestUser(): Promise<UserSession> {
  const existing = getGuestUser();
  if (existing) return existing;

  try {
    const res = await fetch("/api/auth/guest");
    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        if (typeof window !== "undefined") {
          localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data.user));
        }
        return data.user;
      }
    }
  } catch {}

  return createGuestSession();
}

/**
 * Clear guest session and auth cookies
 */
export function clearGuestSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(GUEST_STORAGE_KEY);
    document.cookie = "genui_guest_id=; path=/; max-age=0";
    document.cookie = "genui_user_id=; path=/; max-age=0";
    document.cookie = "genui_active_chat=; path=/; max-age=0";
  }
}
