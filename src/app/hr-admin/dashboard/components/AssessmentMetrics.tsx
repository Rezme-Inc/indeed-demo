"use client";

import { useState } from 'react';
import { Send, Clock, CheckCircle, X, User, Mail, Calendar, ArrowRight } from 'lucide-react';

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

interface AssessmentMetricsProps {
  users: User[];
  sentInvites: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    dateSent: string;
    message: string;
    lastReinviteDate?: string;
    reinviteCount?: number;
  }>;
  onViewAssessment?: (candidateId: string) => void;
  onReinviteCandidate?: (candidateId: string) => void;
}

// Helper to get current assessment step index (0-based) from database
function getCurrentAssessmentStep(user: User): number {
  // Use assessment_status from database if available
  if (user.assessment_status?.current_step) {
    return user.assessment_status.current_step - 1; // Convert to 0-based index
  }

  // Fallback to localStorage for backward compatibility
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(`assessmentCurrentStep_${user.id}`);
    if (saved && !isNaN(Number(saved))) {
      return Number(saved) - 1; // localStorage is 1-based
    }
  }
  return 0;
}

export default function AssessmentMetrics({ users, sentInvites, onViewAssessment, onReinviteCandidate }: AssessmentMetricsProps) {
  const [selectedModal, setSelectedModal] = useState<'invites' | 'progress' | 'completed' | null>(null);
  const [loading, setLoading] = useState(false);

  // Get emails of users who have already granted access
  const grantedAccessEmails = new Set(users.map(user => user.email));

  // Filter sent invites to only show those that haven't granted access yet
  const pendingInvites = sentInvites.filter(invite => !grantedAccessEmails.has(invite.email));

  // Categorize users based on their actual status
  const inProgress = users.filter(user => {
    const currentStep = getCurrentAssessmentStep(user);
    // Users are in progress if:
    // 1. HR admin has started their assessment (step > 0), OR
    // 2. User has granted access but HR admin hasn't started assessment yet (step = 0)
    // AND they don't have a final decision yet
    return !user.final_decision && (currentStep > 0 || currentStep === 0);
  });

  const completed = users.filter(user => {
    const currentStep = getCurrentAssessmentStep(user);
    // Users are completed if:
    // 1. HR admin has made a final decision, OR
    // 2. Assessment has reached the final step (step 6)
    return user.final_decision || currentStep === 5; // step 5 = index for step 6 (all steps completed)
  });

  const handleCardClick = (type: 'invites' | 'progress' | 'completed') => {
    setSelectedModal(type);
  };

  const handleReinvite = async (candidateId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onReinviteCandidate?.(candidateId);
      console.log('Reinviting candidate:', candidateId);
    } catch (error) {
      console.error('Error reinviting candidate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAssessment = (candidateId: string) => {
    setSelectedModal(null);
    onViewAssessment?.(candidateId);
  };

  const closeModal = () => {
    setSelectedModal(null);
  };

  const getModalTitle = () => {
    switch (selectedModal) {
      case 'invites':
        return `Invites Sent - ${pendingInvites.length} candidates`;
      case 'progress':
        return `Assessments in Progress - ${inProgress.length} candidates`;
      case 'completed':
        return `Assessments Completed - ${completed.length} candidates`;
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysElapsed = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getCurrentStepName = (user: User) => {
    const stepIndex = getCurrentAssessmentStep(user);
    const steps = [
      'Not Started',
      'Conditional Job Offer',
      'Individualized Assessment',
      'Preliminary Job Offer Revocation',
      'Individual Reassessment',
      'Final Revocation Notice'
    ];
    return steps[stepIndex] || 'Unknown Step';
  };

  const getProgressPercentage = (user: User) => {
    const stepIndex = getCurrentAssessmentStep(user);
    return Math.round((stepIndex / 5) * 100);
  };

  const renderModalContent = () => {
    if (selectedModal === 'invites') {
      return (
        <div className="space-y-4">
          {pendingInvites.map((invite) => (
            <div key={invite.id} className="border rounded-xl p-4 hover:bg-gray-50 transition-all duration-200" style={{ borderColor: '#E5E5E5' }}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="h-5 w-5" style={{ color: '#595959' }} />
                    <h4 className="font-semibold text-black">{invite.name}</h4>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="h-4 w-4" style={{ color: '#9CA3AF' }} />
                    <span className="text-sm" style={{ color: '#595959' }}>{invite.email}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4" style={{ color: '#9CA3AF' }} />
                    <span className="text-sm" style={{ color: '#595959' }}>
                      Invited {formatDate(invite.dateSent)} ({getDaysElapsed(invite.dateSent)} days ago)
                      {invite.reinviteCount && invite.reinviteCount > 0 && (
                        <span className="ml-2 text-xs" style={{ color: '#F59E0B' }}>
                          • Reinvited {invite.reinviteCount} time{invite.reinviteCount > 1 ? 's' : ''}
                          {invite.lastReinviteDate && ` (last: ${formatDate(invite.lastReinviteDate)})`}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0 ml-4">
                  <button
                    onClick={() => handleReinvite(invite.id)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                    style={{
                      backgroundColor: '#3B82F6',
                      color: '#FFFFFF'
                    }}
                  >
                    <Send className="h-4 w-4" />
                    {loading ? 'Sending...' : (invite.reinviteCount && invite.reinviteCount > 0 ? 'Send Again' : 'Reinvite')}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {pendingInvites.length === 0 && (
            <div className="text-center py-8" style={{ color: '#9CA3AF' }}>
              <p>No pending invites.</p>
            </div>
          )}
        </div>
      );
    }

    // Handle progress and completed users
    let candidates: User[] = [];

    switch (selectedModal) {
      case 'progress':
        candidates = inProgress;
        break;
      case 'completed':
        candidates = completed;
        break;
      default:
        return null;
    }

    return (
      <div className="space-y-4">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="border rounded-xl p-4 hover:bg-gray-50 transition-all duration-200" style={{ borderColor: '#E5E5E5' }}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <User className="h-5 w-5" style={{ color: '#595959' }} />
                  <h4 className="font-semibold text-black">{candidate.first_name} {candidate.last_name}</h4>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <Mail className="h-4 w-4" style={{ color: '#9CA3AF' }} />
                  <span className="text-sm" style={{ color: '#595959' }}>{candidate.email}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4" style={{ color: '#9CA3AF' }} />
                  <span className="text-sm" style={{ color: '#595959' }}>
                    {candidate.granted_at && (
                      <>
                        {selectedModal === 'progress' &&
                          `Started ${formatDate(candidate.granted_at)} (${getDaysElapsed(candidate.granted_at)} days ago)`
                        }
                        {selectedModal === 'completed' &&
                          `Access granted ${formatDate(candidate.granted_at)} (${getDaysElapsed(candidate.granted_at)} days ago)`
                        }
                      </>
                    )}
                  </span>
                </div>

                {selectedModal === 'progress' && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium" style={{ color: '#595959' }}>
                        Current Step: {getCurrentStepName(candidate)}
                      </span>
                      <span className="text-xs font-medium" style={{ color: '#595959' }}>
                        {getProgressPercentage(candidate)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: '#F59E0B',
                          width: `${getProgressPercentage(candidate)}%`
                        }}
                      />
                    </div>
                  </div>
                )}

                {selectedModal === 'completed' && candidate.final_decision && (
                  <div className="mt-2">
                    <span
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: candidate.final_decision === 'Hired' ? '#F0FDF4' : '#FEF2F2',
                        color: candidate.final_decision === 'Hired' ? '#166534' : '#DC2626',
                        border: `1px solid ${candidate.final_decision === 'Hired' ? '#BBF7D0' : '#FECACA'}`
                      }}
                    >
                      {candidate.final_decision}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 ml-4">
                {selectedModal === 'progress' && (
                  <button
                    onClick={() => handleViewAssessment(candidate.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 hover:opacity-90"
                    style={{
                      backgroundColor: '#E54747',
                      color: '#FFFFFF'
                    }}
                  >
                    <ArrowRight className="h-4 w-4" />
                    Continue Assessment
                  </button>
                )}

                {selectedModal === 'completed' && (
                  <button
                    onClick={() => handleViewAssessment(candidate.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 hover:opacity-90"
                    style={{
                      color: '#1E40AF',
                      borderColor: '#DBEAFE',
                      backgroundColor: '#F0F9FF'
                    }}
                  >
                    <ArrowRight className="h-4 w-4" />
                    View Results
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {candidates.length === 0 && (
          <div className="text-center py-8" style={{ color: '#9CA3AF' }}>
            <p>No candidates in this category.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Metrics Cards */}
      <div className="bg-white border rounded-xl p-6 mb-6" style={{ borderColor: '#E5E5E5' }}>
        <h2 className="text-xl font-semibold text-black mb-4">Assessment Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Invites Sent Card */}
          <div
            onClick={() => handleCardClick('invites')}
            className="border rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-blue-300 group"
            style={{ borderColor: '#E5E5E5' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: '#595959' }}>Invites Sent</p>
                <p className="text-3xl font-bold" style={{ color: '#3B82F6' }}>
                  {pendingInvites.length}
                </p>
                <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                  Awaiting response
                </p>
              </div>
              <div className="flex-shrink-0">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                  style={{ backgroundColor: '#EFF6FF' }}
                >
                  <Send className="h-6 w-6" style={{ color: '#3B82F6' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Assessments in Progress Card */}
          <div
            onClick={() => handleCardClick('progress')}
            className="border rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-yellow-300 group"
            style={{ borderColor: '#E5E5E5' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: '#595959' }}>In Progress</p>
                <p className="text-3xl font-bold" style={{ color: '#F59E0B' }}>
                  {inProgress.length}
                </p>
                <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                  Active assessments
                </p>
              </div>
              <div className="flex-shrink-0">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                  style={{ backgroundColor: '#FFFBEB' }}
                >
                  <Clock className="h-6 w-6" style={{ color: '#F59E0B' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Assessments Completed Card */}
          <div
            onClick={() => handleCardClick('completed')}
            className="border rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-green-300 group"
            style={{ borderColor: '#E5E5E5' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: '#595959' }}>Completed</p>
                <p className="text-3xl font-bold" style={{ color: '#10B981' }}>
                  {completed.length}
                </p>
                <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                  Ready for review
                </p>
              </div>
              <div className="flex-shrink-0">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                  style={{ backgroundColor: '#F0FDF4' }}
                >
                  <CheckCircle className="h-6 w-6" style={{ color: '#10B981' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#E5E5E5' }}>
              <h3 className="text-xl font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {getModalTitle()}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                style={{ color: '#595959' }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {renderModalContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 
