"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useHRAdminProfile } from '@/hooks/useHRAdminProfile';
import { usePermittedUsers } from '@/hooks/usePermittedUsers';
import AssessmentMetrics from "./components/AssessmentMetrics";
import { sendInvitationEmail, sendReinvitationEmail } from '@/app/restorative-record/utils/sendEmail';

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

  // Special case: if step = 6 (currentStepIdx === 5)
  if (currentStepIdx === 5) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: '#F0FDF4',
              color: '#166534',
              border: '1px solid #BBF7D0',
              fontWeight: 'bold'
            }}
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            All steps completed
          </span>
          <button
            type="button"
            className="text-xs font-medium underline focus:outline-none transition-all duration-200 hover:opacity-90"
            style={{ color: '#595959' }}
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? "Hide" : "Show Previous"}
          </button>
        </div>
        {expanded && (
          <div className="mt-3 flex flex-col gap-2">
            {ASSESSMENT_STEPS.map(s => (
              <span
                key={s.key}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: '#F0FDF4',
                  color: '#166534',
                  border: '1px solid #BBF7D0'
                }}
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {s.label}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: '#F0F9FF',
            color: '#1E40AF',
            border: '1px solid #DBEAFE'
          }}
        >
          {currentStep ? currentStep.label : "-"}
        </span>
        <button
          type="button"
          className="text-xs font-medium underline focus:outline-none transition-all duration-200 hover:opacity-90"
          style={{ color: '#595959' }}
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? "Hide" : "Show Previous"}
        </button>
      </div>
      {expanded && (
        <div className="mt-3 flex flex-col gap-2">
          {completedSteps.length === 0 ? (
            <span className="text-xs" style={{ color: '#9CA3AF' }}>No previous steps</span>
          ) : (
            completedSteps.map(s => (
              <span
                key={s.key}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: '#F0FDF4',
                  color: '#166534',
                  border: '1px solid #BBF7D0'
                }}
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sentInvites, setSentInvites] = useState<Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    dateSent: string;
    message: string;
    lastReinviteDate?: string;
    reinviteCount?: number;
  }>>([]);
  const router = useRouter();

  // Add state for invite candidate modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [originalMessageTemplate, setOriginalMessageTemplate] = useState('');
  const [inviteForm, setInviteForm] = useState({
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    customMessage: ''
  });
  const [sendingInvite, setSendingInvite] = useState(false);
  const [hasLoadedInvites, setHasLoadedInvites] = useState(false);

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


  // Load sent invites from localStorage
  useEffect(() => {
    const savedInvites = localStorage.getItem('hr_sent_invites');
    console.log('-----savedInvites-----', savedInvites);
    if (savedInvites) {
      try {
        setSentInvites(JSON.parse(savedInvites));
      } catch (error) {
        console.error('Error loading sent invites:', error);
      }
    }
    setHasLoadedInvites(true);
  }, []);

  // Save sent invites to localStorage (only after initial load)
  useEffect(() => {
    if (hasLoadedInvites) {
      localStorage.setItem('hr_sent_invites', JSON.stringify(sentInvites));
    }
  }, [sentInvites, hasLoadedInvites]);



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
1. Visit our platform using your invitation code: ${hrAdmin?.invitation_code || '[CODE]'}
2. Create your account and complete your Restorative Record
3. Share your record with us when you're ready

If you have any questions about this process, please don't hesitate to reach out to me directly.

Best regards,
${hrAdmin?.first_name || ''} ${hrAdmin?.last_name || ''}
${hrAdmin?.company || ''}

This invitation code will allow you to connect with our HR team: ${hrAdmin?.invitation_code || '[CODE]'}`;

    setOriginalMessageTemplate(template);
    setInviteForm({
      candidateName: '',
      candidateEmail: '',
      candidatePhone: '',
      customMessage: template
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
        hrAdminName: hrAdmin ? `${hrAdmin.first_name} ${hrAdmin.last_name}` : '',
        company: hrAdmin?.company || '',
        invitationCode: hrAdmin?.invitation_code || ''
      };

      // Send the invitation email
      const emailResult = await sendInvitationEmail(invitationData, inviteForm.candidateEmail);

      if (!emailResult.success) {
        throw new Error(String(emailResult.error) || 'Failed to send email');
      }

      // Create invite record for tracking
      const newInvite = {
        id: Date.now().toString(),
        name: inviteForm.candidateName,
        email: inviteForm.candidateEmail,
        phone: inviteForm.candidatePhone,
        dateSent: new Date().toISOString(),
        message: inviteForm.customMessage
      };

      // Add to sent invites
      setSentInvites(prev => [...prev, newInvite]);

      setSuccess(`Invitation sent successfully to ${inviteForm.candidateEmail}`);
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

  const handleReinviteCandidate = async (candidateId: string) => {
    try {
      // Find the original invite by ID
      const originalInvite = sentInvites.find(invite => invite.id === candidateId);

      if (!originalInvite) {
        setError('Original invitation not found. Cannot send reinvite.');
        setTimeout(() => setError(null), 5000);
        return;
      }

      if (!hrAdmin) {
        setError('HR admin profile not loaded. Please refresh and try again.');
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
        originalDateSent: originalInvite.dateSent
      };

      // Send the reinvitation email
      const emailResult = await sendReinvitationEmail(reinvitationData, originalInvite.email);

      if (!emailResult.success) {
        throw new Error(String(emailResult.error) || 'Failed to send reinvitation email');
      }

      // Update the original invite record with reinvite information
      setSentInvites(prev => prev.map(invite =>
        invite.id === candidateId
          ? {
            ...invite,
            lastReinviteDate: new Date().toISOString(),
            reinviteCount: (invite.reinviteCount || 0) + 1
          }
          : invite
      ));

      setSuccess(`Reinvitation sent successfully to ${originalInvite.email}`);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Error sending reinvite:', err);
      setError('Failed to send reinvitation. Please try again.');
      setTimeout(() => setError(null), 5000);
    }
  };

  // Filter users based on search query
  const filteredUsers = permittedUsers.filter(user => {
    const query = searchQuery.toLowerCase();
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const email = user.email.toLowerCase();
    const status = user.rr_completed ? "completed" : "in progress";
    const finalDecision = (user.final_decision || "").toLowerCase();

    return fullName.includes(query) ||
      email.includes(query) ||
      status.includes(query) ||
      finalDecision.includes(query);
  });

  return (
    <div
      className="min-h-screen bg-white p-6 space-y-8"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      {error && (
        <div
          className="px-4 py-3 rounded-xl border"
          style={{
            backgroundColor: '#FEF2F2',
            borderColor: '#FECACA',
            color: '#E54747'
          }}
          role="alert"
        >
          <span className="block sm:inline font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div
          className="px-4 py-3 rounded-xl border"
          style={{
            backgroundColor: '#F0FDF4',
            borderColor: '#BBF7D0',
            color: '#166534'
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
              color: '#595959',
              borderColor: '#E5E5E5',
              backgroundColor: 'transparent'
            }}
          >
            Refresh Data
          </button>
          {hrAdmin && (
            <div className="text-right">
              <p className="font-semibold text-black">{hrAdmin.company}</p>
              <p className="text-sm" style={{ color: '#595959' }}>
                {hrAdmin.first_name} {hrAdmin.last_name}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Invitation Code and Toolkit Section - Positioned side by side */}
      <div className="flex justify-start gap-6">
        {/* Invitation Code Box */}
        <div className="bg-white border rounded-xl p-4 w-80" style={{ borderColor: '#E5E5E5' }}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-black">
              Invitation Code
            </h3>
            <button
              onClick={generateInvitationCode}
              className="px-3 py-1 border text-sm font-medium rounded-lg transition-all duration-200 hover:opacity-90"
              style={{
                color: '#595959',
                borderColor: '#E5E5E5',
                backgroundColor: 'transparent'
              }}
            >
              Generate New Code
            </button>
          </div>
          {hrAdmin?.invitation_code ? (
            <div className="p-3 rounded-xl mb-3" style={{ backgroundColor: '#F8F9FA' }}>
              <p className="text-xs mb-1" style={{ color: '#595959' }}>
                Share this securecode with candidates to connect with them on Rézme:
              </p>
              <p className="text-lg font-mono text-black font-semibold">
                {hrAdmin.invitation_code}
              </p>
            </div>
          ) : (
            <p className="text-sm mb-3" style={{ color: '#595959' }}>
              No invitation code generated yet.
            </p>
          )}
          <button
            onClick={openInviteModal}
            disabled={!hrAdmin?.invitation_code}
            className="w-full px-3 py-2 border-2 text-sm font-medium rounded-lg text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: !hrAdmin?.invitation_code ? '#d1d5db' : '#E54747',
              borderColor: !hrAdmin?.invitation_code ? '#d1d5db' : '#E54747'
            }}
          >
            Invite Candidate
          </button>
        </div>

        {/* Fair Chance Ordinance Toolkit Box */}
        <div className="bg-white border rounded-xl p-4 w-80" style={{ borderColor: '#E5E5E5' }}>
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-black mb-2">
              San Diego County Fair Chance Ordinance Hiring Toolkit
            </h3>
          </div>
          <div className="p-3 rounded-xl mb-3" style={{ backgroundColor: '#F0F9FF' }}>
            <div className="flex items-center gap-2 mb-2">
              <svg className="h-4 w-4" style={{ color: '#1E40AF' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs font-medium" style={{ color: '#1E40AF' }}>
                Official OLSE Resources
              </span>
            </div>
            <p className="text-xs" style={{ color: '#1E40AF' }}>
              Sample forms, compliance checklists, and legal requirements for San Diego County employers.
            </p>
          </div>
          <a
            href="https://www.sandiegocounty.gov/content/sdc/OLSE/fair-chance.html"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-3 py-2 border-2 text-sm font-medium rounded-lg text-white transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-2"
            style={{
              backgroundColor: '#1E40AF',
              borderColor: '#1E40AF'
            }}
          >
            View Resources
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Assessment Metrics */}
      <AssessmentMetrics
        users={permittedUsers}
        sentInvites={sentInvites}
        onViewAssessment={(candidateId) => router.push(`/hr-admin/dashboard/${candidateId}/assessment`)}
        onReinviteCandidate={handleReinviteCandidate}
      />


      {/* Users Table */}
      <div className="bg-white border rounded-xl p-6" style={{ borderColor: '#E5E5E5' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black">
            Your Candidates
          </h2>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5" style={{ color: '#9CA3AF' }} fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, email, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-80 pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
              style={{
                fontFamily: 'Poppins, sans-serif',
                borderColor: '#E5E5E5'
              }}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: '#E5E5E5' }}>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black uppercase tracking-wider">
                  Candidate Response Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black uppercase tracking-wider">
                  Final Decision
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black uppercase tracking-wider">
                  Access Granted
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black uppercase tracking-wider">
                  Compliance Steps
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b" style={{ borderColor: '#F3F4F6' }}>
                  <td className="px-6 py-4 whitespace-nowrap text-black font-medium">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#595959' }}>
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${user.rr_completed
                        ? "text-green-800"
                        : "text-yellow-800"
                        }`}
                      style={{
                        backgroundColor: user.rr_completed ? '#F0FDF4' : '#FFFBEB',
                        border: user.rr_completed ? '1px solid #BBF7D0' : '1px solid #FDE68A'
                      }}
                    >
                      {user.rr_completed ? "Completed" : "In Progress"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {user.final_decision || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#595959' }}>
                    {user.granted_at
                      ? new Date(user.granted_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-3">
                    <button
                      onClick={() => viewUserProfile(user.id)}
                      className="text-sm font-medium underline transition-all duration-200 hover:opacity-90"
                      style={{ color: '#595959' }}
                    >
                      View Profile
                    </button>
                    {(() => {
                      const currentStepIdx = getCurrentAssessmentStep(user);
                      if (user.final_decision) {
                        return (
                          <button
                            onClick={() => startAssessment(user.id)}
                            className="px-3 py-2 border text-sm font-medium rounded-lg transition-all duration-200 hover:opacity-90"
                            style={{
                              color: '#1E40AF',
                              borderColor: '#DBEAFE',
                              backgroundColor: '#F0F9FF'
                            }}
                          >
                            View Assessment
                          </button>
                        );
                      } else if (currentStepIdx > 0) {
                        return (
                          <button
                            onClick={() => startAssessment(user.id)}
                            className="px-3 py-2 border-2 text-sm font-medium rounded-lg text-white transition-all duration-200 hover:opacity-90"
                            style={{
                              backgroundColor: '#E54747',
                              borderColor: '#E54747'
                            }}
                          >
                            Continue Assessment
                          </button>
                        );
                      } else {
                        return (
                          <button
                            onClick={() => startAssessment(user.id)}
                            className="px-3 py-2 border-2 text-sm font-medium rounded-lg text-white transition-all duration-200 hover:opacity-90"
                            style={{
                              backgroundColor: '#E54747',
                              borderColor: '#E54747'
                            }}
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
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center"
                    style={{ color: '#595959' }}
                  >
                    {permittedUsers.length === 0
                      ? "No users have granted you access yet. Share your invitation code with users to get started."
                      : `No users match "${searchQuery}". Try adjusting your search terms.`
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Candidate Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b" style={{ borderColor: '#E5E5E5' }}>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-black">
                  Invite Candidate to Create Restorative Record
                </h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="transition-all duration-200 hover:opacity-90"
                  style={{ color: '#595959' }}
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
                  <label htmlFor="candidateName" className="block text-sm font-medium text-black mb-2">
                    Candidate Name
                  </label>
                  <input
                    type="text"
                    id="candidateName"
                    required
                    className="w-full px-4 py-3 border text-base rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                      borderColor: '#E5E5E5',
                      color: '#000000',
                      backgroundColor: '#FFFFFF'
                    }}
                    value={inviteForm.candidateName}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setInviteForm(prev => ({
                        ...prev,
                        candidateName: newName,
                        customMessage: originalMessageTemplate.replace(/\[Candidate Name\]/g, newName || '[Candidate Name]')
                      }));
                    }}
                    placeholder="Enter candidate's full name"
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

                {/* Candidate Email */}
                <div>
                  <label htmlFor="candidateEmail" className="block text-sm font-medium text-black mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="candidateEmail"
                    required
                    className="w-full px-4 py-3 border text-base rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                      borderColor: '#E5E5E5',
                      color: '#000000',
                      backgroundColor: '#FFFFFF'
                    }}
                    value={inviteForm.candidateEmail}
                    onChange={(e) => setInviteForm({ ...inviteForm, candidateEmail: e.target.value })}
                    placeholder="candidate@example.com"
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

                {/* Candidate Phone */}
                <div>
                  <label htmlFor="candidatePhone" className="block text-sm font-medium text-black mb-2">
                    Phone Number <span style={{ color: '#595959' }}>(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    id="candidatePhone"
                    className="w-full px-4 py-3 border text-base rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                      borderColor: '#E5E5E5',
                      color: '#000000',
                      backgroundColor: '#FFFFFF'
                    }}
                    value={inviteForm.candidatePhone}
                    onChange={(e) => setInviteForm({ ...inviteForm, candidatePhone: e.target.value })}
                    placeholder="(555) 123-4567"
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

                {/* Custom Message */}
                <div className="sm:col-span-2">
                  <label htmlFor="customMessage" className="block text-sm font-medium text-black mb-2">
                    Message
                  </label>
                  <textarea
                    id="customMessage"
                    rows={10}
                    className="w-full px-4 py-3 border text-base rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                      borderColor: '#E5E5E5',
                      color: '#000000',
                      backgroundColor: '#FFFFFF'
                    }}
                    value={inviteForm.customMessage}
                    onChange={(e) => setInviteForm({ ...inviteForm, customMessage: e.target.value })}
                    placeholder="Customize your invitation message..."
                    onFocus={(e) => {
                      e.target.style.borderColor = '#E54747';
                      e.target.style.boxShadow = '0 0 0 2px rgba(229, 71, 71, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E5E5';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <p className="mt-2 text-sm" style={{ color: '#595959' }}>
                    This message will be sent to the candidate along with instructions for creating their Restorative Record.
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t" style={{ borderColor: '#E5E5E5' }}>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border text-base font-medium rounded-xl transition-all duration-200 hover:opacity-90"
                  style={{
                    color: '#595959',
                    borderColor: '#E5E5E5',
                    backgroundColor: 'transparent'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingInvite || !inviteForm.candidateName || !inviteForm.candidateEmail}
                  className="px-4 py-2 border-2 text-base font-medium rounded-xl text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: (sendingInvite || !inviteForm.candidateName || !inviteForm.candidateEmail) ? '#d1d5db' : '#E54747',
                    borderColor: (sendingInvite || !inviteForm.candidateName || !inviteForm.candidateEmail) ? '#d1d5db' : '#E54747'
                  }}
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
