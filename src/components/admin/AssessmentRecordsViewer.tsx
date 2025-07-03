"use client";

import { assessmentTracking } from "@/lib/services/assessmentTracking";
import { supabase } from "@/lib/supabase";
import {
  Building,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Search,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

interface AssessmentRecord {
  session: any;
  steps: any[];
  documents: any[];
  auditLog: any[];
}

interface AssessmentRecordsViewerProps {
  hrAdminId?: string;
  candidateId?: string;
}

export default function AssessmentRecordsViewer({
  hrAdminId,
  candidateId,
}: AssessmentRecordsViewerProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [assessmentRecord, setAssessmentRecord] =
    useState<AssessmentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    steps: true,
    documents: true,
    auditLog: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "hired" | "revoked" | "in_progress"
  >("all");

  // Fetch assessment sessions
  useEffect(() => {
    fetchSessions();
  }, [hrAdminId, candidateId]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("assessment_sessions")
        .select(
          `
          *,
          hr_admin:hr_admin_profiles(first_name, last_name, company),
          candidate:user_profiles(first_name, last_name, email)
        `
        )
        .order("created_at", { ascending: false });

      if (hrAdminId) {
        query = query.eq("hr_admin_id", hrAdminId);
      }
      if (candidateId) {
        query = query.eq("candidate_id", candidateId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch detailed assessment record
  const fetchAssessmentRecord = async (sessionId: string) => {
    try {
      const record = await assessmentTracking.getAssessmentRecord(sessionId);
      setAssessmentRecord(record);
    } catch (error) {
      console.error("Error fetching assessment record:", error);
    }
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Filter sessions based on search and status
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      searchTerm === "" ||
      session.candidate?.first_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      session.candidate?.last_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      session.candidate?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      session.hr_admin?.first_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      session.hr_admin?.last_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || session.final_decision === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Export assessment record
  const exportAssessmentRecord = async () => {
    if (!assessmentRecord) return;

    const exportData = {
      session: assessmentRecord.session,
      steps: assessmentRecord.steps,
      documents: assessmentRecord.documents,
      auditLog: assessmentRecord.auditLog,
      exportedAt: new Date().toISOString(),
      exportedBy: "Rezme Admin",
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `assessment_${selectedSession}_${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "hired":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Hired
          </span>
        );
      case "revoked":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Revoked
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Assessment Records
        </h2>
        {selectedSession && assessmentRecord && (
          <button
            onClick={exportAssessmentRecord}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Record
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by candidate or HR admin name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
            style={{ fontFamily: "Poppins, sans-serif" }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          <option value="all">All Status</option>
          <option value="hired">Hired</option>
          <option value="revoked">Revoked</option>
          <option value="in_progress">In Progress</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3
                className="text-lg font-medium text-gray-900"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Assessment Sessions ({filteredSessions.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {filteredSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => {
                    setSelectedSession(session.id);
                    fetchAssessmentRecord(session.id);
                  }}
                  className={`w-full text-left px-4 py-4 hover:bg-gray-50 transition-colors ${
                    selectedSession === session.id ? "bg-red-50" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium text-gray-900">
                      {session.candidate?.first_name}{" "}
                      {session.candidate?.last_name}
                    </div>
                    {getStatusBadge(session.final_decision)}
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {session.hr_admin?.first_name}{" "}
                      {session.hr_admin?.last_name}
                    </div>
                    <div className="flex items-center">
                      <Building className="w-3 h-3 mr-1" />
                      {session.hr_admin?.company}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(session.created_at)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Assessment Details */}
        <div className="lg:col-span-2">
          {selectedSession && assessmentRecord ? (
            <div className="space-y-6">
              {/* Session Info */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3
                  className="text-lg font-medium text-gray-900 mb-4"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Session Information
                </h3>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Candidate
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {assessmentRecord.session.candidate?.first_name}{" "}
                      {assessmentRecord.session.candidate?.last_name}
                      <br />
                      <span className="text-gray-500">
                        {assessmentRecord.session.candidate?.email}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      HR Admin
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {assessmentRecord.session.hr_admin?.first_name}{" "}
                      {assessmentRecord.session.hr_admin?.last_name}
                      <br />
                      <span className="text-gray-500">
                        {assessmentRecord.session.hr_admin?.company}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Started
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(assessmentRecord.session.started_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Status
                    </dt>
                    <dd className="mt-1">
                      {getStatusBadge(assessmentRecord.session.final_decision)}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Assessment Steps */}
              <div className="bg-white shadow rounded-lg">
                <button
                  onClick={() => toggleSection("steps")}
                  className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <h3
                    className="text-lg font-medium text-gray-900"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Assessment Steps ({assessmentRecord.steps.length})
                  </h3>
                  {expandedSections.steps ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.steps && (
                  <div className="px-6 pb-4">
                    <div className="space-y-3">
                      {assessmentRecord.steps.map((step, index) => (
                        <div
                          key={step.id}
                          className="border-l-4 border-gray-200 pl-4 py-2"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Step {step.step_number}: {step.question_id}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                Answer:{" "}
                                <span className="font-medium">
                                  {step.answer}
                                </span>
                              </p>
                              {step.notes && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Notes: {step.notes}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">
                              {formatDate(step.created_at)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Documents */}
              <div className="bg-white shadow rounded-lg">
                <button
                  onClick={() => toggleSection("documents")}
                  className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <h3
                    className="text-lg font-medium text-gray-900"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Documents ({assessmentRecord.documents.length})
                  </h3>
                  {expandedSections.documents ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.documents && (
                  <div className="px-6 pb-4">
                    <div className="space-y-3">
                      {assessmentRecord.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="border rounded-lg p-4 hover:bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FileText className="w-5 h-5 text-gray-400 mr-3" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {doc.document_type
                                    .replace(/_/g, " ")
                                    .toUpperCase()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Created: {formatDate(doc.created_at)}
                                  {doc.sent_at &&
                                    ` • Sent: ${formatDate(doc.sent_at)}`}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const blob = new Blob(
                                  [JSON.stringify(doc.document_data, null, 2)],
                                  { type: "application/json" }
                                );
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.href = url;
                                link.download = `${doc.document_type}_${doc.id}.json`;
                                link.click();
                                URL.revokeObjectURL(url);
                              }}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Audit Log */}
              <div className="bg-white shadow rounded-lg">
                <button
                  onClick={() => toggleSection("auditLog")}
                  className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <h3
                    className="text-lg font-medium text-gray-900"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Audit Log ({assessmentRecord.auditLog.length})
                  </h3>
                  {expandedSections.auditLog ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.auditLog && (
                  <div className="px-6 pb-4 max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {assessmentRecord.auditLog.map((log) => (
                        <div
                          key={log.id}
                          className="text-sm border-l-2 border-gray-200 pl-3 py-1"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-medium text-gray-900">
                                {log.action}
                              </span>
                              {log.details &&
                                Object.keys(log.details).length > 0 && (
                                  <span className="text-gray-500 ml-2">
                                    {JSON.stringify(log.details)}
                                  </span>
                                )}
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                              {formatDate(log.created_at)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No session selected
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Select an assessment session from the list to view details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
