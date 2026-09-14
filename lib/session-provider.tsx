"use client";

/**
 * Client-side view of the authenticated user. The actual credential check and
 * signed cookie live server-side in `lib/auth/session.ts` and
 * `app/api/auth/*`; this provider just exposes the current session to
 * components (nav filtering, greetings, logout) and refetches it on demand.
 *
 * Route protection itself happens in `app/(dashboard)/layout.tsx` (a Server
 * Component that redirects to /login before anything here even renders), so
 * this provider can assume a session exists once mounted inside the
 * dashboard shell — `session` is only null very briefly on first paint or on
 * the public /login page.
 */

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/types";

export interface Session {
  userId: string;
  name: string;
  email: string;
  role: Role;
}

interface SessionContextValue {
  session: Session | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  children,
  initialSession = null,
}: {
  children: React.ReactNode;
  initialSession?: Session | null;
}) {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [isLoading, setIsLoading] = useState(!initialSession);
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      setSession(res.ok ? await res.json() : null);
    } catch {
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    router.push("/login");
    router.refresh();
  }, [router]);

  return (
    <SessionContext.Provider value={{ session, isLoading, refresh, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

/**
 * Convenience hook for components that only render inside the authenticated
 * dashboard shell, where a session is guaranteed by the server-side redirect.
 * Falls back to a placeholder rather than throwing during the brief moment
 * before the first `/api/auth/me` response resolves.
 */
export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  const session: Session = ctx.session ?? { userId: "", name: "...", email: "", role: "CASHIER" };
  return { session, isLoading: ctx.isLoading, refresh: ctx.refresh, logout: ctx.logout };
}
