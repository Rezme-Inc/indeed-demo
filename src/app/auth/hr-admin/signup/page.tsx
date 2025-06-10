"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HrAdminSignup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (authData.user) {
        // Create the HR admin profile
        const { error: profileError } = await supabase
          .from("hr_admin_profiles")
          .insert([
            {
              id: authData.user.id,
              email,
              first_name: firstName,
              last_name: lastName,
              company,
              connected_users: [], // Initialize empty array
            },
          ]);

        if (profileError) {
          setError(profileError.message);
          return;
        }

        // Redirect to dashboard
        router.push("/hr-admin/dashboard");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
            Create HR Admin Account
          </h2>
          <p className="mt-2 text-center text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
            Join Rezme as an HR Administrator
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="space-y-4">
            <div>
              <label htmlFor="first-name" className="sr-only">
                First Name
              </label>
              <input
                id="first-name"
                name="firstName"
                type="text"
                required
                className="relative block w-full px-4 py-3 border border-gray-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm"
                style={{ 
                  fontFamily: 'Poppins, sans-serif',
                  color: '#000000',
                  backgroundColor: '#FFFFFF'
                }}
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#E54747';
                  e.target.style.boxShadow = '0 0 0 2px rgba(229, 71, 71, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label htmlFor="last-name" className="sr-only">
                Last Name
              </label>
              <input
                id="last-name"
                name="lastName"
                type="text"
                required
                className="relative block w-full px-4 py-3 border border-gray-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm"
                style={{ 
                  fontFamily: 'Poppins, sans-serif',
                  color: '#000000',
                  backgroundColor: '#FFFFFF'
                }}
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#E54747';
                  e.target.style.boxShadow = '0 0 0 2px rgba(229, 71, 71, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label htmlFor="company" className="sr-only">
                Company Name
              </label>
              <input
                id="company"
                name="company"
                type="text"
                required
                className="relative block w-full px-4 py-3 border border-gray-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm"
                style={{ 
                  fontFamily: 'Poppins, sans-serif',
                  color: '#000000',
                  backgroundColor: '#FFFFFF'
                }}
                placeholder="Company Name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#E54747';
                  e.target.style.boxShadow = '0 0 0 2px rgba(229, 71, 71, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
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
                className="relative block w-full px-4 py-3 border border-gray-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm"
                style={{ 
                  fontFamily: 'Poppins, sans-serif',
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
                  e.target.style.borderColor = '#D1D5DB';
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
                autoComplete="new-password"
                required
                className="relative block w-full px-4 py-3 border border-gray-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm"
                style={{ 
                  fontFamily: 'Poppins, sans-serif',
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
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {error && (
            <div className="text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: '#E54747' }}>
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ 
                fontFamily: 'Poppins, sans-serif',
                backgroundColor: '#E54747',
                color: '#FFFFFF'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#D63636';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#E54747';
              }}
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link
            href="/auth/hr-admin/login"
            className="text-sm font-medium transition-all duration-200 hover:underline"
            style={{ 
              fontFamily: 'Poppins, sans-serif',
              color: '#E54747'
            }}
          >
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
