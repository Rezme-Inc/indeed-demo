import { createContext, useContext, useEffect, useState } from "react";

interface TimelineData {
  inviteSent: string | null;
  accessGranted: string | null;
  candidateResponse: string | null;
  profileCreated: string | null;
}

interface CandidateDataState {
  candidateShareToken: string | null;
  setCandidateShareToken: (v: string | null) => void;
  candidateProfile: any;
  setCandidateProfile: (p: any) => void;
  timelineData: TimelineData;
  setTimelineData: React.Dispatch<React.SetStateAction<TimelineData>>;
}

const CandidateDataContext = createContext<CandidateDataState | undefined>(
  undefined
);

interface ProviderProps { children: React.ReactNode; candidateId: string; }

export function CandidateDataProvider({ children, candidateId }: ProviderProps) {
  const [candidateShareToken, setCandidateShareToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(`candidateShareToken_${candidateId}`);
  });
  const [candidateProfile, setCandidateProfile] = useState<any>(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(`candidateProfile_${candidateId}`);
    return saved ? JSON.parse(saved) : null;
  });
  const [timelineData, setTimelineData] = useState<TimelineData>(() => ({
    inviteSent: null,
    accessGranted: null,
    candidateResponse: null,
    profileCreated: null,
  }));

  useEffect(() => {
    if (candidateShareToken)
      localStorage.setItem(`candidateShareToken_${candidateId}`, candidateShareToken);
    else localStorage.removeItem(`candidateShareToken_${candidateId}`);
  }, [candidateShareToken, candidateId]);

  useEffect(() => {
    if (candidateProfile)
      localStorage.setItem(`candidateProfile_${candidateId}`, JSON.stringify(candidateProfile));
  }, [candidateProfile, candidateId]);

  return (
    <CandidateDataContext.Provider
      value={{
        candidateShareToken,
        setCandidateShareToken,
        candidateProfile,
        setCandidateProfile,
        timelineData,
        setTimelineData,
      }}
    >
      {children}
    </CandidateDataContext.Provider>
  );
}

export function useCandidateData() {
  const ctx = useContext(CandidateDataContext);
  if (!ctx) throw new Error("useCandidateData must be used within provider");
  return ctx;
}
