"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convex = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    return url ? new ConvexReactClient(url) : null;
  }, []);

  useEffect(() => {
    if (!convex) return;
    const supabase = createClient();
    const setToken = async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    };
    void convex.setAuth(setToken);
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      void convex.setAuth(setToken);
    });
    return () => listener.subscription.unsubscribe();
  }, [convex]);

  return convex ? <ConvexProvider client={convex}>{children}</ConvexProvider> : <>{children}</>;
}
