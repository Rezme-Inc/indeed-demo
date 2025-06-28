import React, { useRef, useState } from "react";
import { Upload, FileText, CheckCircle, X, Sparkles, Edit2, Save } from "lucide-react";

interface FileUploadSectionProps {
  title: string;
  description: string;
  fileType: 'job_description' | 'offer_letter' | 'background_report';
  file: File | null;
  onFileUpload: (file: File) => void;
  onFileRemove: () => void;
  required?: boolean;
  showTemplate?: boolean;
  onShowTemplate?: () => void;
  // Processing props
  showProcessing?: boolean;
  isProcessing?: boolean;
  onProcess?: () => void;
  processingResults?: any;
  onApprove?: (results: any) => void;
  isApproved?: boolean;
  // Manual input props
  showManualInput?: boolean;
  manualData?: any;
  onManualDataChange?: (data: any) => void;
  onManualApprove?: (data: any) => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  title,
  description,
  fileType,
  file,
  onFileUpload,
  onFileRemove,
  required = false,
  showTemplate = false,
  onShowTemplate,
  showProcessing = false,
  isProcessing = false,
  onProcess,
  processingResults,
  onApprove,
  isApproved = false,
  showManualInput = false,
  manualData,
  onManualDataChange,
  onManualApprove,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [useManualInput, setUseManualInput] = useState(false);
  const [aiPopulatedFields, setAiPopulatedFields] = useState<{ [key: string]: boolean }>({});
  const [manuallyEditedFields, setManuallyEditedFields] = useState<{ [key: string]: boolean }>({});

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Please upload a PDF, Word document, or text file.');
      return;
    }

    // Validate file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    onFileUpload(selectedFile);
    // Reset AI population tracking when new file is uploaded
    setAiPopulatedFields({});
    setManuallyEditedFields({});
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleEdit = (field: string) => setEditingField(field);
  const handleSave = () => setEditingField(null);

  const handleDutyChange = (index: number, value: string) => {
    if (manualData && onManualDataChange) {
      const newDuties = [...(manualData.duties || [])];
      newDuties[index] = value;
      const updatedData = { ...manualData, duties: newDuties };
      onManualDataChange(updatedData);

      // Mark this duty as manually edited
      setManuallyEditedFields(prev => ({
        ...prev,
        [`duty_${index}`]: true
      }));

      // Auto-approve if all required fields are filled for job description
      if (fileType === 'job_description' && updatedData.position?.trim() && newDuties.some((d: string) => d.trim())) {
        onManualApprove?.(updatedData);
      }
    }
  };

  const handlePositionChange = (value: string) => {
    if (onManualDataChange) {
      const updatedData = { ...manualData, position: value };
      onManualDataChange(updatedData);
      // Mark position as manually edited
      setManuallyEditedFields(prev => ({
        ...prev,
        position: true
      }));

      // Auto-approve if all required fields are filled for job description
      if (fileType === 'job_description' && value.trim() && updatedData.duties?.some((d: string) => d.trim())) {
        onManualApprove?.(updatedData);
      }
    }
  };

  const handleOfferDateChange = (value: string) => {
    if (onManualDataChange) {
      const updatedData = { ...manualData, offerDate: value };
      onManualDataChange(updatedData);
      // Mark offer date as manually edited
      setManuallyEditedFields(prev => ({
        ...prev,
        offerDate: true
      }));

      // Auto-approve if offer date is filled
      if (fileType === 'offer_letter' && value.trim()) {
        onManualApprove?.(updatedData);
      }
    }
  };

  const addDuty = () => {
    if (manualData && onManualDataChange) {
      onManualDataChange({
        ...manualData,
        duties: [...(manualData.duties || []), ""]
      });
    }
  };

  const removeDuty = (index: number) => {
    if (manualData && onManualDataChange && manualData.duties?.length > 1) {
      const newDuties = manualData.duties.filter((_: any, i: number) => i !== index);
      onManualDataChange({ ...manualData, duties: newDuties });

      // Remove tracking for removed duty and shift indices
      const newManuallyEdited = { ...manuallyEditedFields };
      delete newManuallyEdited[`duty_${index}`];

      // Shift duty indices down for duties after the removed one
      for (let i = index + 1; i < manualData.duties.length; i++) {
        if (newManuallyEdited[`duty_${i}`]) {
          newManuallyEdited[`duty_${i - 1}`] = true;
          delete newManuallyEdited[`duty_${i}`];
        }
      }

      setManuallyEditedFields(newManuallyEdited);
    }
  };

  const handleApproveAIResults = (results: any) => {
    if (fileType === 'job_description') {
      // Populate manual input fields with AI results
      const updatedData = {
        position: results.position || '',
        duties: results.duties || ['']
      };
      onManualDataChange?.(updatedData);

      // Mark fields as AI populated
      const aiFields: { [key: string]: boolean } = { position: true };
      results.duties?.forEach((_: string, index: number) => {
        aiFields[`duty_${index}`] = true;
      });
      setAiPopulatedFields(aiFields);

      // Reset manual edit tracking
      setManuallyEditedFields({});

      // Automatically approve since user chose to use AI results
      onManualApprove?.(updatedData);
    } else if (fileType === 'offer_letter') {
      // Populate manual input fields with AI results
      const updatedData = {
        offerDate: results.offerDate || ''
      };
      onManualDataChange?.(updatedData);

      // Mark field as AI populated
      setAiPopulatedFields({ offerDate: true });

      // Reset manual edit tracking
      setManuallyEditedFields({});

      // Automatically approve since user chose to use AI results
      onManualApprove?.(updatedData);
    }
  };

  const getFieldClassName = (fieldName: string) => {
    const isAiPopulated = aiPopulatedFields[fieldName];
    const isManuallyEdited = manuallyEditedFields[fieldName];

    if (isAiPopulated && !isManuallyEdited) {
      return 'border-purple-300 bg-purple-50';
    }
    return 'border-gray-300';
  };

  const canApproveManualData = () => {
    if (fileType === 'job_description') {
      return manualData?.position?.trim() &&
        manualData?.duties?.length > 0 &&
        manualData?.duties?.some((duty: string) => duty.trim());
    }
    if (fileType === 'offer_letter') {
      return manualData?.offerDate?.trim();
    }
    return false;
  };

  const renderProcessingResults = () => {
    if (!processingResults) return null;

    if (fileType === 'job_description') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-semibold text-purple-900" style={{ fontFamily: "Poppins, sans-serif" }}>
              AI Processing Results
            </h4>
            <button
              onClick={onProcess}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Reprocess
            </button>
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
              Position Applied For
            </label>
            <div className="bg-purple-50 border border-purple-200 rounded px-3 py-2">
              <span className="text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>
                {processingResults.position}
              </span>
            </div>
          </div>

          {/* Job Duties */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
              Job Duties
            </label>
            <div className="bg-purple-50 border border-purple-200 rounded p-3">
              <ul className="space-y-2">
                {processingResults.duties?.map((duty: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-gray-500 text-sm mt-1">•</span>
                    <span className="text-gray-900 text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>
                      {duty}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={() => handleApproveAIResults(processingResults)}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Use These Results
          </button>
        </div>
      );
    }

    if (fileType === 'offer_letter') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-semibold text-purple-900" style={{ fontFamily: "Poppins, sans-serif" }}>
              AI Processing Results
            </h4>
            <button
              onClick={onProcess}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Reprocess
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
              Conditional Offer Date
            </label>
            <div className="bg-purple-50 border border-purple-200 rounded px-3 py-2">
              <span className="text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>
                {processingResults.offerDate || 'Not specified'}
              </span>
            </div>
          </div>

          <button
            onClick={() => handleApproveAIResults(processingResults)}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Use This Result
          </button>
        </div>
      );
    }

    return null;
  };

  const renderManualInput = () => {
    if (fileType === 'job_description') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-semibold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>
              Manual Input
            </h4>
            {processingResults && (
              <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded" style={{ fontFamily: "Poppins, sans-serif" }}>
                Fields populated from AI
              </span>
            )}
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
              Position Applied For *
            </label>
            <input
              type="text"
              value={manualData?.position || ''}
              onChange={(e) => handlePositionChange(e.target.value)}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 ${getFieldClassName('position')
                } ${!manualData?.position?.trim() ? 'focus:border-red-500' : 'focus:border-blue-500'
                }`}
              style={{ fontFamily: "Poppins, sans-serif" }}
              placeholder="Enter position title"
              required
            />
            {!manualData?.position?.trim() && (
              <p className="text-red-500 text-xs mt-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                Position is required
              </p>
            )}
          </div>

          {/* Job Duties */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
              Job Duties *
            </label>
            <div className="space-y-3">
              {(manualData?.duties || [""]).map((duty: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={duty}
                    onChange={(e) => handleDutyChange(index, e.target.value)}
                    className={`flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 ${getFieldClassName(`duty_${index}`)
                      } ${!duty.trim() ? 'focus:border-red-500' : 'focus:border-blue-500'
                      }`}
                    style={{ fontFamily: "Poppins, sans-serif" }}
                    placeholder={`Duty ${index + 1}`}
                    required
                  />
                  {(manualData?.duties?.length || 1) > 1 && (
                    <button
                      onClick={() => removeDuty(index)}
                      className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      title="Remove duty"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addDuty}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm font-medium"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                + Add Duty
              </button>
            </div>
            {(!manualData?.duties?.some((d: string) => d.trim())) && (
              <p className="text-red-500 text-xs mt-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                At least one job duty is required
              </p>
            )}
          </div>


        </div>
      );
    }

    if (fileType === 'offer_letter') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-semibold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>
              Manual Input
            </h4>
            {processingResults && (
              <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded" style={{ fontFamily: "Poppins, sans-serif" }}>
                Field populated from AI
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
              Conditional Offer Date *
            </label>
            <input
              type="date"
              value={manualData?.offerDate || ''}
              onChange={(e) => handleOfferDateChange(e.target.value)}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 ${getFieldClassName('offerDate')
                } ${!manualData?.offerDate?.trim() ? 'focus:border-red-500' : 'focus:border-blue-500'
                }`}
              style={{ fontFamily: "Poppins, sans-serif" }}
              required
            />
            {!manualData?.offerDate?.trim() && (
              <p className="text-red-500 text-xs mt-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                Offer date is required
              </p>
            )}
          </div>


        </div>
      );
    }

    return null;
  };

  const showSideBySide = showManualInput && (fileType === 'job_description' || fileType === 'offer_letter');

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
            {title}
            {required && <span className="text-red-500 ml-1">*</span>}
          </h3>
          <p className="text-sm text-gray-600" style={{ fontFamily: "Poppins, sans-serif" }}>
            {description}
          </p>
        </div>
        {showTemplate && onShowTemplate && (
          <button
            onClick={onShowTemplate}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            View Template
          </button>
        )}
      </div>

      {showSideBySide ? (
        <div className="grid grid-cols-2 gap-6">
          {/* Left side - File upload and AI processing */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>
              Upload & AI Processing
            </h4>

            {!file ? (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragOver
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <h5 className="text-md font-medium text-gray-900 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Drop file here, or{" "}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    browse
                  </button>
                </h5>
                <p className="text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                  PDF, Word, text files (max 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>
                            {file.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onFileRemove}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Processing section */}
                {showProcessing && (
                  <div>
                    {isProcessing ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <div className="animate-spin">
                            <Sparkles className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h5 className="text-sm font-semibold text-blue-900" style={{ fontFamily: "Poppins, sans-serif" }}>
                              Processing with AI...
                            </h5>
                            <p className="text-xs text-blue-700" style={{ fontFamily: "Poppins, sans-serif" }}>
                              Analyzing document to extract information
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : !processingResults ? (
                      <button
                        onClick={onProcess}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        <Sparkles className="h-4 w-4 inline mr-2" />
                        Process with AI
                      </button>
                    ) : (
                      renderProcessingResults()
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side - Manual input */}
          <div>
            {renderManualInput()}
          </div>
        </div>
      ) : (
        // Regular layout for background report
        <>
          {!file ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                Drop your file here, or{" "}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  browse
                </button>
              </h4>
              <p className="text-sm text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                Supports PDF, Word documents, and text files (max 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>
                        {file.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={onFileRemove}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}


    </div>
  );
};

export default FileUploadSection; 
