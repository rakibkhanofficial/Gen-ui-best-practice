export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "guest" | "user" | "admin";
  avatar: string;
  createdAt: string;
}

const GUEST_STORAGE_KEY = "genui_guest_session";

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

export function createGuestSession(customName?: string): UserSession {
  const session: UserSession = {
    id: `guest_${Math.random().toString(36).substring(2, 9)}`,
    name: customName || "Guest Explorer",
    email: "guest@genui.presentation.local",
    role: "guest",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=GenUIExplorer",
    createdAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(session));
    document.cookie = `genui_session=${session.id}; path=/; max-age=86400; SameSite=Lax`;
  }
  return session;
}

export function clearGuestSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(GUEST_STORAGE_KEY);
    document.cookie = "genui_session=; path=/; max-age=0";
  }
}

