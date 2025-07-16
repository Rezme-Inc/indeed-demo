"use client";

import { UserDashboardContent } from "./components/UserDashboardContent";
import { useRouter } from "next/navigation";

// Main page component with header
export default function UserDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-semibold text-black">Dashboard</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/restorative-record")}
                className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                To Restorative Record
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-4">
        {/* Main Content */}
        <UserDashboardContent />
      </div>
    </div>
  );
}