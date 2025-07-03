"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HrAdminLogin() {
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
        router.push("/hr-admin/dashboard");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8" style={{fontFamily: 'Poppins, sans-serif'}}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-semibold text-black mb-4">
            HR Admin Login
          </h2>
          <p className="text-base mb-8" style={{color: '#595959'}}>
            Manage your organization&apos;s talent and view connected users
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-4 border text-base rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                style={{
                  borderColor: '#E5E5E5',
                  color: '#000000',
                  backgroundColor: '#FFFFFF'
                }}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#E54747';
                  e.target.style.boxShadow = '0 0 0 2px rgba(229, 71, 71, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E5E5';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-4 border text-base rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                style={{
                  borderColor: '#E5E5E5',
                  color: '#000000',
                  backgroundColor: '#FFFFFF'
                }}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#E54747';
                  e.target.style.boxShadow = '0 0 0 2px rgba(229, 71, 71, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E5E5';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {error && (
            <div 
              className="text-sm p-3 rounded-lg"
              style={{
                color: '#E54747',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA'
              }}
            >
              {error}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-6 border-2 text-base font-medium rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: loading ? '#d1d5db' : '#E54747',
                borderColor: loading ? '#d1d5db' : '#E54747'
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
        
        <div className="text-center pt-4">
          <Link
            href="/auth/hr-admin/signup"
            className="text-base font-medium transition-all duration-200 hover:opacity-90"
            style={{color: '#595959'}}
          >
            Don&apos;t have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
