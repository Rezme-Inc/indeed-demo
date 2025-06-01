import { rehabProgramsList } from "../constants";
import {
  RehabProgramDetailsKey,
  RehabProgramKey,
  RehabPrograms,
} from "../types";

interface RehabilitativeProgramsSectionProps {
  rehabPrograms: RehabPrograms;
  handleRehabCheckbox: (key: RehabProgramKey) => void;
  handleRehabDetailsChange: (key: RehabProgramKey, value: string) => void;
}

export function RehabilitativeProgramsSection({
  rehabPrograms,
  handleRehabCheckbox,
  handleRehabDetailsChange,
}: RehabilitativeProgramsSectionProps) {
  return (
    <div className="p-6 bg-white rounded shadow relative">
      <h2 className="text-2xl font-bold mb-2">Rehabilitative Programs</h2>
      <p className="mb-6 text-secondary">
        Listing your participation in rehabilitative programs highlights your
        resilience, growth, and commitment to positive change. Include any
        programs you completed before, during, or after incarceration—these
        experiences show your dedication to self-improvement and your readiness
        for new opportunities.
      </p>
      <div className="space-y-4">
        {rehabProgramsList.map((prog) => {
          const programKey = prog.key as RehabProgramKey;
          const detailsKey = `${programKey}Details` as RehabProgramDetailsKey;
          return (
            <div key={prog.key} className="border rounded p-4 bg-white">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rehabPrograms[programKey]}
                  onChange={() => handleRehabCheckbox(programKey)}
                  className="mt-1 accent-red-500"
                />
                <div className="flex-1">
                  <div className="font-medium">{prog.label}</div>
                  <div className="text-sm text-secondary mt-1">{prog.desc}</div>
                  {rehabPrograms[programKey] && (
                    <div>
                      <textarea
                        className="border p-2 rounded w-full min-h-[60px]"
                        placeholder="Describe your experience with this program. Describe its value, how it helped you, and any outcomes."
                        value={rehabPrograms[detailsKey]}
                        onChange={(e) =>
                          handleRehabDetailsChange(programKey, e.target.value)
                        }
                        maxLength={500}
                      />
                      <div className="text-xs text-secondary text-right">
                        {rehabPrograms[detailsKey].length}/500 characters
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
