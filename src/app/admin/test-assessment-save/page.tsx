"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AssessmentRecord {
  id: string;
  hr_admin_id: string;
  candidate_id: string;
  assessment_data: any;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  status: string;
}

export default function TestAssessmentSave() {
  const [records, setRecords] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<AssessmentRecord | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchAssessmentRecords();
  }, []);

  const fetchAssessmentRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("No session found - please log in");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("assessment_records")
        .select("*")
        .order("updated_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setRecords(data || []);
    } catch (err) {
      console.error("Error fetching records:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div
      className="min-h-screen bg-gray-50 p-8"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-black">
              Assessment Records Test
            </h1>
            <button
              onClick={() => router.push("/hr-admin/dashboard")}
              className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No assessment records found. Start an assessment to see data
                here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 cursor-pointer transition-all"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">
                          Candidate ID
                        </span>
                        <p className="font-medium text-sm">
                          {record.candidate_id.slice(0, 8)}...
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Status</span>
                        <p
                          className={`font-medium text-sm ${
                            record.status === "completed"
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {record.status}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">
                          Current Step
                        </span>
                        <p className="font-medium text-sm">
                          {record.assessment_data?.currentStep || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">
                          Last Updated
                        </span>
                        <p className="font-medium text-sm">
                          {formatDate(record.updated_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Record Details */}
        {selectedRecord && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Assessment Details</h2>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Record ID</span>
                  <p className="font-mono text-sm">{selectedRecord.id}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">HR Admin ID</span>
                  <p className="font-mono text-sm">
                    {selectedRecord.hr_admin_id}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Created At</span>
                  <p className="text-sm">
                    {formatDate(selectedRecord.created_at)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Completed At</span>
                  <p className="text-sm">
                    {selectedRecord.completed_at
                      ? formatDate(selectedRecord.completed_at)
                      : "Not completed"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Assessment Data</h3>
                <div className="bg-gray-50 rounded-xl p-4 overflow-auto max-h-96">
                  <pre className="text-xs">
                    {JSON.stringify(selectedRecord.assessment_data, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900">Answers</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {
                      Object.keys(selectedRecord.assessment_data?.answers || {})
                        .length
                    }
                  </p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-semibold text-green-900">Forms Saved</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {
                      [
                        selectedRecord.assessment_data?.offerLetter,
                        selectedRecord.assessment_data?.assessment,
                        selectedRecord.assessment_data?.revocationNotice,
                        selectedRecord.assessment_data?.reassessment,
                        selectedRecord.assessment_data?.finalRevocationNotice,
                      ].filter(Boolean).length
                    }
                  </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <h4 className="font-semibold text-purple-900">Documents</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {
                      Object.values(
                        selectedRecord.assessment_data?.documents || {}
                      ).filter(Boolean).length
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
