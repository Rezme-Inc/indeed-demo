"use client";

import { useSecureSession } from "@/hooks/useSecureSession";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RezmeAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Enable secure session monitoring for Rezme admin
  useSecureSession();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/");
        return;
      }

      // Check if user is a Rezme Admin
      const { data: rezmeAdmin, error } = await supabase
        .from("rezme_admin_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error || !rezmeAdmin) {
        console.error("Not a Rezme Admin:", error);
        router.push("/");
        return;
      }
    };

    checkAuth();
  }, [router]);

  return <>{children}</>;
}
