import { FormDialog } from "../components/FormDialog";
import { RecordItem } from "../components/RecordItem";
import { useFormCRUD } from "../hooks/useFormCRUD";
import { Mentor } from "../types";
import { useEffect } from "react";

interface MentorsSectionProps {
  mentorHook: ReturnType<typeof useFormCRUD<Omit<Mentor, "id">>>;
  onChange?: () => void;
}

export function MentorsSection({ mentorHook, onChange }: MentorsSectionProps) {
  // Debug: Log items when they change
  useEffect(() => {
    console.log("Mentors items updated:", mentorHook.items.length);
  }, [mentorHook.items]);

  const handleSave = () => {
    const result = mentorHook.handleSave();
    if (result && onChange) onChange();
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await mentorHook.handleDelete(id);
      if (success) {
        // Small delay to ensure state updates are processed
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
    }
  };

  const handleEdit = (id: string) => {
    mentorHook.handleEdit(id);
  };

  // Handle ADD MORE button with scroll functionality
  const handleAddMore = () => {
    mentorHook.handleFormOpen();
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
          Mentors & Recommendations
        </h2>
        <button
          type="button"
          className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          onClick={handleAddMore}
        >
          ADD MORE
        </button>
      </div>
      <p className="mb-4 text-secondary">
        Mentors and recommendations can make a big difference in your journey.
        List anyone who has supported, guided, or advocated for you—whether
        personally, professionally, or during your time in a program. Their
        support helps show your growth, character, and readiness for new
        opportunities.
      </p>
      <p className="mb-6 text-secondary">
        List mentors or advisors who have guided you to amplify your credibility
        and open doors to new opportunities.
      </p>

      {/* List of mentors */}
      {mentorHook.items.length > 0 && (
        <div className="mb-6 space-y-4">
          {mentorHook.items.map((mentor: Mentor & { id: string }) => (
            <RecordItem
              key={mentor.id}
              title={mentor.name}
              subtitle={`${mentor.title} • ${mentor.company}`}
              details={[
                mentor.email ? `Email: ${mentor.email}` : "",
                mentor.phone ? `Phone: ${mentor.phone}` : "",
              ].filter(Boolean)}
              narrative={mentor.narrative}
              onEdit={() => handleEdit(mentor.id)}
              onDelete={() => handleDelete(mentor.id)}
            />
          ))}
        </div>
      )}

      {/* Mentor form */}
      <FormDialog
        isOpen={mentorHook.showForm}
        title={mentorHook.editingId ? "Edit Mentor" : "Add Mentor Information"}
        onClose={mentorHook.handleFormClose}
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        submitText="Mentor"
        isEditing={!!mentorHook.editingId}
      >
        <div>
          <label className="block font-medium mb-1">LinkedIn Profile</label>
          <input
            value={mentorHook.form.linkedin}
            onChange={(e) =>
              mentorHook.updateForm({ linkedin: e.target.value })
            }
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="https://www.linkedin.com/in/mentor-profile"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Name of Mentor *</label>
          <input
            value={mentorHook.form.name}
            onChange={(e) => mentorHook.updateForm({ name: e.target.value })}
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter mentor's full name"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Company *</label>
          <input
            value={mentorHook.form.company}
            onChange={(e) => mentorHook.updateForm({ company: e.target.value })}
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter company name"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Title/Position *</label>
          <input
            value={mentorHook.form.title}
            onChange={(e) => mentorHook.updateForm({ title: e.target.value })}
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter mentor's title or position"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Email address</label>
          <input
            value={mentorHook.form.email}
            onChange={(e) => mentorHook.updateForm({ email: e.target.value })}
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="mentor@example.com"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Phone number</label>
          <input
            value={mentorHook.form.phone}
            onChange={(e) => mentorHook.updateForm({ phone: e.target.value })}
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="(000) 000-0000"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Website</label>
          <input
            value={mentorHook.form.website}
            onChange={(e) => mentorHook.updateForm({ website: e.target.value })}
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="https://example.com"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Narrative</label>
          <textarea
            value={mentorHook.form.narrative}
            onChange={(e) =>
              mentorHook.updateForm({ narrative: e.target.value })
            }
            className="border p-2 rounded w-full min-h-[80px]"
            placeholder="Describe how this mentor supported you, what you learned from them, or why their recommendation is meaningful."
            maxLength={500}
          />
          <div className="text-xs text-secondary text-right">
            {mentorHook.form.narrative.length}/500 characters
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
