import { FileUpload } from "../components/FileUpload";
import { FormDialog } from "../components/FormDialog";
import { RecordItem } from "../components/RecordItem";
import { hardSkillsOptions, softSkillsOptions } from "../constants";
import { useFormCRUD } from "../hooks/useFormCRUD";
import { Skill } from "../types";
import { supabase } from "@/lib/supabase";

interface SkillsSectionProps {
  skillsHook: ReturnType<typeof useFormCRUD<Omit<Skill, "id">>>;
  handleSkillsFileChange: (file: File | null) => void;
  skillsFileError: string;
  setSkillsFileError: (error: string) => void;
}

export function SkillsSection({
  skillsHook,
  handleSkillsFileChange,
  skillsFileError,
  setSkillsFileError,
}: SkillsSectionProps) {
  // Delete skill from Supabase and local state
  const handleDeleteSkill = async (id: string) => {
    // Remove from Supabase
    await supabase.from("skills").delete().eq("id", id);
    // Remove from local state
    skillsHook.handleDelete(id);
    // Optionally, refresh from Supabase to ensure sync
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: skillsData } = await supabase
        .from("skills")
        .select("*")
        .eq("user_id", user.id);
      if (skillsData && Array.isArray(skillsData)) {
        const mappedSkills = skillsData.map((remote) => ({
          id: remote.id,
          softSkills: Array.isArray(remote.soft_skills) ? remote.soft_skills.join(", ") : "",
          hardSkills: Array.isArray(remote.hard_skills) ? remote.hard_skills.join(", ") : "",
          otherSkills: remote.other_skills || "",
          file: null,
          filePreview: remote.file_url || "",
          narrative: remote.narrative || "",
        }));
        skillsHook.setItems(mappedSkills);
      }
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-semibold text-black">Skills</h2>
        <button
          type="button"
          className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          onClick={skillsHook.handleFormOpen}
        >
          ADD MORE
        </button>
      </div>
      <p className="mb-6 text-secondary">
        Your skills—both hard and soft—are a key part of your story. List any
        abilities, talents, or expertise you've developed through work,
        education, volunteering, or personal experience. Don't forget to include
        skills gained during incarceration or through self-study. These show
        your readiness and value to future employers.
      </p>

      {/* List of skills */}
      {skillsHook.items.length > 0 && (
        <div className="mb-6 space-y-4">
          {skillsHook.items.map((skill: Skill & { id: string }) => (
            <RecordItem
              key={skill.id}
              title="Skills Set"
              details={[
                `Soft Skills: ${skill.softSkills}`,
                `Hard Skills: ${skill.hardSkills}`,
                skill.otherSkills ? `Other Skills: ${skill.otherSkills}` : "",
              ].filter(Boolean)}
              narrative={skill.narrative}
              onEdit={() => skillsHook.handleEdit(skill.id)}
              onDelete={() => handleDeleteSkill(skill.id)}
            />
          ))}
        </div>
      )}

      {/* Skills form */}
      <FormDialog
        isOpen={skillsHook.showForm}
        title={skillsHook.editingId ? "Edit Skills" : "Add Skills"}
        onClose={skillsHook.handleFormClose}
        onSubmit={(e) => {
          e.preventDefault();
          skillsHook.handleSave();
        }}
        submitText="Skills"
        isEditing={!!skillsHook.editingId}
      >
        <div>
          <label className="block font-medium mb-1">Soft Skills *</label>
          <select
            value={skillsHook.form.softSkills}
            onChange={(e) =>
              skillsHook.updateForm({ softSkills: e.target.value })
            }
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            required
          >
            <option value="">
              Select your Soft Skills from the options below
            </option>
            {softSkillsOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Hard Skills *</label>
          <select
            value={skillsHook.form.hardSkills}
            onChange={(e) =>
              skillsHook.updateForm({ hardSkills: e.target.value })
            }
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            required
          >
            <option value="">
              Select your Hard Skills from the options below
            </option>
            {hardSkillsOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Other Skills</label>
          <textarea
            value={skillsHook.form.otherSkills}
            onChange={(e) =>
              skillsHook.updateForm({ otherSkills: e.target.value })
            }
            className="border p-2 rounded w-full min-h-[60px]"
            placeholder="List any additional skills not covered above"
            maxLength={500}
          />
          <div className="text-xs text-secondary text-right">
            {skillsHook.form.otherSkills.length}/500 characters
          </div>
        </div>
        <FileUpload
          id="skills-file-upload"
          filePreview={skillsHook.form.filePreview}
          error={skillsFileError}
          onChange={handleSkillsFileChange}
          onError={setSkillsFileError}
        />
        <div>
          <label className="block font-medium mb-1">Narrative</label>
          <textarea
            value={skillsHook.form.narrative}
            onChange={(e) =>
              skillsHook.updateForm({ narrative: e.target.value })
            }
            className="border p-2 rounded w-full min-h-[80px]"
            placeholder="Provide a narrative about your skills. Describe how you developed them, their significance, and how they have helped you."
            maxLength={500}
          />
          <div className="text-xs text-secondary text-right">
            {skillsHook.form.narrative.length}/500 characters
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
