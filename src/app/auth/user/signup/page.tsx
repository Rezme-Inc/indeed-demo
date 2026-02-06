"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Signup() {
  // Step tracking
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: First name
  const [firstName, setFirstName] = useState("");
  
  // Step 2: Email
  const [email, setEmail] = useState("");
  
  // Step 3: Password
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Step 4: City
  const [city, setCity] = useState("");
  
  // Other fields
  const [lastName, setLastName] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isStep1Valid = firstName.trim().length >= 1;
  const isStep2Valid = email.includes("@") && email.includes(".");
  const isStep3Valid = password.length >= 6 && password === confirmPassword;
  const isStep4Valid = city.trim().length >= 1;

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (currentStep === 1) {
      if (!isStep1Valid) {
        setError("Please enter your first name");
        return;
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!isStep2Valid) {
        setError("Please enter a valid email address");
        return;
      }
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      setCurrentStep(4);
      return;
    }

    if (currentStep === 4) {
      if (!isStep4Valid) {
        setError("Please enter your city");
        return;
      }
      
      // Final step - create account
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else if (data.user) {
        const { error: profileError } = await supabase
          .from("user_profiles")
          .insert([
            {
              id: data.user.id,
              email: email,
              first_name: firstName,
              last_name: lastName || "",
              city: city,
              interests: [],
              is_visible_to_hr: true,
            },
          ]);

        if (profileError) {
          console.error("Error creating profile:", profileError);
        }

        router.push("/user/dashboard");
      }
    }
  };

  // Eye icon for showing password
  const EyeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  // Eye off icon for hiding password
  const EyeOffIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white">
      <div className="max-w-md w-full animate-fade-in">
        {/* Clean Card Container */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-3">
              {currentStep === 1 && "Let's get started"}
              {currentStep === 2 && "What's your email?"}
              {currentStep === 3 && "Create a password"}
              {currentStep === 4 && "Where do you live?"}
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              {currentStep === 1 && "In under a minute, you can learn about your legal rights, connect with people you trust, and show employers your skills."}
              {currentStep === 2 && "We'll use this to keep your account secure."}
              {currentStep === 3 && "Your password must be at least 6 characters long."}
              {currentStep === 4 && "This helps us connect you with local resources and opportunities."}
            </p>
          </div>

          {/* Step 1: First Name */}
          {currentStep === 1 && (
            <form onSubmit={handleContinue} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="What's your name?"
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={!isStep1Valid}
                className={`w-full py-4 px-4 font-semibold rounded-full transition-all duration-200 ${
                  isStep1Valid
                    ? "bg-black text-white hover:bg-gray-800 shadow-lg"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Continue
              </button>

              <div className="text-xs text-gray-500 leading-relaxed">
                <p>
                  By entering and clicking Continue, you agree to the{" "}
                  <Link href="/terms" className="text-black underline">Terms</Link>,{" "}
                  <Link href="/esign" className="text-black underline">E-Sign Consent</Link>, &{" "}
                  <Link href="/privacy" className="text-black underline">Privacy Policy</Link>.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-center text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/auth/user/login"
                    className="text-black font-semibold hover:text-gray-700 transition-colors"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* Step 2: Email */}
          {currentStep === 2 && (
            <form onSubmit={handleContinue} className="space-y-6">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={!isStep2Valid}
                className={`w-full py-4 px-4 font-semibold rounded-full transition-all duration-200 ${
                  isStep2Valid
                    ? "bg-black text-white hover:bg-gray-800 shadow-lg"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Continue
              </button>

              {/* Back button */}
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
              >
                ← Back
              </button>
            </form>
          )}

          {/* Step 3: Password */}
          {currentStep === 3 && (
            <form onSubmit={handleContinue} className="space-y-6">
              {/* Password Input */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full px-4 py-4 pr-12 bg-gray-50 border border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {/* Confirm Password Input */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full px-4 py-4 pr-12 bg-gray-50 border border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {/* Password requirements hint */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${password.length >= 6 ? 'bg-green-500' : 'bg-gray-200'}`}>
                  {password.length >= 6 && (
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span>At least 6 characters</span>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={!isStep3Valid}
                className={`w-full py-4 px-4 font-semibold rounded-full transition-all duration-200 ${
                  isStep3Valid
                    ? "bg-black text-white hover:bg-gray-800 shadow-lg"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Continue
              </button>

              {/* Back button */}
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
              >
                ← Back
              </button>
            </form>
          )}

          {/* Step 4: City */}
          {currentStep === 4 && (
            <form onSubmit={handleContinue} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter your city"
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={!isStep4Valid || loading}
                className={`w-full py-4 px-4 font-semibold rounded-full transition-all duration-200 ${
                  isStep4Valid && !loading
                    ? "bg-black text-white hover:bg-gray-800 shadow-lg"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>

              {/* Back button */}
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
              >
                ← Back
              </button>
            </form>
          )}
        </div>
        
        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-gray-500 hover:text-black transition-colors text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
