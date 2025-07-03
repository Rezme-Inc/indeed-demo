"use client";
import { useState } from "react";
import CandidateRow from "./CandidateRow";

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

interface CandidateTableProps {
  users: User[];
  onViewProfile: (id: string) => void;
  onStartAssessment: (id: string) => void;
}

export default function CandidateTable({ users, onViewProfile, onStartAssessment }: CandidateTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const email = user.email.toLowerCase();
    const status = user.rr_completed ? "completed" : "in progress";
    const finalDecision = (user.final_decision || "").toLowerCase();
    return (
      fullName.includes(query) ||
      email.includes(query) ||
      status.includes(query) ||
      finalDecision.includes(query)
    );
  });

  return (
    <div className="bg-white border rounded-xl p-6" style={{ borderColor: "#E5E5E5" }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-black">Your Candidates</h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5" style={{ color: "#9CA3AF" }} fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, email, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-80 pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
            style={{ fontFamily: "Poppins, sans-serif", borderColor: "#E5E5E5" }}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: "#E5E5E5" }}>
              <th className="px-6 py-4 text-left text-sm font-semibold text-black uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-black uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-black uppercase tracking-wider">Candidate Response Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-black uppercase tracking-wider">Final Decision</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-black uppercase tracking-wider">Access Granted</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-black uppercase tracking-wider">Actions</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-black uppercase tracking-wider">Compliance Steps</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <CandidateRow key={user.id} user={user} onViewProfile={onViewProfile} onStartAssessment={onStartAssessment} />
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center" style={{ color: "#595959" }}>
                  {users.length === 0
                    ? "No users have granted you access yet. Share your invitation code with users to get started."
                    : `No users match "${searchQuery}". Try adjusting your search terms.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
