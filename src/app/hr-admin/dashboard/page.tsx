"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  birthday: string | null;
  interests: string[];
  rr_completed: boolean;
  granted_at?: string;
  compliance_steps?: {
    conditional_job_offer: boolean;
    individualized_assessment: boolean;
    preliminary_job_offer_revocation: boolean;
    individualized_reassessment: boolean;
    final_revocation_notice: boolean;
    decision: boolean;
  };
  final_decision?: string;
}

interface HRAdmin {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  invitation_code: string;
}

function generateSecureCode(): string {
  // Generate 4 random bytes and convert to hex
  const randomBytes = new Uint8Array(4);
  crypto.getRandomValues(randomBytes);
  const randomHex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  // Get current timestamp in base36
  const timestamp = Date.now().toString(36).toUpperCase();

  // Combine and take first 8 characters
  const code = (randomHex + timestamp).slice(0, 8);
  console.log("Generated invitation code:", code);
  return code;
}

// Hardcoded ordered steps
const ASSESSMENT_STEPS = [
  { key: 'conditional_job_offer', label: 'Conditional Job Offers' },
  { key: 'individualized_assessment', label: 'Written Individualized Assessment' },
  { key: 'preliminary_job_offer_revocation', label: 'Preliminary Job Offer Revocation' },
  { key: 'individualized_reassessment', label: 'Individual Reassessment' },
  { key: 'final_revocation_notice', label: 'Final Revocation Notice' },
];

// Helper to get current assessment step index (0-based)
function getCurrentAssessmentStep(user: any): number {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(`assessmentCurrentStep_${user.id}`);
    if (saved && !isNaN(Number(saved))) {
      return Number(saved) - 1; // localStorage is 1-based
    }
  }
  return 0;
}

function ComplianceStepDisplay({ user }: { user: any }) {
  const [expanded, setExpanded] = useState(false);
  const currentStepIdx = getCurrentAssessmentStep(user);
  const completedSteps = ASSESSMENT_STEPS.slice(0, currentStepIdx);
  const currentStep = ASSESSMENT_STEPS[currentStepIdx];

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {currentStep ? currentStep.label : "-"}
        </span>
        <button
          type="button"
          className="text-xs text-blue-600 underline focus:outline-none"
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? "Hide" : "Show Previous"}
        </button>
      </div>
      {expanded && (
        <div className="mt-2 flex flex-col gap-1">
          {completedSteps.length === 0 ? (
            <span className="text-xs text-gray-400">No previous steps</span>
          ) : (
            completedSteps.map(s => (
              <span key={s.key} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {s.label}
              </span>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function HRAdminDashboard() {
  const [permittedUsers, setPermittedUsers] = useState<User[]>([]);
  const [hrAdmin, setHRAdmin] = useState<HRAdmin | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Add state for invite candidate modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    customMessage: ''
  });
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    fetchHRAdminProfile();
  }, []);

  useEffect(() => {
    if (hrAdmin) {
      fetchPermittedUsers();
    }
  }, [hrAdmin]);

  const fetchHRAdminProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("hr_admin_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      console.log("Fetched HR admin profile:", data);
      setHRAdmin(data);
    } catch (err) {
      console.error("Error fetching HR admin profile:", err);
      setError("Failed to load HR admin profile");
    }
  };

  const fetchPermittedUsers = async () => {
    try {
      if (!hrAdmin) return;

      console.log(
        "Fetching users who granted permission to HR admin:",
        hrAdmin.id
      );

      // First fetch the permissions
      const { data: permissions, error: permError } = await supabase
        .from("user_hr_permissions")
        .select("user_id, granted_at")
        .eq("hr_admin_id", hrAdmin.id)
        .eq("is_active", true);

      if (permError) throw permError;

      if (!permissions || permissions.length === 0) {
        setPermittedUsers([]);
        return;
      }

      // Then fetch the user profiles
      const userIds = permissions.map((p) => p.user_id);
      const { data: userProfiles, error: userError } = await supabase
        .from("user_profiles")
        .select("*")
        .in("id", userIds);

      if (userError) throw userError;

      // Combine the data
      const users =
        userProfiles?.map((profile) => {
          const permission = permissions.find((p) => p.user_id === profile.id);
          return {
            ...profile,
            granted_at: permission?.granted_at,
          };
        }) || [];

      console.log("Fetched permitted users:", users);
      setPermittedUsers(users);
    } catch (err) {
      console.error("Error fetching permitted users:", err);
      setError("Failed to load permitted users");
    }
  };

  const generateInvitationCode = async () => {
    try {
      const code = generateSecureCode();
      console.log("Attempting to update HR admin profile with code:", code);

      // First update the invitation code
      const { error: updateError } = await supabase
        .from("hr_admin_profiles")
        .update({ invitation_code: code })
        .eq("id", hrAdmin?.id);

      if (updateError) {
        console.error("Error updating invitation code:", updateError);
        throw updateError;
      }

      // Then fetch the updated profile
      const { data, error: fetchError } = await supabase
        .from("hr_admin_profiles")
        .select("*")
        .eq("id", hrAdmin?.id)
        .single();

      if (fetchError) {
        console.error("Error fetching updated profile:", fetchError);
        throw fetchError;
      }

      console.log("Successfully updated HR admin profile:", data);
      setHRAdmin((prev) => (prev ? { ...prev, invitation_code: code } : null));
      setSuccess("Invitation code generated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error generating invitation code:", err);
      setError("Failed to generate invitation code");
      setTimeout(() => setError(null), 3000);
    }
  };

  const viewUserProfile = (userId: string) => {
    router.push(`/hr-admin/dashboard/${userId}`);
  };

  const startAssessment = async (userId: string) => {
    try {
      // Directly navigate to the assessment page
      window.location.href = `/hr-admin/dashboard/${userId}/assessment`;
    } catch (err) {
      console.error("Error starting assessment:", err);
      setError("Failed to start assessment");
      setTimeout(() => setError(null), 3000);
    }
  };

  const refreshData = async () => {
    await fetchHRAdminProfile();
    await fetchPermittedUsers();
  };

  // Handle opening invite modal with default message
  const openInviteModal = () => {
    const defaultMessage = `Dear [Candidate Name],

I hope this message finds you well. As part of our Fair Chance Hiring procedure for the County of San Diego, we are inviting you to create a Restorative Record on our platform.

The Restorative Record allows you to share your personal story, rehabilitation efforts, and positive contributions to your community, providing a more complete picture beyond traditional background checks.

Creating your Restorative Record is voluntary and will help us make a more informed and fair employment decision. The process is confidential and you have full control over what information you choose to share.

If you're interested in participating, please visit our platform and use the invitation code: ${hrAdmin?.invitation_code || '[CODE]'}

Thank you for your time and consideration.

Best regards,
${hrAdmin?.first_name} ${hrAdmin?.last_name}
${hrAdmin?.company}`;

    setInviteForm({
      candidateName: '',
      candidateEmail: '',
      candidatePhone: '',
      customMessage: defaultMessage
    });
    setShowInviteModal(true);
  };

  // Handle sending invite to candidate
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingInvite(true);

    try {
      // For now, we'll just show a success message
      // In the future, this could integrate with an email service
      setSuccess(`Invitation sent to ${inviteForm.candidateEmail || 'candidate'}!`);
      setShowInviteModal(false);
      setInviteForm({
        candidateName: '',
        candidateEmail: '',
        candidatePhone: '',
        customMessage: ''
      });
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Error sending invite:', err);
      setError('Failed to send invitation. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          HR Admin Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Refresh Data
          </button>
          {hrAdmin && (
            <div className="text-gray-900">
              <p className="font-medium">{hrAdmin.company}</p>
              <p className="text-sm">
                {hrAdmin.first_name} {hrAdmin.last_name}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Invitation Code Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Invitation Code
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={generateInvitationCode}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Generate New Code
            </button>
            <button
              onClick={openInviteModal}
              disabled={!hrAdmin?.invitation_code}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Invite Candidate
            </button>
          </div>
        </div>
        {hrAdmin?.invitation_code ? (
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500 mb-2">
              Share this code with users to connect with them:
            </p>
            <p className="text-2xl font-mono text-gray-900">
              {hrAdmin.invitation_code}
            </p>
          </div>
        ) : (
          <p className="text-gray-500">
            No invitation code generated yet. Click the button above to generate
            one.
          </p>
        )}
      </div>

      {/* Users with Granted Access */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Users Who Granted You Access
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  RR Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  FINAL DECISION
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Access Granted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Compliance Steps
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {permittedUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.rr_completed
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                        }`}
                    >
                      {user.rr_completed ? "Completed" : "In Progress"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {user.final_decision || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {user.granted_at
                      ? new Date(user.granted_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 space-x-4">
                    <button
                      onClick={() => viewUserProfile(user.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Profile
                    </button>
                    {/* Determine current step index for action button */}
                    {(() => {
                      const currentStepIdx = getCurrentAssessmentStep(user);
                      if (user.final_decision === 'Hired') {
                        return (
                          <button
                            onClick={() => startAssessment(user.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            View Assessment
                          </button>
                        );
                      } else if (currentStepIdx > 0) {
                        return (
                          <button
                            onClick={() => startAssessment(user.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Continue Assessment
                          </button>
                        );
                      } else {
                        return (
                          <button
                            onClick={() => startAssessment(user.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Begin Assessment
                          </button>
                        );
                      }
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ComplianceStepDisplay user={user} />
                  </td>
                </tr>
              ))}
              {permittedUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-900"
                  >
                    No users have granted you access yet. Share your invitation
                    code with users to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Candidate Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Invite Candidate to Create Restorative Record
                </h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSendInvite} className="p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Candidate Name */}
                <div className="sm:col-span-2">
                  <label htmlFor="candidateName" className="block text-sm font-medium text-gray-700">
                    Candidate Name
                  </label>
                  <input
                    type="text"
                    id="candidateName"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                    value={inviteForm.candidateName}
                    onChange={(e) => setInviteForm({ ...inviteForm, candidateName: e.target.value })}
                    placeholder="Enter candidate's full name"
                  />
                </div>

                {/* Candidate Email */}
                <div>
                  <label htmlFor="candidateEmail" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="candidateEmail"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                    value={inviteForm.candidateEmail}
                    onChange={(e) => setInviteForm({ ...inviteForm, candidateEmail: e.target.value })}
                    placeholder="candidate@example.com"
                  />
                </div>

                {/* Candidate Phone */}
                <div>
                  <label htmlFor="candidatePhone" className="block text-sm font-medium text-gray-700">
                    Phone Number <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    id="candidatePhone"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                    value={inviteForm.candidatePhone}
                    onChange={(e) => setInviteForm({ ...inviteForm, candidatePhone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>

                {/* Custom Message */}
                <div className="sm:col-span-2">
                  <label htmlFor="customMessage" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="customMessage"
                    rows={10}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                    value={inviteForm.customMessage}
                    onChange={(e) => setInviteForm({ ...inviteForm, customMessage: e.target.value })}
                    placeholder="Customize your invitation message..."
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    This message will be sent to the candidate along with instructions for creating their Restorative Record.
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingInvite || !inviteForm.candidateName || !inviteForm.candidateEmail}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {sendingInvite ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
