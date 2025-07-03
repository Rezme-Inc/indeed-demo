import { DatePickerField } from "../components/DatePicker";
import { FileUpload } from "../components/FileUpload";
import { FormDialog } from "../components/FormDialog";
import { RecordItem } from "../components/RecordItem";
import { useFormCRUD } from "../hooks/useFormCRUD";
import { Education } from "../types";
import { formatDateForDisplay, formatDateForInput } from "../utils";
import { useEffect } from "react";

interface EducationSectionProps {
  educationHook: ReturnType<typeof useFormCRUD<Omit<Education, "id">>>;
  handleEducationFileChange: (file: File | null) => void;
  educationFileError: string;
  setEducationFileError: (error: string) => void;
  onChange?: () => void;
}

export function EducationSection({
  educationHook,
  handleEducationFileChange,
  educationFileError,
  setEducationFileError,
  onChange,
}: EducationSectionProps) {
  // Debug: Log items when they change
  useEffect(() => {
    console.log("Education items updated:", educationHook.items.length);
  }, [educationHook.items]);

  const handleSave = () => {
    const result = educationHook.handleSave();
    if (result && onChange) onChange();
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await educationHook.handleDelete(id);
      if (success) {
        // Small delay to ensure state updates are processed
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
    }
  };

  const handleEdit = (id: string) => {
    educationHook.handleEdit(id);
  };

  return (
    <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-semibold text-black">Education</h2>
        <button
          type="button"
          className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          onClick={educationHook.handleFormOpen}
        >
          ADD MORE
        </button>
      </div>
      <p className="mb-4 text-secondary">
        No matter the level—high school, GED, associate's degree, all the way up
        to a PhD—every educational experience helps tell your story and shows
        the progress you've made.
      </p>
      <p className="mb-6 text-secondary">
        Be sure to include any education you completed while incarcerated or
        through an alternative-to-incarceration program—these experiences
        demonstrate your commitment to growth and learning in challenging
        circumstances.
      </p>

      {/* List of educations */}
      {educationHook.items.length > 0 && (
        <div className="mb-6 space-y-4">
          {educationHook.items.map((education: Education & { id: string }) => (
            <RecordItem
              key={education.id}
              title={`${education.degree} in ${education.field}`}
              subtitle={`${education.school} • ${education.location}`}
              details={[
                `${formatDateForDisplay(education.startDate)} - ${
                  education.currentlyEnrolled
                    ? "Present"
                    : formatDateForDisplay(education.endDate)
                }`,
                education.grade ? `Grade: ${education.grade}` : "",
              ].filter(Boolean)}
              narrative={education.description}
              onEdit={() => handleEdit(education.id)}
              onDelete={() => handleDelete(education.id)}
            />
          ))}
        </div>
      )}

      {/* Education form */}
      <FormDialog
        isOpen={educationHook.showForm}
        title={educationHook.editingId ? "Edit Education" : "Add Education"}
        onClose={educationHook.handleFormClose}
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        submitText="Education"
        isEditing={!!educationHook.editingId}
      >
        <div>
          <label className="block font-medium mb-1">School's Name *</label>
          <input
            value={educationHook.form.school}
            onChange={(e) =>
              educationHook.updateForm({ school: e.target.value })
            }
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter the name of your school"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">School's location *</label>
          <input
            value={educationHook.form.location}
            onChange={(e) =>
              educationHook.updateForm({ location: e.target.value })
            }
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter your school's location"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Degree *</label>
          <input
            value={educationHook.form.degree}
            onChange={(e) =>
              educationHook.updateForm({ degree: e.target.value })
            }
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter the degree you obtained"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Field of Study *</label>
          <input
            value={educationHook.form.field}
            onChange={(e) =>
              educationHook.updateForm({ field: e.target.value })
            }
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter your field of study"
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={educationHook.form.currentlyEnrolled}
            onChange={(e) =>
              educationHook.updateForm({
                currentlyEnrolled: e.target.checked,
              })
            }
            className="accent-red-500"
          />
          <label className="font-medium">I am currently enrolled here</label>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <DatePickerField
              label="Start Date"
              value={educationHook.form.startDate}
              onChange={(date) =>
                educationHook.updateForm({
                  startDate: formatDateForInput(date),
                })
              }
              required
            />
          </div>
          <div className="flex-1">
            <DatePickerField
              label={`End Date${
                !educationHook.form.currentlyEnrolled ? " *" : ""
              }`}
              value={educationHook.form.endDate}
              onChange={(date) =>
                educationHook.updateForm({
                  endDate: formatDateForInput(date),
                })
              }
              disabled={educationHook.form.currentlyEnrolled}
            />
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Grade</label>
          <input
            value={educationHook.form.grade}
            onChange={(e) =>
              educationHook.updateForm({ grade: e.target.value })
            }
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter your grade"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">
            Description of the experience
          </label>
          <textarea
            value={educationHook.form.description}
            onChange={(e) =>
              educationHook.updateForm({ description: e.target.value })
            }
            className="border p-2 rounded w-full min-h-[80px]"
            placeholder="Summarize your education, degrees, and relevant coursework. Highlight how your academic experience prepares you to contribute to the organization's goals"
            maxLength={700}
          />
          <div className="text-xs text-secondary text-right">
            {educationHook.form.description.length}/700 characters
          </div>
        </div>
        <FileUpload
          id="education-file-upload"
          filePreview={educationHook.form.filePreview}
          error={educationFileError}
          onChange={handleEducationFileChange}
          onError={setEducationFileError}
          fileName={educationHook.form.fileName}
          fileSize={educationHook.form.fileSize}
        />
      </FormDialog>
    </div>
  );
}
