"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UserSignup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
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
        // If invitation code is provided, verify it first
        let hrAdminId = null;
        if (invitationCode) {
          const trimmedCode = invitationCode.trim();
          console.log("Verifying invitation code:", trimmedCode);

          // Try to find the specific HR admin
          const { data: hrAdmins, error: hrAdminError } = await supabase
            .from("hr_admin_profiles")
            .select("id, connected_users, invitation_code")
            .eq("invitation_code", trimmedCode);

          if (hrAdminError) {
            console.error("Error finding HR admin:", hrAdminError);
            setError("Error verifying invitation code");
            return;
          }

          if (!hrAdmins || hrAdmins.length === 0) {
            console.error(
              "No HR admin found with invitation code:",
              trimmedCode
            );
            setError("Invalid invitation code");
            return;
          }

          console.log("Found HR admin:", hrAdmins[0]);
          hrAdminId = hrAdmins[0].id;
        }

        // Create the user profile with visibility based on invitation code
        const isVisibleToHR = !!hrAdminId; // Only visible if using invitation code
        console.log("Creating user profile with visibility:", isVisibleToHR);
        console.log("User ID:", authData.user.id);

        const userProfile = {
          id: authData.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          is_visible_to_hr: isVisibleToHR,
        };

        console.log("Creating user profile with data:", userProfile);

        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .insert([userProfile])
          .select()
          .single();

        if (profileError) {
          console.error("Error creating user profile:", profileError);
          setError(profileError.message);
          return;
        }

        console.log("Successfully created user profile:", profileData);

        // If we have a valid HR admin ID, connect the user
        if (hrAdminId) {
          console.log("Connecting user to HR admin:", hrAdminId);

          // First get the current connected users
          const { data: hrAdmin, error: hrAdminError } = await supabase
            .from("hr_admin_profiles")
            .select("connected_users")
            .eq("id", hrAdminId)
            .single();

          if (hrAdminError) {
            console.error("Error fetching HR admin:", hrAdminError);
          } else {
            // Add the new user to connected_users array
            const currentConnectedUsers = hrAdmin.connected_users || [];
            if (!currentConnectedUsers.includes(authData.user.id)) {
              const updatedConnectedUsers = [
                ...currentConnectedUsers,
                authData.user.id,
              ];
              console.log(
                "Updating HR admin's connected users:",
                updatedConnectedUsers
              );

              // Update without selecting
              const { error: updateError } = await supabase
                .from("hr_admin_profiles")
                .update({ connected_users: updatedConnectedUsers })
                .eq("id", hrAdminId);

              if (updateError) {
                console.error("Error connecting to HR admin:", updateError);
              } else {
                console.log("Successfully updated HR admin's connected users");
              }
            }
          }
        }

        // Redirect to dashboard
        router.push("/user/dashboard");
      }
    } catch (err) {
      console.error("Error during signup:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Rezme as a user
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="first-name" className="sr-only">
                First Name
              </label>
              <input
                id="first-name"
                name="firstName"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="invitation-code" className="sr-only">
                HR Admin Invitation Code (Optional)
              </label>
              <input
                id="invitation-code"
                name="invitationCode"
                type="text"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="HR Admin Invitation Code (Optional)"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link
            href="/auth/user/login"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
