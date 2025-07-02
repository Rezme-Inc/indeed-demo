import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface AIAutofillButtonProps {
  onAutofill: () => Promise<void>;
  className?: string;
  disabled?: boolean;
}

const AIAutofillButton: React.FC<AIAutofillButtonProps> = ({
  onAutofill,
  className = "",
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    try {
      await onAutofill();
    } catch (error) {
      console.error('Error during autofill:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${disabled || isLoading
          ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
          : "bg-purple-600 text-white hover:bg-purple-700 border border-purple-600 hover:shadow-md"
        }
        ${className}
      `}
      title={disabled ? "AI Autofill disabled" : "Fill form with AI suggestions"}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      <span>{isLoading ? "Autofilling..." : "AI Autofill"}</span>
    </button>
  );
};

export default AIAutofillButton; 
