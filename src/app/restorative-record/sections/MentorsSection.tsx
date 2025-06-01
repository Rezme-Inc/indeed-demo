import { FormDialog } from "../components/FormDialog";
import { RecordItem } from "../components/RecordItem";
import { useFormCRUD } from "../hooks/useFormCRUD";
import { Mentor } from "../types";

interface MentorsSectionProps {
  mentorHook: ReturnType<typeof useFormCRUD<Omit<Mentor, "id">>>;
}

export function MentorsSection({ mentorHook }: MentorsSectionProps) {
  return (
    <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-semibold text-black">
          Mentors & Recommendations
        </h2>
        <button
          type="button"
          className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          onClick={mentorHook.handleFormOpen}
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
              onEdit={() => mentorHook.handleEdit(mentor.id)}
              onDelete={() => mentorHook.handleDelete(mentor.id)}
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
          mentorHook.handleSave();
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
