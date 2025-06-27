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
}) => {
  const hasSuggestion = suggestion && suggestion.trim() !== "";
  const isAutofilled = hasSuggestion && value === suggestion;

  const handleFocus = () => {
    // No special focus handling needed - let user interact with field normally
  };

  const handleChange = (newValue: string) => {
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

        {/* Small indicator when autofilled */}
        {isAutofilled && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded">
            <Sparkles className="h-3 w-3" />
            <span>Auto-filled</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartSuggestionField;
