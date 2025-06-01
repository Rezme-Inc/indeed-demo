import { useState } from "react";
import { DatePickerField } from "../components/DatePicker";
import { FileUpload } from "../components/FileUpload";
import { FormDialog } from "../components/FormDialog";
import { RecordItem } from "../components/RecordItem";
import { awardTypes } from "../constants";
import { useFormCRUD } from "../hooks/useFormCRUD";
import { Award } from "../types";
import {
  formatDateForDisplay,
  formatDateForInput,
  MAX_AWARD_FILE_SIZE,
} from "../utils";

interface PersonalAchievementsSectionProps {
  awardsHook: ReturnType<typeof useFormCRUD<Omit<Award, "id">>>;
  handleAwardFileChange: (file: File | null) => void;
  awardFileError: string;
  setAwardFileError: (error: string) => void;
}

export function PersonalAchievementsSection({
  awardsHook,
  handleAwardFileChange,
  awardFileError,
  setAwardFileError,
}: PersonalAchievementsSectionProps) {
  const [awardFormTouched, setAwardFormTouched] = useState(false);

  return (
    <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-semibold text-black">
          Personal Achievements
        </h2>
        <button
          type="button"
          className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          onClick={awardsHook.handleFormOpen}
        >
          ADD MORE
        </button>
      </div>
      <p className="mb-6 text-secondary">
        Your personal achievements tell a powerful story about your journey and
        growth. Include any milestones, awards, or recognitions you've
        earned—whether before, during, or after incarceration. These experiences
        highlight your resilience, dedication, and the positive impact you've
        made.
      </p>

      {/* List of awards */}
      {awardsHook.items.length > 0 && (
        <div className="mb-6 space-y-4">
          {awardsHook.items.map((award: Award & { id: string }) => (
            <RecordItem
              key={award.id}
              title={award.name}
              subtitle={`${award.type} • ${award.organization}`}
              details={[`Awarded: ${formatDateForDisplay(award.date)}`]}
              narrative={award.narrative}
              onEdit={() => awardsHook.handleEdit(award.id)}
              onDelete={() => awardsHook.handleDelete(award.id)}
            />
          ))}
        </div>
      )}

      {/* Award form */}
      <FormDialog
        isOpen={awardsHook.showForm}
        title={awardsHook.editingId ? "Edit Award" : "Add Award or Recognition"}
        onClose={awardsHook.handleFormClose}
        onSubmit={(e) => {
          e.preventDefault();
          setAwardFormTouched(true);
          awardsHook.handleSave();
        }}
        submitText="Award"
        isEditing={!!awardsHook.editingId}
      >
        <div>
          <label className="block font-medium text-black mb-2">
            Award Type *
          </label>
          <select
            value={awardsHook.form.type}
            onChange={(e) => awardsHook.updateForm({ type: e.target.value })}
            onBlur={() => setAwardFormTouched(true)}
            className={`border ${
              awardFormTouched && !awardsHook.form.type
                ? "border-primary"
                : "border-gray-200"
            } px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
            required
          >
            <option value="">Select award type from the options</option>
            {awardTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium text-black mb-2">
            Name of Award *
          </label>
          <input
            value={awardsHook.form.name}
            onChange={(e) => awardsHook.updateForm({ name: e.target.value })}
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter name of Award"
            required
          />
        </div>
        <div>
          <label className="block font-medium text-black mb-2">
            Award Organization *
          </label>
          <input
            value={awardsHook.form.organization}
            onChange={(e) =>
              awardsHook.updateForm({ organization: e.target.value })
            }
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter Award Organization name"
            required
          />
        </div>
        <DatePickerField
          label="Date Awarded"
          value={awardsHook.form.date}
          onChange={(date) =>
            awardsHook.updateForm({ date: formatDateForInput(date) })
          }
          required
        />
        <FileUpload
          id="award-file-upload"
          filePreview={awardsHook.form.filePreview}
          error={awardFileError}
          maxSize={MAX_AWARD_FILE_SIZE}
          onChange={handleAwardFileChange}
          onError={setAwardFileError}
        />
        <div>
          <label className="block font-medium text-black mb-2">Narrative</label>
          <textarea
            value={awardsHook.form.narrative}
            onChange={(e) =>
              awardsHook.updateForm({ narrative: e.target.value })
            }
            className="border border-gray-200 px-4 py-2 rounded-lg w-full min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Provide a narrative about this achievement or recognition. Describe its significance, your role, and what it means to you."
            maxLength={500}
          />
          <div className="text-xs text-secondary text-right mt-1">
            {awardsHook.form.narrative.length}/500 characters
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
