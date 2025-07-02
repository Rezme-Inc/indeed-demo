import React from "react";
import { Eye, Sparkles } from "lucide-react";

interface ReferenceData {
  title: string;
  content: string | string[];
  source: string;
  fieldType: 'text' | 'array' | 'date';
}

interface SmartSuggestionFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestion?: string;
  suggestionsEnabled: boolean;
  placeholder?: string;
  type?: 'text' | 'textarea' | 'date';
  showReference?: boolean;
  referenceData?: ReferenceData;
  onShowReference?: () => void;
  required?: boolean;
  isManual?: boolean;
  onManualChange?: (isManual: boolean) => void;
}

const SmartSuggestionField: React.FC<SmartSuggestionFieldProps> = ({
  label,
  value,
  onChange,
  suggestion,
  suggestionsEnabled,
  placeholder,
  type = 'text',
  showReference = false,
  referenceData,
  onShowReference,
  required = false,
  isManual = false,
  onManualChange,
}) => {
  const [showAutofilledLabel, setShowAutofilledLabel] = React.useState(false);
  const [localIsManual, setLocalIsManual] = React.useState(isManual);

  // Sync local state with prop changes (for autofill resets)
  React.useEffect(() => {
    setLocalIsManual(isManual);
  }, [isManual]);

  const hasSuggestion = suggestion && suggestion.trim() !== "";
  // Field is autofilled if: has suggestion, value matches suggestion, and NOT manually entered
  const isAutofilled = !localIsManual && hasSuggestion && value === suggestion;

  // Debug logging
  React.useEffect(() => {
    console.log(`[SmartSuggestionField ${label}] State:`, {
      value,
      suggestion,
      isManual,
      localIsManual,
      hasSuggestion,
      isAutofilled,
      showAutofilledLabel
    });
  }, [value, suggestion, isManual, localIsManual, hasSuggestion, isAutofilled, showAutofilledLabel, label]);

  // Debug prop changes
  React.useEffect(() => {
    console.log(`[SmartSuggestionField ${label}] isManual prop changed:`, isManual);
  }, [isManual, label]);

  // Effect to show autofilled label briefly when value becomes autofilled
  React.useEffect(() => {
    if (isAutofilled) {
      setShowAutofilledLabel(true);
      const timer = setTimeout(() => {
        setShowAutofilledLabel(false);
      }, 3000); // Show for 3 seconds

      return () => clearTimeout(timer);
    } else {
      setShowAutofilledLabel(false);
    }
  }, [isAutofilled]);

  const handleFocus = () => {
    // Hide the label when user focuses on the field
    setShowAutofilledLabel(false);
  };

  const handleChange = (newValue: string) => {
    // Mark as manual input when user types
    console.log(`[SmartSuggestionField ${label}] User input:`, {
      oldValue: value,
      newValue,
      wasManual: isManual,
      localWasManual: localIsManual
    });

    // Immediately update local state
    setLocalIsManual(true);
    console.log(`[SmartSuggestionField ${label}] Setting localIsManual = true immediately`);

    if (onManualChange) {
      console.log(`[SmartSuggestionField ${label}] Calling onManualChange(true)`);
      onManualChange(true);
    }
    onChange(newValue);
  };

  const renderInput = () => {
    const baseClasses = `
      w-full border rounded px-3 py-2 transition-all duration-200
      ${isAutofilled
        ? "border-purple-300 bg-purple-50 text-purple-700"
        : "border-gray-300 focus:border-blue-500 text-gray-900"
      }
      focus:outline-none focus:ring-2 focus:ring-blue-200
    `;

    const inputProps = {
      value: value || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleChange(e.target.value),
      onFocus: handleFocus,
      placeholder: placeholder,
      className: baseClasses,
      required,
    };

    if (type === 'textarea') {
      return <textarea {...inputProps} rows={4} />;
    }

    return <input {...inputProps} type={type} />;
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {showReference && referenceData && (
          <button
            type="button"
            onClick={onShowReference}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            title={`View reference from ${referenceData.source}`}
          >
            <Eye className="h-3 w-3" />
            <span>View Reference</span>
          </button>
        )}
      </div>

      <div className="relative">
        {renderInput()}

        {/* Small indicator when autofilled - shows briefly then fades */}
        {isAutofilled && showAutofilledLabel && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded transition-opacity duration-300">
            <Sparkles className="h-3 w-3" />
            <span>Auto-filled</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartSuggestionField;
