import React, { useEffect, useState, useCallback } from "react";
import { CheckCircle2, Info, FileText } from "lucide-react";
import CriticalInfoSection from "../../critical/CriticalInfoSection";
import IndividualizedReassessmentForm from "./IndividualizedReassessmentForm";
import ExtendSuccessModal from "../../common/ExtendSuccessModal";
import { useStep4Storage } from "@/hooks/useStep4Storage";
import { useStep4Actions } from "@/hooks/useStep4Actions";
import { useUniversalHireActions } from "@/hooks/useUniversalHireActions";
import { useAssessmentStorage } from "@/hooks/useAssessmentStorage";
import { useHRAdminProfile } from "@/hooks/useHRAdminProfile";
import { useAssessmentSteps } from "@/context/useAssessmentSteps";
import { useCandidateData } from "@/context/useCandidateData";
import { useCandidateDataFetchers } from "@/hooks/useCandidateDataFetchers";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AssessmentDatabaseService } from "@/lib/services/assessmentDatabase";

const Step4: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [activeTab, setActiveTab] = useState("Legal");
  const { currentStep, setCurrentStep } = useAssessmentSteps();
  const {
    savedHireDecision,
    setSavedHireDecision,
    setSavedPreliminaryDecision,
    setSavedReassessment,
  } = useAssessmentStorage(userId as string);
  const step4Storage = useStep4Storage(userId as string);
  const {
    showReassessmentSplit,
    setShowReassessmentSplit,
    showReassessmentInfoModal,
    setShowReassessmentInfoModal,
    reassessmentForm,
    setReassessmentForm,
    reassessmentPreview,
    setReassessmentPreview,
    reassessmentDecision,
    setReassessmentDecision,
    extendReason,
    setExtendReason,
    handleReassessmentFormChange,
  } = step4Storage;
  const [initialAssessmentResults, setInitialAssessmentResults] =
    useState<any>(null);
  const [businessDaysFromStep3, setBusinessDaysFromStep3] = useState<number | null>(null);
  const [isStep4CompletedFromDB, setIsStep4CompletedFromDB] = useState(false);
  const { hrAdmin } = useHRAdminProfile();
  const [showExtendSuccessModal, setShowExtendSuccessModal] = useState(false);
  const { proceedWithHire } = useUniversalHireActions(userId as string, {
    hrAdminProfile: hrAdmin,
    hrAdminId: hrAdmin?.id || null,
    trackingActive: false,
    assessmentSessionId: null,
    setSavedHireDecision,
    setShowExtendSuccessModal,
    currentStep,
  });

  const proceedWithReassessment = useCallback(() => {
    const reassessmentDecisionData = {
      decision: 'reassessment',
      decisionType: 'adverse_action',
      sentAt: new Date().toISOString(),
      candidateId: userId,
      hrAdminName: hrAdmin
        ? `${hrAdmin.first_name} ${hrAdmin.last_name}`
        : '',
      companyName: hrAdmin?.company || '',
    };

    setSavedPreliminaryDecision(reassessmentDecisionData);
    setShowReassessmentInfoModal(true);
  }, [userId, hrAdmin, setSavedPreliminaryDecision, setShowReassessmentInfoModal]);
  const { sendReassessment } = useStep4Actions(
    userId as string,
    step4Storage,
    {
      hrAdminProfile: hrAdmin,
      hrAdminId: hrAdmin?.id || null,
      trackingActive: false,
      assessmentSessionId: null,
      setSavedReassessment,
      setInitialAssessmentResults,
      setCurrentStep,
    },
  );

  // Wrapper function to handle send based on decision type
  const handleSendReassessment = useCallback(async () => {
    const { reassessmentDecision } = step4Storage;

    console.log('[Step4] Sending reassessment with decision:', reassessmentDecision);

    if (reassessmentDecision === 'extend') {
      // If extending offer, use universal hire hook
      console.log('[Step4] Extend offer selected, triggering universal hire flow');
      await proceedWithHire();
    } else {
      // If rescinding offer, use regular reassessment flow
      console.log('[Step4] Rescind offer selected, using regular reassessment flow');
      await sendReassessment();
    }
  }, [step4Storage, proceedWithHire, sendReassessment]);
  const { candidateShareToken, candidateProfile } = useCandidateData();
  const [loadingCandidateData, setLoadingCandidateData] = useState(false);
  const [restorativeData, setRestorativeData] = useState<any>(null);
  const { fetchCandidateShareToken } = useCandidateDataFetchers(
    userId as string,
    setLoadingCandidateData,
  );

  // Load assessment data from database when component mounts
  useEffect(() => {
    const loadAssessmentData = async () => {
      try {
        console.log('[Step4] Loading assessment data from database...');

        // Get Step 3 data to extract business days
        const step3Data = await AssessmentDatabaseService.getStepData(userId, 3);
        if (step3Data) {
          console.log('[Step4] Step 3 data loaded:', step3Data);
          const businessDays = parseInt(step3Data.numBusinessDays || "5");
          setBusinessDaysFromStep3(businessDays);
          console.log('[Step4] Business days from Step 3:', businessDays);

          // Check if Step 4 is completed and load data from database
          const currentStep = await AssessmentDatabaseService.getCurrentStep(userId);
          if (currentStep > 4) {
            console.log("[Step4] Step 4 is completed, loading from database...");
            const step4Data = await AssessmentDatabaseService.getStepData(userId, 4);
            if (step4Data) {
              console.log("[Step4] Step 4 data loaded from database:", step4Data);
              setIsStep4CompletedFromDB(true);

              // Load the reassessment form data from database
              const { setReassessmentForm } = step4Storage;
              setReassessmentForm(step4Data as any);
            }
          }
        }

        // TODO: Load other assessment data for initialAssessmentResults
        // This could include data from Steps 1, 2, and 3 combined

      } catch (error) {
        console.error('[Step4] Error loading assessment data:', error);
      }
    };

    loadAssessmentData();
  }, [userId]);

  // Function to fetch restorative data for evidence references
  const fetchRestorativeData = async () => {
    if (!candidateProfile?.id) return;

    try {
      const userId = candidateProfile.id;

      // Fetch all restorative record data
      const [
        { data: education },
        { data: employment },
        { data: rehab_programs },
        { data: community_engagements },
        { data: awards },
        { data: skills }
      ] = await Promise.all([
        supabase.from("education").select("*").eq("user_id", userId),
        supabase.from("employment").select("*").eq("user_id", userId),
        supabase.from("rehab_programs").select("*").eq("user_id", userId),
        supabase.from("community_engagements").select("*").eq("user_id", userId),
        supabase.from("awards").select("*").eq("user_id", userId),
        supabase.from("skills").select("*").eq("user_id", userId)
      ]);

      setRestorativeData({
        education: education || [],
        employment: employment || [],
        rehab_programs: rehab_programs || [],
        community_engagements: community_engagements || [],
        awards: awards || [],
        skills: skills || []
      });
    } catch (error) {
      console.error("Error fetching restorative data:", error);
    }
  };

  useEffect(() => {
    if (showReassessmentSplit && !candidateShareToken && !loadingCandidateData) {
      fetchCandidateShareToken();
    }
  }, [showReassessmentSplit]);

  useEffect(() => {
    if (showReassessmentSplit && candidateProfile?.id && !restorativeData) {
      fetchRestorativeData();
    }
  }, [showReassessmentSplit, candidateProfile]);
  const businessDaysRemaining = businessDaysFromStep3;
  return (
    <>
      {!showReassessmentSplit && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          {savedHireDecision && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold text-green-900 mb-1"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Decision Made: Proceed with Hire
                  </p>
                  <p
                    className="text-sm text-green-800"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Decision made on{" "}
                    {new Date(savedHireDecision.sentAt).toLocaleDateString()} to
                    proceed with hiring this candidate. The assessment process
                    is complete.
                  </p>
                </div>

                {isStep4CompletedFromDB && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p
                          className="text-sm font-semibold text-blue-900 mb-1"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          Step 4 Completed - Data Loaded from Database
                        </p>
                        <p
                          className="text-sm text-blue-800"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          This step has been completed previously. The reassessment form data has been loaded from the database.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col items-center mb-6">
            <div className="rounded-full bg-red-50 p-4 mb-4">
              <svg
                className="h-10 w-10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                style={{ color: "#E54747" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2
              className="text-2xl font-bold text-center mb-2 text-black"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Preliminary Decision Notice Sent Successfully
            </h2>
            <div
              className="text-center mb-4"
              style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}
            >
              Time Remaining for Response:
            </div>
            <div className="w-full flex flex-col items-center">
              <div className="flex flex-col items-center bg-red-50 rounded-xl px-12 py-4 mb-4 border border-red-100">
                {businessDaysRemaining !== null ? (
                  <>
                    <span
                      className="text-4xl font-bold"
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        color: "#E54747",
                      }}
                    >
                      {businessDaysRemaining}
                    </span>
                    <div
                      className="text-lg"
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        color: "#E54747",
                      }}
                    >
                      Business Days Remaining
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className="animate-spin rounded-full h-8 w-8 border-b-2 mb-2"
                      style={{ borderColor: "#E54747" }}
                    ></div>
                    <div
                      className="text-lg"
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        color: "#E54747",
                      }}
                    >
                      Loading...
                    </div>
                  </>
                )}
              </div>            </div>
          </div>
          <div className="w-full bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
            <div
              className="font-semibold mb-2 text-black"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Next Steps:
            </div>
            <ul
              className="list-disc list-inside space-y-1"
              style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}
            >
              <li>
                The candidate has {businessDaysRemaining !== null ? businessDaysRemaining : "..."} business days to
                respond with mitigating evidence
              </li>
              <li>
                If they challenge the accuracy of the criminal history report,
                they will receive an additional 5 business days
              </li>
              <li>
                You will be notified when the candidate submits their response
              </li>
              <li>
                After reviewing their response, you must make a final decision
              </li>
            </ul>
          </div>
          <div className="flex flex-row gap-4 mt-2">
            <button
              className={`px-8 py-3 rounded-xl text-lg font-semibold border transition-all duration-200 ${savedHireDecision
                ? "border-green-500 text-green-700 bg-green-50"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              onClick={() => (savedHireDecision ? undefined : proceedWithHire())}
              disabled={!!savedHireDecision}
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {savedHireDecision
                ? "✓ Proceed with hire (Selected)"
                : "Proceed with hire"}
            </button>
            <button
              className={`px-8 py-3 rounded-xl text-lg font-semibold transition-all duration-200 ${savedHireDecision
                ? "opacity-50 cursor-not-allowed"
                : "text-white hover:opacity-90"
                }`}
              onClick={() =>
                savedHireDecision ? undefined : proceedWithReassessment()
              }
              disabled={!!savedHireDecision}
              style={{
                fontFamily: "Poppins, sans-serif",
                backgroundColor: "#E54747",
              }}
            >
              Begin Individualized Reassessment
            </button>
          </div>
        </div>
      )}
      {!showReassessmentSplit && showReassessmentInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-10 relative border border-gray-200">
            <h2
              className="text-2xl font-bold mb-6 text-black"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Individualized Reassessment Information
            </h2>
            <div
              className="space-y-4 mb-8"
              style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}
            >
              <p className="text-base leading-relaxed">
                After informing an applicant that you intend to revoke a job
                offer due to the applicant's criminal history,{" "}
                <strong>
                  the applicant must be given specific timeframes to respond
                </strong>
                :
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">
                  Required Timeframes:
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      <strong>At least 5 business days</strong> to provide
                      mitigating evidence that speaks to their character and
                      fitness to perform the job
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      <strong>Additional 5 business days</strong> if the
                      applicant intends to gather and deliver information
                      disputing the accuracy of the criminal history report
                    </span>
                  </li>
                </ul>
              </div>
              <p className="text-base leading-relaxed">
                <strong>Important:</strong> During this reassessment process,
                the position must remain open, except in emergent circumstances.
              </p>
              <p className="text-base leading-relaxed">
                The following form can be used to conduct an individualized
                reassessment based on information provided by the applicant.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                className="px-8 py-3 rounded-xl text-lg font-semibold text-white hover:opacity-90 transition-all duration-200"
                onClick={() => {
                  setShowReassessmentInfoModal(false);
                  setShowReassessmentSplit(true);
                }}
                style={{
                  fontFamily: "Poppins, sans-serif",
                  backgroundColor: "#E54747",
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      {showReassessmentSplit && (
        <div className="flex flex-row w-full min-h-[10vh] gap-6">
          <IndividualizedReassessmentForm
            initialAssessmentResults={initialAssessmentResults}
            reassessmentForm={reassessmentForm}
            handleReassessmentFormChange={handleReassessmentFormChange}
            reassessmentPreview={reassessmentPreview}
            setReassessmentPreview={setReassessmentPreview}
            handleSendReassessment={handleSendReassessment}
            reassessmentDecision={reassessmentDecision}
            setReassessmentDecision={setReassessmentDecision}
            extendReason={extendReason}
            setExtendReason={setExtendReason}
            candidateId={userId as string}
            candidateProfile={candidateProfile}
            hrAdmin={hrAdmin}
            restorativeData={restorativeData}
          />
          <div className="flex-1 bg-white rounded-xl shadow p-8 border border-gray-200 max-h-[600px] overflow-y-auto">
            <h2
              className="text-2xl font-bold mb-6 text-black"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Candidate Response
            </h2>
            {loadingCandidateData ? (
              <div className="text-center py-12">
                <div
                  className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                  style={{ borderColor: "#E54747" }}
                ></div>
                <p
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    color: "#595959",
                  }}
                >
                  Loading candidate's restorative record...
                </p>
              </div>
            ) : candidateShareToken ? (
              <iframe
                src={`${window.location.origin}/restorative-record/share/${candidateShareToken}`}
                title="Candidate Restorative Record"
                className="w-full h-[500px] rounded-xl border border-gray-200"
                frameBorder="0"
              />
            ) : candidateProfile ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3
                  className="text-xl font-semibold mb-4 text-black"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Profile is Private
                </h3>
                <p
                  className="mb-6 max-w-md mx-auto"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    color: "#595959",
                  }}
                >
                  {candidateProfile.first_name} {candidateProfile.last_name} has
                  chosen to keep their restorative record private. The candidate
                  would need to enable sharing to make their record accessible.
                </p>
                <button
                  className="px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-200 mb-6"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    backgroundColor: "#E54747",
                  }}
                >
                  Request Restorative Record
                </button>
                <div className="bg-red-50 rounded-xl p-6 max-w-md mx-auto border border-red-100">
                  <h4
                    className="font-semibold mb-3 text-black"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    How to Enable Sharing:
                  </h4>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      color: "#595959",
                    }}
                  >
                    The candidate can enable sharing by visiting their
                    restorative record profile page and clicking the "Share"
                    button to generate a shareable link.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="h-16 w-16 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3
                  className="text-lg font-semibold text-black mb-2"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  No Restorative Record Available
                </h3>
                <p
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    color: "#595959",
                  }}
                >
                  This candidate has not yet created a restorative record or it
                  may not be available for sharing.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      <CriticalInfoSection
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentStep={currentStep}
      />
      <ExtendSuccessModal
        open={showExtendSuccessModal}
        onClose={() => setShowExtendSuccessModal(false)}
        onReturn={() => {
          setShowExtendSuccessModal(false);
          setShowReassessmentSplit(false);
          setReassessmentPreview(false);
          window.location.assign("/hr-admin/dashboard");
        }}
      />
    </>
  );
};

export default Step4;
