"use client";

export default function ToolkitResourcesCard() {
  return (
    <div className="bg-white border rounded-xl p-4 w-80" style={{ borderColor: "#E5E5E5" }}>
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-black mb-2">San Diego County Fair Chance Ordinance Hiring Toolkit</h3>
      </div>
      <div className="p-3 rounded-xl mb-3" style={{ backgroundColor: "#F0F9FF" }}>
        <div className="flex items-center gap-2 mb-2">
          <svg className="h-4 w-4" style={{ color: "#1E40AF" }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-xs font-medium" style={{ color: "#1E40AF" }}>Official OLSE Resources</span>
        </div>
        <p className="text-xs" style={{ color: "#1E40AF" }}>
          Sample forms, compliance checklists, and legal requirements for San Diego County employers.
        </p>
      </div>
      <a
        href="https://www.sandiegocounty.gov/content/sdc/OLSE/fair-chance.html"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full px-3 py-2 border-2 text-sm font-medium rounded-lg text-white transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-2"
        style={{ backgroundColor: "#1E40AF", borderColor: "#1E40AF" }}
      >
        View Resources
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  );
}
