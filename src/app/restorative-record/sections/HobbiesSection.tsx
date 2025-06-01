import { FileUpload } from "../components/FileUpload";
import { FormDialog } from "../components/FormDialog";
import { RecordItem } from "../components/RecordItem";
import { generalHobbyOptions, sportsOptions } from "../constants";
import { useFormCRUD } from "../hooks/useFormCRUD";
import { Hobby } from "../types";

interface HobbiesSectionProps {
  hobbiesHook: ReturnType<typeof useFormCRUD<Omit<Hobby, "id">>>;
  handleHobbiesFileChange: (file: File | null) => void;
  hobbiesFileError: string;
  setHobbiesFileError: (error: string) => void;
}

export function HobbiesSection({
  hobbiesHook,
  handleHobbiesFileChange,
  hobbiesFileError,
  setHobbiesFileError,
}: HobbiesSectionProps) {
  return (
    <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-semibold text-black">
          Hobbies & Interests
        </h2>
        <button
          type="button"
          className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          onClick={hobbiesHook.handleFormOpen}
        >
          ADD MORE
        </button>
      </div>
      <p className="mb-6 text-secondary">
        Hobbies and interests are a great way to showcase your diverse range of
        activities and passions. List any hobbies, sports, or other interests
        you enjoy, and describe why they are meaningful to you.
      </p>

      {/* List of hobbies */}
      {hobbiesHook.items.length > 0 && (
        <div className="mb-6 space-y-4">
          {hobbiesHook.items.map((hobby: Hobby & { id: string }) => (
            <RecordItem
              key={hobby.id}
              title={hobby.general || hobby.sports || hobby.other}
              details={[
                hobby.general && `General: ${hobby.general}`,
                hobby.sports && `Sports: ${hobby.sports}`,
                hobby.other && `Other: ${hobby.other}`,
              ].filter(Boolean)}
              narrative={hobby.narrative}
              onEdit={() => hobbiesHook.handleEdit(hobby.id)}
              onDelete={() => hobbiesHook.handleDelete(hobby.id)}
            />
          ))}
        </div>
      )}

      {/* Hobbies form */}
      <FormDialog
        isOpen={hobbiesHook.showForm}
        title={hobbiesHook.editingId ? "Edit Hobby" : "Add Hobby"}
        onClose={hobbiesHook.handleFormClose}
        onSubmit={(e) => {
          e.preventDefault();
          hobbiesHook.handleSave();
        }}
        submitText="Hobby"
        isEditing={!!hobbiesHook.editingId}
      >
        <div>
          <label className="block font-medium mb-1">General Hobby</label>
          <select
            value={hobbiesHook.form.general}
            onChange={(e) =>
              hobbiesHook.updateForm({ general: e.target.value })
            }
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            <option value="">Select a general hobby</option>
            {generalHobbyOptions.map((hobby) => (
              <option key={hobby} value={hobby}>
                {hobby}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Sports</label>
          <select
            value={hobbiesHook.form.sports}
            onChange={(e) => hobbiesHook.updateForm({ sports: e.target.value })}
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            <option value="">Select a sport</option>
            {sportsOptions.map((sport) => (
              <option key={sport} value={sport}>
                {sport}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Other Interests</label>
          <input
            value={hobbiesHook.form.other}
            onChange={(e) => hobbiesHook.updateForm({ other: e.target.value })}
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter any other interests"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Narrative</label>
          <textarea
            value={hobbiesHook.form.narrative}
            onChange={(e) =>
              hobbiesHook.updateForm({ narrative: e.target.value })
            }
            className="border p-2 rounded w-full min-h-[80px]"
            placeholder="Describe why this hobby or interest is meaningful to you"
            maxLength={500}
          />
          <div className="text-xs text-secondary text-right">
            {hobbiesHook.form.narrative.length}/500 characters
          </div>
        </div>
        <FileUpload
          id="hobbies-file-upload"
          filePreview={hobbiesHook.form.filePreview}
          error={hobbiesFileError}
          onChange={handleHobbiesFileChange}
          onError={setHobbiesFileError}
        />
      </FormDialog>
    </div>
  );
}
