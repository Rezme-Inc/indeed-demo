"use client";
import { getCurrentAssessmentStep } from "@/utils/invitation";
import ComplianceStepDisplay from "./ComplianceStepDisplay";

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

interface CandidateRowProps {
  user: User;
  onViewProfile: (id: string) => void;
  onStartAssessment: (id: string) => void;
}

export default function CandidateRow({ user, onViewProfile, onStartAssessment }: CandidateRowProps) {
  // Use database assessment status if available, otherwise fall back to localStorage
  const currentStepIdx = user.assessment_status?.current_step
    ? user.assessment_status.current_step - 1  // Convert to 0-based index
    : getCurrentAssessmentStep(user);

  const renderActionButton = () => {
    if (user.final_decision) {
      return (
        <button
          onClick={() => onStartAssessment(user.id)}
          className="px-3 py-2 border text-sm font-medium rounded-lg transition-all duration-200 hover:opacity-90"
          style={{ color: "#1E40AF", borderColor: "#DBEAFE", backgroundColor: "#F0F9FF" }}
        >
          View Assessment
        </button>
      );
    } else if (currentStepIdx > 0) {
      return (
        <button
          onClick={() => onStartAssessment(user.id)}
          className="px-3 py-2 border-2 text-sm font-medium rounded-lg text-white transition-all duration-200 hover:opacity-90"
          style={{ backgroundColor: "#E54747", borderColor: "#E54747" }}
        >
          Continue Assessment
        </button>
      );
    } else {
      return (
        <button
          onClick={() => onStartAssessment(user.id)}
          className="px-3 py-2 border-2 text-sm font-medium rounded-lg text-white transition-all duration-200 hover:opacity-90"
          style={{ backgroundColor: "#E54747", borderColor: "#E54747" }}
        >
          Begin Assessment
        </button>
      );
    }
  };

  return (
    <tr className="border-b" style={{ borderColor: "#F3F4F6" }}>
      <td className="px-6 py-4 whitespace-nowrap text-black font-medium">
        {user.first_name} {user.last_name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap" style={{ color: "#595959" }}>
        {user.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${user.rr_completed ? "text-green-800" : "text-yellow-800"}`}
          style={{
            backgroundColor: user.rr_completed ? "#F0FDF4" : "#FFFBE8",
            border: user.rr_completed ? "1px solid #BBF7D0" : "1px solid #FDE68A",
          }}
        >
          {user.rr_completed ? "Completed" : "In Progress"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-black">{user.final_decision || "-"}</td>
      <td className="px-6 py-4 whitespace-nowrap" style={{ color: "#595959" }}>
        {user.granted_at ? new Date(user.granted_at).toLocaleDateString() : "N/A"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap space-x-3">
        <button
          onClick={() => onViewProfile(user.id)}
          className="text-sm font-medium underline transition-all duration-200 hover:opacity-90"
          style={{ color: "#595959" }}
        >
          View Profile
        </button>
        {renderActionButton()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <ComplianceStepDisplay user={user} />
      </td>
    </tr>
  );
}
