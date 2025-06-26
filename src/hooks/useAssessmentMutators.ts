import { useCallback } from "react";

export function useAssessmentMutators(
  setAssessmentForm: React.Dispatch<React.SetStateAction<any>>,
  setRevocationForm: React.Dispatch<React.SetStateAction<any>>
) {
  const addDuty = useCallback(() => {
    setAssessmentForm((prev: any) => ({
      ...prev,
      duties: [...prev.duties, ""],
    }));
  }, [setAssessmentForm]);

  const addActivity = useCallback(() => {
    setAssessmentForm((prev: any) => ({
      ...prev,
      activities: [...prev.activities, ""],
    }));
  }, [setAssessmentForm]);

  const addConviction = useCallback(() => {
    setRevocationForm((prev: any) => ({
      ...prev,
      convictions: [...prev.convictions, ""],
    }));
  }, [setRevocationForm]);

  return { addDuty, addActivity, addConviction };
}
