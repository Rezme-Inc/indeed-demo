import { DatePickerField } from "../components/DatePicker";
import { FileUpload } from "../components/FileUpload";
import { FormDialog } from "../components/FormDialog";
import { RecordItem } from "../components/RecordItem";
import { useFormCRUD } from "../hooks/useFormCRUD";
import { Microcredential } from "../types";
import { formatDateForDisplay, formatDateForInput } from "../utils";
import { useEffect } from "react";

interface MicrocredentialsSectionProps {
  microHook: ReturnType<typeof useFormCRUD<Omit<Microcredential, "id">>>;
  handleMicroFileChange: (file: File | null) => void;
  microFileError: string;
  setMicroFileError: (error: string) => void;
  onChange?: () => void;
}

export function MicrocredentialsSection({
  microHook,
  handleMicroFileChange,
  microFileError,
  setMicroFileError,
  onChange,
}: MicrocredentialsSectionProps) {
  // Debug: Log items when they change
  useEffect(() => {
    console.log("Microcredentials items updated:", microHook.items.length);
  }, [microHook.items]);

  const handleSave = () => {
    const result = microHook.handleSave();
    if (result && onChange) onChange();
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await microHook.handleDelete(id);
      if (success) {
        // Small delay to ensure state updates are processed
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
    }
  };

  const handleEdit = (id: string) => {
    microHook.handleEdit(id);
  };

  // Handle ADD MORE button with scroll functionality
  const handleAddMore = () => {
    microHook.handleFormOpen();
    // Scroll to the form after a small delay to ensure it's rendered
    setTimeout(() => {
      const formDialog = document.querySelector('.border.border-gray-200.rounded-lg.p-4.bg-gray-50');
      if (formDialog) {
        formDialog.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  return (
    <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex flex-col items-start mb-2 md:flex-row md:justify-between md:items-center md:justify-center">
        <h2 className="text-2xl font-semibold text-black mb-2 md:mb-0">Microcredentials</h2>
        <button
          type="button"
          className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          onClick={handleAddMore}
        >
          ADD MORE
        </button>
      </div>
      <p className="mb-6 text-secondary">
        Microcredentials, certifications, and licenses are valuable proof of
        your skills and commitment to learning. Include any certificates,
        training, or credentials you've earned—whether through formal education,
        online courses, or programs completed during incarceration or reentry.
        These achievements help you prove your expertise and dedication.
      </p>

      {/* List of microcredentials */}
      {microHook.items.length > 0 && (
        <div className="mb-6 space-y-4">
          {microHook.items.map((micro: Microcredential & { id: string }) => (
            <RecordItem
              key={micro.id}
              title={micro.name}
              subtitle={micro.org}
              details={[
                `Issued: ${formatDateForDisplay(micro.issueDate)}${
                  micro.expiryDate
                    ? ` • Expires: ${formatDateForDisplay(micro.expiryDate)}`
                    : ""
                }`,
                micro.credentialId ? `ID: ${micro.credentialId}` : "",
                micro.credentialUrl ? `URL: ${micro.credentialUrl}` : "",
              ].filter(Boolean)}
              narrative={micro.narrative}
              onEdit={() => handleEdit(micro.id)}
              onDelete={() => handleDelete(micro.id)}
            />
          ))}
        </div>
      )}

      {/* Microcredential form */}
      <FormDialog
        isOpen={microHook.showForm}
        title={
          microHook.editingId
            ? "Edit Microcredential"
            : "Add Microcredential / Certification"
        }
        onClose={microHook.handleFormClose}
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        submitText="Credential"
        isEditing={!!microHook.editingId}
      >
        <div>
          <label className="block font-medium mb-1">
            Certification or Microcredential name *
          </label>
          <input
            value={microHook.form.name}
            onChange={(e) => microHook.updateForm({ name: e.target.value })}
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter certification or microcredential name"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">
            Issuing organization *
          </label>
          <input
            value={microHook.form.org}
            onChange={(e) => microHook.updateForm({ org: e.target.value })}
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter name of issuing organization"
            required
          />
        </div>
        <DatePickerField
          label="Issue Date"
          value={microHook.form.issueDate}
          onChange={(date) =>
            microHook.updateForm({ issueDate: formatDateForInput(date) })
          }
          required
        />
        <DatePickerField
          label="Expiry Date"
          value={microHook.form.expiryDate}
          onChange={(date) =>
            microHook.updateForm({ expiryDate: formatDateForInput(date) })
          }
        />
        <div>
          <label className="block font-medium mb-1">Credential ID</label>
          <input
            value={microHook.form.credentialId}
            onChange={(e) =>
              microHook.updateForm({ credentialId: e.target.value })
            }
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter credential ID of the issuing organization"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Credential URL</label>
          <input
            value={microHook.form.credentialUrl}
            onChange={(e) =>
              microHook.updateForm({ credentialUrl: e.target.value })
            }
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter credential URL of the issuing organization"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Narrative</label>
          <textarea
            value={microHook.form.narrative}
            onChange={(e) =>
              microHook.updateForm({ narrative: e.target.value })
            }
            className="border p-2 rounded w-full min-h-[80px]"
            placeholder="Describe what this credential means to you and how it has helped in your journey."
            maxLength={500}
          />
          <div className="text-xs text-secondary text-right">
            {microHook.form.narrative.length}/500 characters
          </div>
        </div>
        <FileUpload
          id="micro-file-upload"
          filePreview={microHook.form.filePreview}
          error={microFileError}
          onChange={handleMicroFileChange}
          onError={setMicroFileError}
          fileName={microHook.form.fileName}
          fileSize={microHook.form.fileSize}
        />
      </FormDialog>
    </div>
  );
}
