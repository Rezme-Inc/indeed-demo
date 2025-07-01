"use client";

import { secureLogout } from "@/lib/secureAuth";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const role = pathname.split("/")[1];

  // Initialize session monitoring
  useEffect(() => {
    import("@/lib/secureAuth").then(({ initializeSessionMonitoring }) => {
      initializeSessionMonitoring();
    });
  }, []);

  const handleLogout = async () => {
    try {
      const result = await secureLogout({
        auditReason: "user_action",
        redirectTo: "/",
        clearLocalData: true,
      });

      if (!result.success) {
        console.error("Logout error:", result.error);
        // Fallback to basic logout if secure logout fails
        await supabase.auth.signOut();
        router.push("/");
      }
    } catch (error) {
      console.error("Error during secure logout:", error);
      // Fallback to basic logout
      try {
        await supabase.auth.signOut();
        router.push("/");
      } catch (fallbackError) {
        console.error("Fallback logout also failed:", fallbackError);
        // Force redirect as last resort
        window.location.href = "/";
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-indigo-600">
                  Rezme
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href={`/${role}/dashboard`}
                  className={`${
                    pathname === `/${role}/dashboard`
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Dashboard
                </Link>
                <Link
                  href={`/${role}/profile`}
                  className={`${
                    pathname === `/${role}/profile`
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Profile
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <button
                onClick={handleLogout}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
