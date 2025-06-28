import React from "react";
import { Sparkles } from "lucide-react";

interface DynamicSmartSuggestionFieldProps {
  value: string;
  onChange: (value: string) => void;
  suggestion?: string;
  suggestionsEnabled: boolean;
  placeholder?: string;
  type?: 'text' | 'textarea';
  required?: boolean;
  isManual?: boolean;
  onManualChange?: (isManual: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}

const DynamicSmartSuggestionField: React.FC<DynamicSmartSuggestionFieldProps> = ({
  value,
  onChange,
  suggestion,
  suggestionsEnabled,
  placeholder,
  type = 'text',
  required = false,
  isManual = false,
  onManualChange,
  className,
  style,
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
    setLocalIsManual(true);

    if (onManualChange) {
      onManualChange(true);
    }
    onChange(newValue);
  };

  const baseClasses = `
    w-full border rounded-xl px-3 py-2 transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:border-red-500
    ${isAutofilled
      ? "border-purple-300 bg-purple-50 text-purple-700"
      : "border-gray-300 focus:border-red-500 text-gray-900"
    }
    focus:outline-none
  `;

  const combinedClassName = className ? `${baseClasses} ${className}` : baseClasses;

  const inputProps = {
    value: value || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleChange(e.target.value),
    onFocus: handleFocus,
    placeholder: placeholder,
    className: combinedClassName,
    style: style,
    required,
  };

  return (
    <div className="relative">
      {type === 'textarea' ? (
        <textarea {...inputProps} rows={4} />
      ) : (
        <input {...inputProps} type={type} />
      )}

      {/* Small indicator when autofilled - shows briefly then fades */}
      {isAutofilled && showAutofilledLabel && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded transition-opacity duration-300">
          <Sparkles className="h-3 w-3" />
          <span>Auto-filled</span>
        </div>
      )}
    </div>
  );
};

export default DynamicSmartSuggestionField; 
