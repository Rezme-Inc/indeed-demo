import { FileUpload } from "../components/FileUpload";
import { FormDialog } from "../components/FormDialog";
import { RecordItem } from "../components/RecordItem";
import { engagementTypes } from "../constants";
import { useFormCRUD } from "../hooks/useFormCRUD";
import { Engagement } from "../types";
import { useEffect } from "react";

interface CommunityEngagementSectionProps {
  engagementHook: ReturnType<typeof useFormCRUD<Omit<Engagement, "id">>>;
  handleEngagementFileChange: (file: File | null) => void;
  engagementFileError: string;
  setEngagementFileError: (error: string) => void;
  onChange?: () => void;
}

export function CommunityEngagementSection({
  engagementHook,
  handleEngagementFileChange,
  engagementFileError,
  setEngagementFileError,
  onChange,
}: CommunityEngagementSectionProps) {
  // Debug: log items changes
  useEffect(() => {
    console.log("Community Engagement items changed:", engagementHook.items.length, engagementHook.items);
  }, [engagementHook.items]);

  const handleSave = () => {
    const result = engagementHook.handleSave();
    if (result && onChange) onChange();
  };

  const handleDelete = async (id: string) => {
    console.log("Attempting to delete engagement with ID:", id);
    try {
      const success = await engagementHook.handleDelete(id);
      console.log("Delete operation result:", success);
      if (success) {
        console.log("Items after deletion:", engagementHook.items.length);
        // Small delay to ensure state updates are processed
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
    }
  };

  const handleEdit = (id: string) => {
    engagementHook.handleEdit(id);
  };

  // Handle ADD MORE button with scroll functionality
  const handleAddMore = () => {
    engagementHook.handleFormOpen();
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
          Community Engagement
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
        Community engagement and volunteering show your commitment to giving
        back and being part of something bigger than yourself. List any
        volunteer work, advocacy, or community service—before, during, or after
        incarceration. These experiences highlight your values, teamwork, and
        positive impact.
      </p>

      {/* List of engagements */}
      {engagementHook.items.length > 0 && (
        <div className="mb-6 space-y-4">
          {engagementHook.items.map(
            (engagement: Engagement & { id: string }) => (
              <RecordItem
                key={engagement.id}
                title={engagement.role}
                subtitle={`${engagement.type} • ${engagement.orgName}`}
                details={engagement.orgWebsite ? [engagement.orgWebsite] : []}
                narrative={engagement.details}
                onEdit={() => handleEdit(engagement.id)}
                onDelete={() => handleDelete(engagement.id)}
              />
            )
          )}
        </div>
      )}

      {/* Engagement form */}
      <FormDialog
        isOpen={engagementHook.showForm}
        title={
          engagementHook.editingId
            ? "Edit Community Engagement"
            : "Add Community Engagement"
        }
        onClose={engagementHook.handleFormClose}
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        submitText="Engagement"
        isEditing={!!engagementHook.editingId}
      >
        <div>
          <label className="block font-medium mb-1">
            Community Engagement Type *
          </label>
          <select
            value={engagementHook.form.type}
            onChange={(e) =>
              engagementHook.updateForm({ type: e.target.value })
            }
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            required
          >
            <option value="">
              Select Community Engagement type from the options
            </option>
            {engagementTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Engagement role *</label>
          <input
            value={engagementHook.form.role}
            onChange={(e) =>
              engagementHook.updateForm({ role: e.target.value })
            }
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter your engagement role"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">
            Organization or Event name *
          </label>
          <input
            value={engagementHook.form.orgName}
            onChange={(e) =>
              engagementHook.updateForm({ orgName: e.target.value })
            }
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter your organization or event name"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">
            Organization or Event website
          </label>
          <input
            value={engagementHook.form.orgWebsite}
            onChange={(e) =>
              engagementHook.updateForm({ orgWebsite: e.target.value })
            }
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter your organization or event website (optional)"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">
            Involvement details *
          </label>
          <textarea
            value={engagementHook.form.details}
            onChange={(e) =>
              engagementHook.updateForm({ details: e.target.value })
            }
            className="border p-2 rounded w-full min-h-[80px]"
            placeholder="Define in your words how you contributed or participated in this engagement and what that means to you"
            maxLength={500}
            required
          />
          <div className="text-xs text-secondary text-right">
            {engagementHook.form.details.length}/500 characters
          </div>
        </div>
        <FileUpload
          id="engagement-file-upload"
          filePreview={engagementHook.form.filePreview}
          error={engagementFileError}
          onChange={handleEngagementFileChange}
          onError={setEngagementFileError}
          fileName={engagementHook.form.fileName}
          fileSize={engagementHook.form.fileSize}
        />
      </FormDialog>
    </div>
  );
}
