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
  const [phone, setPhone] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
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
              phone,
              company_address: companyAddress,
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-md w-full animate-fade-in">
        {/* Glass Container */}
        <div className="glass-strong rounded-3xl p-8 shadow-2xl backdrop-blur-2xl glow-border smooth-transition bg-white/60">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black mb-2 animate-slide-up">
              Create HR Admin Account
            </h2>
            <p className="text-gray-600">
              Join Rezme as an HR Administrator
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSignup}>
            {error && (
              <div className="bg-red-50 rounded-2xl p-4 border border-red-200 animate-slide-up">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  id="first-name"
                  name="firstName"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 smooth-transition text-black placeholder-gray-400"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  id="last-name"
                  name="lastName"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 smooth-transition text-black placeholder-gray-400"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

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
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                id="company"
                name="company"
                type="text"
                required
                className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 smooth-transition text-black placeholder-gray-400"
                placeholder="Company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 smooth-transition text-black placeholder-gray-400"
                placeholder="Work phone number"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9\s\-\(\)\+]/g, '');
                  setPhone(value);
                }}
              />
            </div>

            <div>
              <label htmlFor="company-address" className="block text-sm font-medium text-gray-700 mb-2">
                Company Address
              </label>
              <input
                id="company-address"
                name="companyAddress"
                type="text"
                required
                className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 smooth-transition text-black placeholder-gray-400"
                placeholder="Company address"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
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
                autoComplete="new-password"
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
                {loading ? "Creating account..." : "Sign up"}
              </button>
            </div>
          </form>

          <div className="text-center pt-6">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                href="/auth/hr-admin/login"
                className="text-black font-semibold hover:text-gray-700 smooth-transition underline decoration-gray-300 hover:decoration-gray-500"
              >
                Log in
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
