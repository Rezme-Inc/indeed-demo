"use client";

interface InviteForm {
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  customMessage: string;
}

interface InviteCandidateModalProps {
  show: boolean;
  inviteForm: InviteForm;
  setInviteForm: (form: InviteForm) => void;
  originalMessageTemplate: string;
  sendingInvite: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function InviteCandidateModal({
  show,
  inviteForm,
  setInviteForm,
  originalMessageTemplate,
  sendingInvite,
  onClose,
  onSubmit,
}: InviteCandidateModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b" style={{ borderColor: "#E5E5E5" }}>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-black">Invite Candidate to Create Restorative Record</h3>
            <button onClick={onClose} className="transition-all duration-200 hover:opacity-90" style={{ color: "#595959" }}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="candidateName" className="block text-sm font-medium text-black mb-2">
                Candidate Name
              </label>
              <input
                type="text"
                id="candidateName"
                required
                className="w-full px-4 py-3 border text-base rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ borderColor: "#E5E5E5", color: "#000000", backgroundColor: "#FFFFFF" }}
                value={inviteForm.candidateName}
                onChange={(e) => {
                  const newName = e.target.value;
                  setInviteForm({
                    ...inviteForm,
                    candidateName: newName,
                    customMessage: originalMessageTemplate.replace(/\[Candidate Name\]/g, newName || "[Candidate Name]")
                  });
                }}
                placeholder="Enter candidate's full name"
                onFocus={(e) => {
                  e.target.style.borderColor = "#E54747";
                  e.target.style.boxShadow = "0 0 0 2px rgba(229, 71, 71, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E5E5E5";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <label htmlFor="candidateEmail" className="block text-sm font-medium text-black mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="candidateEmail"
                required
                className="w-full px-4 py-3 border text-base rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ borderColor: "#E5E5E5", color: "#000000", backgroundColor: "#FFFFFF" }}
                value={inviteForm.candidateEmail}
                onChange={(e) => setInviteForm({ ...inviteForm, candidateEmail: e.target.value })}
                placeholder="candidate@example.com"
                onFocus={(e) => {
                  e.target.style.borderColor = "#E54747";
                  e.target.style.boxShadow = "0 0 0 2px rgba(229, 71, 71, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E5E5E5";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <label htmlFor="candidatePhone" className="block text-sm font-medium text-black mb-2">
                Phone Number <span style={{ color: "#595959" }}>(Optional)</span>
              </label>
              <input
                type="tel"
                id="candidatePhone"
                className="w-full px-4 py-3 border text-base rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ borderColor: "#E5E5E5", color: "#000000", backgroundColor: "#FFFFFF" }}
                value={inviteForm.candidatePhone}
                onChange={(e) => setInviteForm({ ...inviteForm, candidatePhone: e.target.value })}
                placeholder="(555) 123-4567"
                onFocus={(e) => {
                  e.target.style.borderColor = "#E54747";
                  e.target.style.boxShadow = "0 0 0 2px rgba(229, 71, 71, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E5E5E5";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="customMessage" className="block text-sm font-medium text-black mb-2">
                Message
              </label>
              <textarea
                id="customMessage"
                rows={10}
                className="w-full px-4 py-3 border text-base rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ borderColor: "#E5E5E5", color: "#000000", backgroundColor: "#FFFFFF" }}
                value={inviteForm.customMessage}
                onChange={(e) => setInviteForm({ ...inviteForm, customMessage: e.target.value })}
                placeholder="Customize your invitation message..."
                onFocus={(e) => {
                  e.target.style.borderColor = "#E54747";
                  e.target.style.boxShadow = "0 0 0 2px rgba(229, 71, 71, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E5E5E5";
                  e.target.style.boxShadow = "none";
                }}
              />
              <p className="mt-2 text-sm" style={{ color: "#595959" }}>
                This message will be sent to the candidate along with instructions for creating their Restorative Record.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t" style={{ borderColor: "#E5E5E5" }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border text-base font-medium rounded-xl transition-all duration-200 hover:opacity-90"
              style={{ color: "#595959", borderColor: "#E5E5E5", backgroundColor: "transparent" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sendingInvite || !inviteForm.candidateName || !inviteForm.candidateEmail}
              className="px-4 py-2 border-2 text-base font-medium rounded-xl text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: sendingInvite || !inviteForm.candidateName || !inviteForm.candidateEmail ? "#d1d5db" : "#E54747",
                borderColor: sendingInvite || !inviteForm.candidateName || !inviteForm.candidateEmail ? "#d1d5db" : "#E54747",
              }}
            >
              {sendingInvite ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
