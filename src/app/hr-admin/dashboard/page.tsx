"use client";

import {
  sendInvitationEmail,
  sendReinvitationEmail,
} from "@/app/restorative-record/utils/sendEmail";
import { useHRAdminProfile } from "@/hooks/useHRAdminProfile";
import { useHrInvites } from "@/hooks/useHrInvites";
import { usePermittedUsers } from "@/hooks/usePermittedUsers";
import { useSecureSession } from "@/hooks/useSecureSession";
import { initializeCSRFProtection } from "@/lib/csrf";
import { supabase } from "@/lib/supabase";
import { generateSecureCode } from "@/utils/invitation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AssessmentMetrics from "./components/AssessmentMetrics";
import CandidateTable from "./components/CandidateTable";
import InvitationCodeCard from "./components/InvitationCodeCard";
import InviteCandidateModal from "./components/InviteCandidateModal";
import ToolkitResourcesCard from "./components/ToolkitResourcesCard";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  birthday: string | null;
  interests: string[];
  rr_completed: boolean;
  granted_at?: string;
  assessment_status?: {
    current_step: number;
    status: string;
    completed_at_step?: number;
  };
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

export default function HRAdminDashboard() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { sentInvites, setSentInvites } = useHrInvites();
  const router = useRouter();

  // Add state for invite candidate modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [originalMessageTemplate, setOriginalMessageTemplate] = useState("");
  const [inviteForm, setInviteForm] = useState({
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    customMessage: "",
  });
  const [sendingInvite, setSendingInvite] = useState(false);

  const {
    hrAdmin,
    loading: hrAdminLoading,
    error: hrAdminError,
    refresh: refreshHrAdmin,
  } = useHRAdminProfile();
  const {
    users: permittedUsers,
    loading: usersLoading,
    error: usersError,
    refresh: refreshPermittedUsers,
  } = usePermittedUsers(hrAdmin?.id);

  // Enable secure session monitoring for HR admin
  useSecureSession();

  // Generate a new invitation code for the HR admin
  const generateInvitationCode = async () => {
    try {
      if (!hrAdmin) return;

      const newCode = generateSecureCode();
      console.log("Updating invitation code to:", newCode);

      const { error } = await supabase
        .from("hr_admin_profiles")
        .update({ invitation_code: newCode })
        .eq("id", hrAdmin.id);

      if (error) throw error;

      await refreshHrAdmin();
      setSuccess("New invitation code generated successfully!");
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
    router.push(`/hr-admin/dashboard/${userId}/assessment`);
  };

  const refreshData = async () => {
    await refreshPermittedUsers();
    setSuccess("Data refreshed successfully!");
    setTimeout(() => setSuccess(null), 3000);
  };

  const openInviteModal = () => {
    const template = `Dear [Candidate Name],

I hope this message finds you well. As part of our hiring process, we would like to invite you to create a Restorative Record to help us better understand your background and qualifications.

Your Restorative Record is an opportunity to share your story, highlight your growth, and demonstrate the positive changes you've made. This process is designed to ensure fair consideration of all candidates while meeting our compliance requirements.

To get started, please:
1. Visit our platform using your invitation code: ${
      hrAdmin?.invitation_code || "[CODE]"
    }
2. Create your account and complete your Restorative Record
3. Share your record with us when you're ready

If you have any questions about this process, please don't hesitate to reach out to me directly.

Best regards,
${hrAdmin?.first_name || ""} ${hrAdmin?.last_name || ""}
${hrAdmin?.company || ""}

This invitation code will allow you to connect with our HR team: ${
      hrAdmin?.invitation_code || "[CODE]"
    }`;

    setOriginalMessageTemplate(template);
    setInviteForm({
      candidateName: "",
      candidateEmail: "",
      candidatePhone: "",
      customMessage: template,
    });
    setShowInviteModal(true);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingInvite(true);

    try {
      // Prepare invitation data
      const invitationData = {
        candidateName: inviteForm.candidateName,
        customMessage: inviteForm.customMessage,
        hrAdminName: hrAdmin
          ? `${hrAdmin.first_name} ${hrAdmin.last_name}`
          : "",
        company: hrAdmin?.company || "",
        invitationCode: hrAdmin?.invitation_code || "",
      };

      // Send the invitation email
      const emailResult = await sendInvitationEmail(
        invitationData,
        inviteForm.candidateEmail
      );

      if (!emailResult.success) {
        throw new Error(String(emailResult.error) || "Failed to send email");
      }

      // Create invite record for tracking
      const newInvite = {
        id: Date.now().toString(),
        name: inviteForm.candidateName,
        email: inviteForm.candidateEmail,
        phone: inviteForm.candidatePhone,
        dateSent: new Date().toISOString(),
        message: inviteForm.customMessage,
      };

      // Add to sent invites
      setSentInvites((prev) => [...prev, newInvite]);

      setSuccess(
        `Invitation sent successfully to ${inviteForm.candidateEmail}`
      );
      setShowInviteModal(false);
      setInviteForm({
        candidateName: "",
        candidateEmail: "",
        candidatePhone: "",
        customMessage: "",
      });
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Error sending invite:", err);
      setError("Failed to send invitation. Please try again.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setSendingInvite(false);
    }
  };

  const handleReinviteCandidate = async (candidateId: string) => {
    try {
      // Find the original invite by ID
      const originalInvite = sentInvites.find(
        (invite) => invite.id === candidateId
      );

      if (!originalInvite) {
        setError("Original invitation not found. Cannot send reinvite.");
        setTimeout(() => setError(null), 5000);
        return;
      }

      if (!hrAdmin) {
        setError("HR admin profile not loaded. Please refresh and try again.");
        setTimeout(() => setError(null), 5000);
        return;
      }

      // Prepare reinvitation data
      const reinvitationData = {
        candidateName: originalInvite.name,
        originalMessage: originalInvite.message,
        hrAdminName: `${hrAdmin.first_name} ${hrAdmin.last_name}`,
        company: hrAdmin.company,
        invitationCode: hrAdmin.invitation_code,
        originalDateSent: originalInvite.dateSent,
      };

      // Send the reinvitation email
      const emailResult = await sendReinvitationEmail(
        reinvitationData,
        originalInvite.email
      );

      if (!emailResult.success) {
        throw new Error(
          String(emailResult.error) || "Failed to send reinvitation email"
        );
      }

      // Update the original invite record with reinvite information
      setSentInvites((prev) =>
        prev.map((invite) =>
          invite.id === candidateId
            ? {
                ...invite,
                lastReinviteDate: new Date().toISOString(),
                reinviteCount: (invite.reinviteCount || 0) + 1,
              }
            : invite
        )
      );

      setSuccess(`Reinvitation sent successfully to ${originalInvite.email}`);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Error sending reinvite:", err);
      setError("Failed to send reinvitation. Please try again.");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleSecureLogout = async () => {
    try {
      const { secureLogout } = await import("@/lib/secureAuth");
      const result = await secureLogout({
        auditReason: "hr_admin_user_action",
        redirectTo: "/",
        clearLocalData: true,
      });

      if (!result.success) {
        console.error("Secure logout failed:", result.error);
        // Fallback to basic logout
        await supabase.auth.signOut();
        router.push("/");
      }
    } catch (error) {
      console.error("Error during secure logout:", error);
      // Fallback to basic logout
      try {
        await supabase.auth.signOut();
        router.push("/");
      } catch (fallbackError) {
        console.error("Fallback logout also failed:", fallbackError);
        // Force redirect as last resort
        window.location.href = "/";
      }
    }
  };

  useEffect(() => {
    initializeCSRFProtection();
  }, []);

  return (
    <div
      className="min-h-screen bg-white p-6 space-y-8"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {error && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl border z-50"
          style={{
            backgroundColor: "#FEF2F2",
            borderColor: "#FECACA",
            color: "#E54747",
          }}
          role="alert"
        >
          <span className="block sm:inline font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl border z-50"
          style={{
            backgroundColor: "#F0FDF4",
            borderColor: "#BBF7D0",
            color: "#166534",
          }}
          role="alert"
        >
          <span className="block sm:inline font-medium">{success}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-black">
          HR Admin Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={refreshData}
            className="px-4 py-2 border text-base font-medium rounded-xl transition-all duration-200 hover:opacity-90"
            style={{
              color: "#595959",
              borderColor: "#E5E5E5",
              backgroundColor: "transparent",
            }}
          >
            Refresh Data
          </button>
          {hrAdmin && (
            <div className="text-right">
              <p className="font-semibold text-black">{hrAdmin.company}</p>
              <p className="text-sm" style={{ color: "#595959" }}>
                {hrAdmin.first_name} {hrAdmin.last_name}
              </p>
            </div>
          )}
          <button
            onClick={handleSecureLogout}
            className="px-4 py-2 text-base font-medium rounded-xl transition-all duration-200 hover:opacity-90"
            style={{
              color: "#FFFFFF",
              backgroundColor: "#E54747",
              border: "none",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
      {/* Invitation Code and Toolkit Section - Positioned side by side */}
      <div className="flex justify-start gap-6">
        <InvitationCodeCard
          invitationCode={hrAdmin?.invitation_code}
          onGenerate={generateInvitationCode}
          onInvite={openInviteModal}
        />
        <ToolkitResourcesCard />
      </div>

      {/* Assessment Metrics */}
      <AssessmentMetrics
        users={permittedUsers}
        sentInvites={sentInvites}
        onViewAssessment={(candidateId) =>
          router.push(`/hr-admin/dashboard/${candidateId}/assessment`)
        }
        onReinviteCandidate={handleReinviteCandidate}
      />

      {/* Users Table */}
      <CandidateTable
        users={permittedUsers}
        onViewProfile={viewUserProfile}
        onStartAssessment={startAssessment}
      />

      <InviteCandidateModal
        show={showInviteModal}
        inviteForm={inviteForm}
        setInviteForm={setInviteForm}
        originalMessageTemplate={originalMessageTemplate}
        sendingInvite={sendingInvite}
        onClose={() => setShowInviteModal(false)}
        onSubmit={handleSendInvite}
      />
    </div>
  );
}
