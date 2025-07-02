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

  const removeDuty = useCallback((index: number) => {
    setAssessmentForm((prev: any) => ({
      ...prev,
      duties: prev.duties.filter((_: any, i: number) => i !== index),
    }));
  }, [setAssessmentForm]);

  const removeActivity = useCallback((index: number) => {
    setAssessmentForm((prev: any) => ({
      ...prev,
      activities: prev.activities.filter((_: any, i: number) => i !== index),
    }));
  }, [setAssessmentForm]);

  return { addDuty, addActivity, addConviction, removeDuty, removeActivity };
}
