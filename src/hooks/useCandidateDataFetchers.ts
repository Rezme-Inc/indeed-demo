import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useCandidateData } from "@/context/useCandidateData";

export function useCandidateDataFetchers(
  candidateId: string,
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>
) {
  const { setCandidateShareToken, setCandidateProfile } = useCandidateData();

  const fetchCandidateShareToken = useCallback(async () => {
    if (setLoading) setLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select(
          "share_token, first_name, last_name, email, rr_completed, created_at"
        )
        .eq("id", candidateId)
        .single();

      if (profileError) {
        console.error("Error fetching candidate profile:", profileError);
        setCandidateProfile(null);
        setCandidateShareToken(null);
        return;
      }

      setCandidateProfile(profileData);

      if (!profileData.share_token) {
        setCandidateShareToken(null);
        return;
      }

      setCandidateShareToken(profileData.share_token);
    } catch (error) {
      console.error("Error fetching candidate share token:", error);
      setCandidateProfile(null);
      setCandidateShareToken(null);
    } finally {
      if (setLoading) setLoading(false);
    }
  }, [candidateId, setCandidateProfile, setCandidateShareToken, setLoading]);

  const fetchTimelineData = useCallback(async () => {
    try {
      const savedInvites = localStorage.getItem("hr_sent_invites");
      let inviteData = null;
      if (savedInvites) {
        const invites = JSON.parse(savedInvites);
        inviteData = invites.find((invite: any) => invite.id === candidateId);
      }

      const { data: permissionData } = await supabase
        .from("user_hr_permissions")
        .select("granted_at")
        .eq("user_id", candidateId)
        .eq("is_active", true)
        .single();

      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("rr_completed, created_at, updated_at")
        .eq("id", candidateId)
        .single();

      return {
        inviteSent: inviteData?.dateSent || null,
        accessGranted: permissionData?.granted_at || null,
        candidateResponse: profileData?.rr_completed
          ? profileData.updated_at
          : null,
        profileCreated: profileData?.created_at || null,
      };
    } catch (error) {
      console.error("Error fetching timeline data:", error);
      return {
        inviteSent: null,
        accessGranted: null,
        candidateResponse: null,
        profileCreated: null,
      };
    }
  }, [candidateId]);

  return { fetchCandidateShareToken, fetchTimelineData };
}

