"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SecurityLogoutContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") || "security_event";

  const getLogoutReason = (reason: string) => {
    switch (reason) {
      case "session_invalid_no_session":
        return {
          title: "Session Expired",
          description:
            "Your session has expired for security reasons. Please log in again.",
          icon: "🕐",
        };
      case "session_invalid_token_expired":
        return {
          title: "Session Timeout",
          description:
            "Your session has timed out due to inactivity. Please log in again.",
          icon: "⏰",
        };
      case "security_event":
        return {
          title: "Security Logout",
          description:
            "You have been logged out due to suspicious activity detected on your account.",
          icon: "🔒",
        };
      case "concurrent_session":
        return {
          title: "Multiple Sessions Detected",
          description:
            "Multiple active sessions were detected. You have been logged out for security.",
          icon: "👥",
        };
      default:
        return {
          title: "Security Logout",
          description: "You have been logged out for security reasons.",
          icon: "🛡️",
        };
    }
  };

  const logoutInfo = getLogoutReason(reason);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="text-6xl mb-4">{logoutInfo.icon}</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {logoutInfo.title}
          </h2>
          <p className="text-gray-600 mb-8">{logoutInfo.description}</p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {/* Security Information */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    What happened?
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      For your security, we've automatically logged you out.
                      This could be due to:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Suspicious activity detected</li>
                      <li>Session timeout or expiration</li>
                      <li>Multiple concurrent sessions</li>
                      <li>Security policy enforcement</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    What should you do next?
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Clear your browser cache and cookies</li>
                      <li>Ensure you're on a secure network</li>
                      <li>Check for any suspicious account activity</li>
                      <li>Log in again using the button below</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-4">
              <Link
                href="/auth/user/login"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Log In as User
              </Link>

              <Link
                href="/auth/hr-admin/login"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Log In as HR Admin
              </Link>

              <Link
                href="/"
                className="text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Return to Home
              </Link>
            </div>

            {/* Contact Support */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                If you believe this was an error or need assistance, please{" "}
                <a
                  href="mailto:security@rezme.app"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  contact our security team
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SecurityLogoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
          </div>
        </div>
      }
    >
      <SecurityLogoutContent />
    </Suspense>
  );
}
