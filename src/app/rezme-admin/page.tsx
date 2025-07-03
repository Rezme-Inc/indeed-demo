"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RezmeAdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/rezme-admin/dashboard");
  }, [router]);

  return null;
}
