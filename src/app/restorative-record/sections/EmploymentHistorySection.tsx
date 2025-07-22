import { DatePickerField } from "../components/DatePicker";
import { FormDialog } from "../components/FormDialog";
import { RecordItem } from "../components/RecordItem";
import { employmentTypeOptions, usStates } from "../constants";
import { useFormCRUD } from "../hooks/useFormCRUD";
import { Employment } from "../types";
import { formatDateForDisplay, formatDateForInput } from "../utils";
import { useEffect } from "react";

interface EmploymentHistorySectionProps {
  employmentHook: ReturnType<typeof useFormCRUD<Omit<Employment, "id">>>;
  onChange?: () => void;
}

export function EmploymentHistorySection({
  employmentHook,
  onChange,
}: EmploymentHistorySectionProps) {
  // Debug: Log items when they change
  useEffect(() => {
    console.log("Employment items updated:", employmentHook.items.length);
  }, [employmentHook.items]);

  const handleSave = () => {
    const result = employmentHook.handleSave();
    if (result && onChange) onChange();
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await employmentHook.handleDelete(id);
      if (success) {
        // Small delay to ensure state updates are processed
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
    }
  };

  const handleEdit = (id: string) => {
    employmentHook.handleEdit(id);
  };

  // Handle ADD MORE button with scroll functionality
  const handleAddMore = () => {
    employmentHook.handleFormOpen();
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
        <h2 className="text-2xl font-semibold text-black mb-2 md:mb-0">
          Employment History
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
        Share your employment profile with us at Restorative Records.
      </p>

      {/* List of employments */}
      {employmentHook.items.length > 0 && (
        <div className="mb-6 space-y-4">
          {employmentHook.items.map(
            (employment: Employment & { id: string }) => (
              <RecordItem
                key={employment.id}
                title={employment.title}
                subtitle={`${employment.company} • ${employment.employmentType}`}
                details={[
                  employment.city || employment.state
                    ? `${employment.city}${
                        employment.city && employment.state ? ", " : ""
                      }${employment.state}`
                    : "",
                  `${formatDateForDisplay(employment.startDate)} - ${
                    employment.currentlyEmployed
                      ? "Present"
                      : formatDateForDisplay(employment.endDate)
                  }`,
                  employment.employedWhileIncarcerated
                    ? "Employed while incarcerated"
                    : "",
                ].filter(Boolean)}
                onEdit={() => handleEdit(employment.id)}
                onDelete={() => handleDelete(employment.id)}
              />
            )
          )}
        </div>
      )}

      {/* Employment form */}
      <FormDialog
        isOpen={employmentHook.showForm}
        title={
          employmentHook.editingId
            ? "Edit Employment"
            : "Add Employment Information"
        }
        onClose={employmentHook.handleFormClose}
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        submitText="Employment"
        isEditing={!!employmentHook.editingId}
      >
        <div>
          <label className="block font-medium mb-1">State</label>
          <select
            value={employmentHook.form.state}
            onChange={(e) =>
              employmentHook.updateForm({ state: e.target.value })
            }
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            <option value="">Select state</option>
            {usStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">City</label>
          <input
            value={employmentHook.form.city}
            onChange={(e) =>
              employmentHook.updateForm({ city: e.target.value })
            }
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter city"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Employment Type *</label>
          <select
            value={employmentHook.form.employmentType}
            onChange={(e) =>
              employmentHook.updateForm({
                employmentType: e.target.value,
              })
            }
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            required
          >
            <option value="">Select employment type</option>
            {employmentTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Title/Position *</label>
          <input
            value={employmentHook.form.title}
            onChange={(e) =>
              employmentHook.updateForm({ title: e.target.value })
            }
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter your title or position"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Company *</label>
          <input
            value={employmentHook.form.company}
            onChange={(e) =>
              employmentHook.updateForm({ company: e.target.value })
            }
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter company name"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Company URL</label>
          <input
            value={employmentHook.form.companyUrl}
            onChange={(e) =>
              employmentHook.updateForm({ companyUrl: e.target.value })
            }
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="https://www.company.com"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <DatePickerField
              label="Start Date"
              value={employmentHook.form.startDate}
              onChange={(date) =>
                employmentHook.updateForm({
                  startDate: formatDateForInput(date),
                })
              }
              required
            />
          </div>
          <div className="flex-1">
            <DatePickerField
              label="End Date"
              value={employmentHook.form.endDate}
              onChange={(date) =>
                employmentHook.updateForm({
                  endDate: formatDateForInput(date),
                })
              }
              disabled={employmentHook.form.currentlyEmployed}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={employmentHook.form.currentlyEmployed}
            onChange={(e) =>
              employmentHook.updateForm({
                currentlyEmployed: e.target.checked,
              })
            }
            className="accent-red-500"
          />
          <label className="font-medium">
            I am currently employed at this job
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={employmentHook.form.employedWhileIncarcerated}
            onChange={(e) =>
              employmentHook.updateForm({
                employedWhileIncarcerated: e.target.checked,
              })
            }
            className="accent-red-500"
          />
          <label className="font-medium">
            I was employed in this role while I was incarcerated
          </label>
        </div>
      </FormDialog>
    </div>
  );
}
