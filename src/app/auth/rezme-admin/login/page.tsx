"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RezmeAdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        router.push("/rezme-admin/dashboard");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full animate-fade-in">
        {/* Glass Container */}
        <div className="glass-strong rounded-3xl p-8 shadow-2xl backdrop-blur-2xl glow-border smooth-transition bg-white/60">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-black mb-4 animate-slide-up">
              Rezme Admin Login
            </h2>
            <p className="text-base text-gray-600 mb-8">
              Manage the platform and oversee all users and HR admins
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 rounded-2xl p-4 border border-red-200 animate-slide-up">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 smooth-transition text-black placeholder-gray-400"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 smooth-transition text-black placeholder-gray-400"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-4 bg-black text-white font-semibold rounded-2xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl smooth-transition"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
          
          <div className="text-center pt-6">
            <p className="text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/rezme-admin/signup"
                className="text-black font-semibold hover:text-gray-700 smooth-transition underline decoration-gray-300 hover:decoration-gray-500"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-gray-600 hover:text-black smooth-transition text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
