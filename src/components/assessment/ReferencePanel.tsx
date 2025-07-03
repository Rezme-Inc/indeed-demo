import React from "react";
import { X, Copy, CheckCircle } from "lucide-react";

interface ReferenceData {
  title: string;
  content: string | string[];
  source: string;
  fieldType: 'text' | 'array' | 'date';
}

interface ReferencePanelProps {
  isOpen: boolean;
  onClose: () => void;
  referenceData: ReferenceData | null;
  position?: 'right' | 'bottom';
}

const ReferencePanel: React.FC<ReferencePanelProps> = ({
  isOpen,
  onClose,
  referenceData,
  position = 'right',
}) => {
  const [copySuccess, setCopySuccess] = React.useState(false);

  if (!isOpen || !referenceData) return null;

  const handleCopy = async () => {
    try {
      const textToCopy = Array.isArray(referenceData.content)
        ? referenceData.content.join('\n')
        : referenceData.content;

      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const renderContent = () => {
    if (Array.isArray(referenceData.content)) {
      return (
        <ul className="list-disc pl-5 space-y-1">
          {referenceData.content.map((item, index) => (
            <li key={index} className="text-gray-700">{item}</li>
          ))}
        </ul>
      );
    }

    return (
      <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
        {referenceData.content}
      </div>
    );
  };

  const panelClasses = position === 'right'
    ? "fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50"
    : "fixed bottom-0 left-0 right-0 h-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-20 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={panelClasses}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {referenceData.title}
              </h3>
              <p className="text-sm text-blue-600 mt-1">
                Reference from {referenceData.source}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                title="Copy to clipboard"
              >
                {copySuccess ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Close reference panel"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {referenceData.content ? (
                renderContent()
              ) : (
                <div className="text-gray-500 italic">
                  No content available for this reference.
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="text-xs text-gray-600">
              <p className="mb-2">
                <strong>Tip:</strong> You can copy this content and use it as a reference when filling out your current form.
              </p>
              <p>
                This information is from a previous step and is provided for reference only.
                You can modify your current response as needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReferencePanel; 
