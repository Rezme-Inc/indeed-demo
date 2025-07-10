import { DatePickerField } from "../components/DatePicker";
import { FileUpload } from "../components/FileUpload";
import { FormDialog } from "../components/FormDialog";
import { RecordItem } from "../components/RecordItem";
import { rehabProgramOptions, rehabProgramTypeOptions } from "../constants";
import { useFormCRUD } from "../hooks/useFormCRUD";
import { RehabProgram } from "../types";
import { formatDateForDisplay, formatDateForInput, generateId } from "../utils";
import { useEffect } from "react";

interface RehabilitativeProgramsSectionProps {
  rehabHook: ReturnType<typeof useFormCRUD<Omit<RehabProgram, "id">>>;
  handleRehabFileChange: (file: File | null) => void;
  rehabFileError: string;
  setRehabFileError: (error: string) => void;
  onChange?: () => void;
  onSave?: (formData: RehabProgram & { id: string }, isEdit: boolean) => Promise<void>;
}

export function RehabilitativeProgramsSection({
  rehabHook,
  handleRehabFileChange,
  rehabFileError,
  setRehabFileError,
  onChange,
  onSave,
}: RehabilitativeProgramsSectionProps) {
  // Debug: Log items when they change
  useEffect(() => {
    console.log("Rehab programs items updated:", rehabHook.items.length);
  }, [rehabHook.items]);

  const handleSave = async () => {
    try {
      console.log("🔄 Starting save process...");
      console.log("📝 Form data:", rehabHook.form);
      
      // Validate the form first
      if (!rehabHook.form.program || !rehabHook.form.programType) {
        console.error("❌ Required fields missing:", {
          program: rehabHook.form.program,
          programType: rehabHook.form.programType
        });
        return;
      }

      // Create the data object that will be saved
      const formDataWithId = {
        ...rehabHook.form,
        id: rehabHook.editingId || generateId()
      } as RehabProgram & { id: string };

      console.log("💾 Saving to Supabase:", formDataWithId);

      // Save to Supabase first
      if (onSave) {
        await onSave(formDataWithId, !!rehabHook.editingId);
        console.log("✅ Supabase save completed");
      }

      // Then update local state
      const result = rehabHook.handleSave();
      console.log("📱 Local state update result:", result);
      
      if (result) {
        // Refresh the data from Supabase
        if (onChange) {
          console.log("🔄 Refreshing data from Supabase...");
          await onChange();
          console.log("✅ Data refresh completed");
        }
      }
    } catch (error) {
      console.error("❌ Error in handleSave:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await rehabHook.handleDelete(id);
      if (success) {
        // Small delay to ensure state updates and database operations are processed
        await new Promise(resolve => setTimeout(resolve, 150));
        if (onChange) {
          await onChange();
        }
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
    }
  };

  const handleEdit = (id: string) => {
    rehabHook.handleEdit(id);
  };

  // Handle ADD MORE button with scroll functionality
  const handleAddMore = () => {
    rehabHook.handleFormOpen();
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
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-semibold text-black">
          Rehabilitative Programs
        </h2>
        <button
          type="button"
          className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          onClick={handleAddMore}
        >
          ADD MORE
        </button>
      </div>
      <p className="mb-6 text-secondary">
        Listing your participation in rehabilitative programs highlights your
        resilience, growth, and commitment to positive change. Include any
        programs you completed before, during, or after incarceration—these
        experiences show your dedication to self-improvement and your readiness
        for new opportunities.
      </p>

      {/* List of rehab programs */}
      {rehabHook.items.length > 0 && (
        <div className="mb-6 space-y-4">
          {rehabHook.items.map((program: RehabProgram & { id: string }) => (
            <RecordItem
              key={program.id}
              title={program.program}
              subtitle={program.programType}
              details={[
                program.startDate && `Started: ${formatDateForDisplay(program.startDate)}`,
                program.endDate && `Ended: ${formatDateForDisplay(program.endDate)}`,
                program.details,
              ].filter(Boolean)}
              narrative={program.narrative}
              onEdit={() => handleEdit(program.id)}
              onDelete={() => handleDelete(program.id)}
            />
          ))}
        </div>
      )}

      {/* Rehab programs form */}
      <FormDialog
        isOpen={rehabHook.showForm}
        title={rehabHook.editingId ? "Edit Program" : "Add Rehabilitative Program"}
        onClose={rehabHook.handleFormClose}
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        submitText="Program"
        isEditing={!!rehabHook.editingId}
      >
        <div>
          <label className="block font-medium mb-1">Program *</label>
          <select
            value={rehabHook.form.program}
            onChange={(e) =>
              rehabHook.updateForm({ program: e.target.value })
            }
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            required
          >
            <option value="">Select a program</option>
            {rehabProgramOptions.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Program Type *</label>
          <select
            value={rehabHook.form.programType}
            onChange={(e) => rehabHook.updateForm({ programType: e.target.value })}
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            required
          >
            <option value="">Select program type</option>
            {rehabProgramTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <DatePickerField
            label="Start Date"
            value={rehabHook.form.startDate}
            onChange={(date) => rehabHook.updateForm({ startDate: formatDateForInput(date) })}
          />
        </div>
        <div>
          <DatePickerField
            label="End Date"
            value={rehabHook.form.endDate}
            onChange={(date) => rehabHook.updateForm({ endDate: formatDateForInput(date) })}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Program Details</label>
          <input
            value={rehabHook.form.details}
            onChange={(e) => rehabHook.updateForm({ details: e.target.value })}
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter program details (duration, location, etc.)"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Narrative</label>
          <textarea
            value={rehabHook.form.narrative}
            onChange={(e) =>
              rehabHook.updateForm({ narrative: e.target.value })
            }
            className="border p-2 rounded w-full min-h-[80px]"
            placeholder="Describe your experience with this program. Describe its value, how it helped you, and any outcomes."
            maxLength={500}
          />
          <div className="text-xs text-secondary text-right">
            {rehabHook.form.narrative.length}/500 characters
          </div>
        </div>
        <FileUpload
          id="rehab-file-upload"
          filePreview={rehabHook.form.filePreview}
          error={rehabFileError}
          onChange={handleRehabFileChange}
          onError={setRehabFileError}
          fileName={rehabHook.form.fileName}
          fileSize={rehabHook.form.fileSize}
        />
      </FormDialog>
    </div>
  );
}
