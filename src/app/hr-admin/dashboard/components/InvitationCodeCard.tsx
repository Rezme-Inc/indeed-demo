"use client";

interface InvitationCodeCardProps {
  invitationCode?: string | null;
  onGenerate: () => void;
  onInvite: () => void;
}

export default function InvitationCodeCard({ invitationCode, onGenerate, onInvite }: InvitationCodeCardProps) {
  return (
    <div className="bg-white border rounded-xl p-4 w-80" style={{ borderColor: "#E5E5E5" }}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-black">Invitation Code</h3>
        <button
          onClick={onGenerate}
          className="px-3 py-1 border text-sm font-medium rounded-lg transition-all duration-200 hover:opacity-90"
          style={{ color: "#595959", borderColor: "#E5E5E5", backgroundColor: "transparent" }}
        >
          Generate New Code
        </button>
      </div>
      {invitationCode ? (
        <div className="p-3 rounded-xl mb-3" style={{ backgroundColor: "#F8F9FA" }}>
          <p className="text-xs mb-1" style={{ color: "#595959" }}>
            Share this securecode with candidates to connect with them on Rézme:
          </p>
          <p className="text-lg font-mono text-black font-semibold">{invitationCode}</p>
        </div>
      ) : (
        <p className="text-sm mb-3" style={{ color: "#595959" }}>No invitation code generated yet.</p>
      )}
      <button
        onClick={onInvite}
        disabled={!invitationCode}
        className="w-full px-3 py-2 border-2 text-sm font-medium rounded-lg text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: !invitationCode ? "#d1d5db" : "#E54747", borderColor: !invitationCode ? "#d1d5db" : "#E54747" }}
      >
        Invite Candidate
      </button>
    </div>
  );
}
