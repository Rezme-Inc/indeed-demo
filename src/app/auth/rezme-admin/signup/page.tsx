"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RezmeAdminSignup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
        // Create the Rezme admin profile
        const { error: profileError } = await supabase
          .from("rezme_admin_profiles")
          .insert([
            {
              id: authData.user.id,
              email,
              first_name: firstName,
              last_name: lastName,
            },
          ]);

        if (profileError) {
          setError(profileError.message);
          return;
        }

        // Redirect to dashboard
        router.push("/rezme-admin/dashboard");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-black mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Create Rezme Admin Account
          </h1>
          <p className="text-base text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Join Rezme as a Platform Administrator
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <form className="space-y-6" onSubmit={handleSignup}>
            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="first-name" 
                  className="block text-sm font-medium text-black mb-2"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  First Name
                </label>
                <input
                  id="first-name"
                  name="firstName"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              
              <div>
                <label 
                  htmlFor="last-name" 
                  className="block text-sm font-medium text-black mb-2"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Last Name
                </label>
                <input
                  id="last-name"
                  name="lastName"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              
              <div>
                <label 
                  htmlFor="email-address" 
                  className="block text-sm font-medium text-black mb-2"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-black mb-2"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              style={{ 
                fontFamily: 'Poppins, sans-serif',
                backgroundColor: loading ? '#9CA3AF' : '#E54747',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#DC2626';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#E54747';
                }
              }}
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>
        </div>

        {/* Footer Section */}
        <div className="text-center">
          <p className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Already have an account?{" "}
            <Link
              href="/auth/rezme-admin/login"
              className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
