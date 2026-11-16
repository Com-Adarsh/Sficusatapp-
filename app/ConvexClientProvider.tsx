"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
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
  }, []);

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
