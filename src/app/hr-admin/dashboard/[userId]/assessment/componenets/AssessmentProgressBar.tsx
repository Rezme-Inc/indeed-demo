import React from "react";

interface AssessmentProgressBarProps {
  progressSteps: string[];
  currentStep: number;
}

const AssessmentProgressBar: React.FC<AssessmentProgressBarProps> = ({
  progressSteps,
  currentStep,
}) => {
  return (
    <div className="space-y-3">
      {progressSteps.map((step, idx) => {
        const isCurrent = currentStep - 1 === idx;
        const isCompleted = currentStep - 1 > idx;

        const borderColor = isCurrent
          ? "border-red-500"
          : isCompleted
            ? "border-green-500"
            : "border-gray-200";

        const bgColor = isCurrent
          ? "bg-red-50"
          : isCompleted
            ? "bg-green-50"
            : "bg-gray-50";

        const textColor = isCurrent
          ? "text-red-600"
          : isCompleted
            ? "text-green-600"
            : "text-gray-400";

        return (
          <div
            key={step}
            className={`flex items-center px-3 py-2 rounded border ${borderColor} ${bgColor}`}
          >
            <div
              className={`w-3 h-3 rounded-full flex items-center justify-center text-xs font-bold aspect-square mr-2 ${isCompleted
                ? "bg-green-500 text-white"
                : isCurrent
                  ? "bg-red-500 text-white"
                  : "border border-gray-300 bg-white text-gray-400"
                }`}
            >
              {isCompleted ? "✓" : ""}
            </div>
            <span className={`text-sm font-medium ${textColor}`}>{step}</span>
          </div>
        );
      })}
    </div>
  );
};

export default AssessmentProgressBar;
