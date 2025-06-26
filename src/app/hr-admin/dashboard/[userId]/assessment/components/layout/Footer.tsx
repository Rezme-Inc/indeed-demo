import React from "react";

const Footer: React.FC = () => (
  <footer className="bg-white border-t border-gray-200 py-12 mt-16">
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          <div className="text-black font-bold text-2xl mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>
            réz<span style={{ color: "#E54747" }}>me</span>.
          </div>
          <p className="text-sm leading-relaxed" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
            Automating Fair Chance Hiring
            <br />
            compliance for modern HR teams.
          </p>
        </div>
        <div className="lg:col-span-2">
          <p className="text-sm leading-relaxed" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
            Rézme provides compliance support tools, not legal advice. Use of this site or platform does not create an attorney-client relationship. Employers retain full responsibility for final hiring decisions and for compliance with applicable laws. Rézme is not a Consumer Reporting Agency and does not furnish consumer reports under the Fair Credit Reporting Act. While our software assists clients in documenting individualized assessments and related compliance steps, Rézme's role is limited to producing records created within our system in the event of an audit. All data sources, partner integrations, and outputs are provided "as-is," without warranty of completeness or accuracy. Tax credit calculations are estimates only and do not guarantee financial outcomes. By using this site, you agree to our Terms of Service, including limitations of liability, indemnification provisions, and governing law clauses.
          </p>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-gray-200 text-center">
        <p className="text-sm" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
          © 2024 Rézme. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
