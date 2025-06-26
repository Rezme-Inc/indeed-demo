import React from 'react';
import Link from 'next/link';

export default function FinalRevocationSuccess() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <div className="bg-white rounded-2xl shadow-lg p-12 max-w-2xl w-full flex flex-col items-center">
        <div className="rounded-full bg-green-100 p-6 mb-6">
          <svg className="h-16 w-16 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-3xl font-bold text-center mb-4">Final Revocation Notice Sent</h1>
        <p className="text-lg text-gray-600 text-center mb-8">
          The final decision notice has been sent to the candidate. This completes the Fair Chance hiring process.
        </p>
        <Link href="/hr-admin/dashboard">
          <button className="px-8 py-4 rounded-lg text-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 mb-8">
            Return to Dashboard
          </button>
        </Link>
        <div className="w-full border-t border-gray-200 pt-8 flex flex-col items-center">
          <div className="flex flex-row items-center gap-8 text-blue-900 text-lg font-semibold">
            <div className="flex items-center gap-2">
              <svg className="h-6 w-6 text-blue-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0zm-4 4v4m0-4a4 4 0 100-8 4 4 0 000 8z" /></svg>
              OLSE@sdcounty.ca.gov
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-6 w-6 text-blue-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8m-4-4v8" /></svg>
              <a href="https://www.sandiegocounty.gov/OLSE.html" className="underline">https://www.sandiegocounty.gov/OLSE.html</a>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-6 w-6 text-blue-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.6 19h8.8a2 2 0 001.95-2.3L17 13M7 13l1.5-6h7l1.5 6" /></svg>
              619-531-5129
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 