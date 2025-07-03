"use client";

import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/types/auth";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function SignUpForm() {
  const searchParams = useSearchParams();
  const role = (searchParams.get("role") as UserRole) || "user";
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    ...(role === "user" && {
      birthday: "",
      interests: "",
      isVisibleToHR: false,
    }),
    ...(role === "hr_admin" && {
      company: "",
    }),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Sign up with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile based on role
        const profileData = {
          id: authData.user.id,
          email: formData.email,
          name: formData.name,
          role,
          ...(role === "user" && {
            birthday: formData.birthday,
            interests:
              "interests" in formData && formData.interests
                ? formData.interests.split(",").map((i) => i.trim())
                : [],
            isVisibleToHR: formData.isVisibleToHR,
          }),
          ...(role === "hr_admin" && {
            company: formData.company,
          }),
        };

        const { error: profileError } = await supabase
          .from(role === "user" ? "user_profiles" : "hr_admin_profiles")
          .insert([profileData]);

        if (profileError) throw profileError;

        // Redirect to dashboard
        window.location.href = `/${role}/dashboard`;
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("Error during signup. Please try again.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign up as {role.replace("_", " ")}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
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
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="name" className="sr-only">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          {role === "user" && (
            <>
              <div>
                <label htmlFor="birthday" className="sr-only">
                  Birthday
                </label>
                <input
                  id="birthday"
                  name="birthday"
                  type="date"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  value={formData.birthday}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="interests" className="sr-only">
                  Interests (comma-separated)
                </label>
                <textarea
                  id="interests"
                  name="interests"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Interests (comma-separated)"
                  value={formData.interests}
                  onChange={handleChange}
                />
              </div>
              <div className="flex items-center">
                <input
                  id="isVisibleToHR"
                  name="isVisibleToHR"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={formData.isVisibleToHR}
                  onChange={handleChange}
                />
                <label
                  htmlFor="isVisibleToHR"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Make my profile visible to HR admins
                </label>
              </div>
            </>
          )}

          {role === "hr_admin" && (
            <div>
              <label htmlFor="company" className="sr-only">
                Company name
              </label>
              <input
                id="company"
                name="company"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Company name"
                value={formData.company}
                onChange={handleChange}
              />
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SignUp() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
