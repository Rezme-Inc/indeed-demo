import React, { useState, useEffect } from "react";
import { englishOptions, otherLanguages, socialFields } from "../constants";
import { Introduction } from "../types";
import { FormDialog } from "../components/FormDialog";
import { RecordItem } from "../components/RecordItem";
import { supabase } from "@/lib/supabase";
import { saveToSupabase } from "../utils/saveToSupabase";

interface IntroductionSectionProps {
  formData: Introduction | null;
  onChange: (updates: Partial<Introduction> | null) => void;
  onDelete?: () => void;
  onSaveToSupabase?: (data: Introduction) => Promise<void>;
}

export const IntroductionSection: React.FC<IntroductionSectionProps> = ({
  formData,
  onChange,
  onSaveToSupabase,
}) => {
  const [occupationInput, setOccupationInput] = useState("");
  const [occupations, setOccupations] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [activePlatforms, setActivePlatforms] = useState<string[]>(() =>
    socialFields.filter(f => (formData as any)[f.name]).map(f => f.name)
  );
  const [showForm, setShowForm] = useState(false);
  const [localForm, setLocalForm] = useState<Introduction>(
    formData || {
      facebookUrl: "",
      linkedinUrl: "",
      redditUrl: "",
      digitalPortfolioUrl: "",
      instagramUrl: "",
      githubUrl: "",
      tiktokUrl: "",
      pinterestUrl: "",
      twitterUrl: "",
      personalWebsiteUrl: "",
      handshakeUrl: "",
      preferredOccupation: "",
      personalNarrative: "",
      languageProficiency: "No Proficiency",
      otherLanguages: [],
    }
  );
  const [narrativeTouched, setNarrativeTouched] = useState(false);
  const details: string[] = [];
  if (formData) {
    // Preferred Occupation
    if (formData.preferredOccupation) {
      details.push(`Preferred Occupation: ${formData.preferredOccupation}`)
    }

    // Social media URLs
    for (const field of socialFields) {
      const value = (formData as any)[field.name];
      if (value && value.trim() !== "") {
        // Use a cleaned-up label for display (remove 'Enter your ' and ' URL')
        const label = field.label.replace(/^Enter your /, '').replace(/ URL$/, '');
        details.push(`${label}: ${value}`);
      }
    }

    // Language proficiency
    console.log("formData", formData)
    if (formData.languageProficiency && formData.languageProficiency !== "No Proficiency") {
      let langString = `English: ${formData.languageProficiency}`;
      if (formData.otherLanguages && formData.otherLanguages.length > 0) {
        langString += ` | ${formData.otherLanguages.join(", ")}`;
      }
      details.push(langString);
    }
  }

  // Helper function to check if introduction has meaningful content
  const hasIntroductionContent = (data: Introduction | null): boolean => {
    if (!data) return false;
    return !!(data.personalNarrative?.trim());
  };

  // Reset form when editing is cancelled or closed
  useEffect(() => {
    if (!showForm) {
      setNarrativeTouched(false);
    }
  }, [showForm]);

  // Open for add or edit
  const handleOpen = () => {
    setLocalForm(
      formData || {
        facebookUrl: "",
        linkedinUrl: "",
        redditUrl: "",
        digitalPortfolioUrl: "",
        instagramUrl: "",
        githubUrl: "",
        tiktokUrl: "",
        pinterestUrl: "",
        twitterUrl: "",
        personalWebsiteUrl: "",
        handshakeUrl: "",
        preferredOccupation: "",
        personalNarrative: "",
        languageProficiency: "No Proficiency",
        otherLanguages: [],
      }
    );
    setShowForm(true);
  };

  // Delete introduction from Supabase and local state
  const handleDeleteIntroduction = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      // Delete from Supabase
      const { error: deleteError } = await supabase
        .from("introduction")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) {
        console.error("Error deleting introduction:", deleteError);
        return;
      }

      // Update local state immediately for responsive UI
      onChange(null);

      // Verify deletion by checking if record still exists
      const { data: verifyData, error: verifyError } = await supabase
        .from("introduction")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (verifyError && verifyError.code === 'PGRST116') {
        // PGRST116 means no rows returned, which is expected after deletion
        console.log("Introduction successfully deleted from database");
      } else if (verifyError) {
        console.error("Error verifying deletion:", verifyError);
        return;
      } else if (verifyData) {
        // Record still exists, something went wrong
        console.error("Introduction still exists after deletion attempt");
        return;
      }

      // Success - ensure UI is updated
      console.log("Introduction deleted successfully");
      
      // Double-check that local state is cleared
      onChange(null);

    } catch (error) {
      console.error("Unexpected error in handleDeleteIntroduction:", error);
    }
  };

  // Form field change handler
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setLocalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPlatform = () => {
    if (selectedPlatform && !activePlatforms.includes(selectedPlatform)) {
      setActivePlatforms([...activePlatforms, selectedPlatform]);
      setSelectedPlatform("");
    }
  };

  const handleRemovePlatform = (platform: string) => {
    setActivePlatforms(activePlatforms.filter(p => p !== platform));
    onChange({ [platform]: "" });
  };

  // Add handlers for occupation input
  const handleOccupationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOccupationInput(e.target.value);
  };

  const handleOccupationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && occupationInput.trim()) {
      setLocalForm((prev) => ({ ...prev, preferredOccupation: occupationInput.trim() }));
      setOccupationInput("");
      e.preventDefault();
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-semibold text-black">Introduction</h2>
        {hasIntroductionContent(formData) || showForm ? (
          <div className="px-4 py-5" style={{ minWidth: 92 }} aria-hidden="true" />
        ) : (
          <button
            type="button"
            className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            onClick={handleOpen}
          >
            ADD
          </button>
        )}
      </div>
      <p className="mb-6 text-secondary">
        Your introduction sets the stage for your restorative record. Share your background, aspirations, and language skills. This helps others understand your journey and goals.
      </p>

      {/* Show summary card if introduction has meaningful content */}
      {hasIntroductionContent(formData) && formData && (
        <div className="mb-6">
          <RecordItem
            title={`Preview`}
            subtitle={undefined}
            details={details}
            narrative={formData.personalNarrative}
            onEdit={handleOpen}
            onDelete={handleDeleteIntroduction}
          />
        </div>
      )}

      {/* Form Dialog for Add/Edit */}
      <FormDialog
        isOpen={showForm}
        title={formData ? "Edit Introduction" : "Add Introduction"}
        onClose={() => {
          setShowForm(false);
          setNarrativeTouched(false);
        }}
        onSubmit={async (e) => {
          e.preventDefault();
          setNarrativeTouched(true);
          setShowForm(false);
          if (onSaveToSupabase) {
            await onSaveToSupabase(localForm);
          }
        }}
        submitText="Introduction"
        isEditing={!!formData}
      >
        {/* Social Media Profiles */}
        <div className="mb-6">
          <h3 className="font-medium text-black mb-3">Social Media Profiles</h3>
          <div className="flex gap-2 mb-4">
            <select
              value={selectedPlatform}
              onChange={e => setSelectedPlatform(e.target.value)}
              className={`border border-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${selectedPlatform ? 'text-black' : 'text-gray-400'}`}
            >
              <option value="" disabled className="text-gray-400">Select a platform...</option>
              {socialFields
                .filter(f => !activePlatforms.includes(f.name))
                .map(field => (
                  <option key={field.name} value={field.name} className="text-black">
                    {field.label}
                  </option>
                ))}
            </select>
            <button
              type="button"
              onClick={handleAddPlatform}
              disabled={!selectedPlatform}
              className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
            >
              Add
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePlatforms.map(platform => {
              const field = socialFields.find(f => f.name === platform);
              return (
                <div key={platform} className="flex flex-col gap-1">
                  <span className="font-medium text-black mb-1">{field?.label}</span>
                  <div className="flex items-center gap-2">
                    <input
                      name={platform}
                      value={(localForm as any)[platform] || ""}
                      onChange={handleInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder={field?.text || field?.label}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePlatform(platform)}
                      className="text-gray-400 hover:text-red-500 text-lg font-bold px-2"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Preferred Occupation */}
        <div className="mb-6">
          <h3 className="font-medium text-black mb-3">Preferred Occupation</h3>
          <input
            type="text"
            value={occupationInput}
            onChange={handleOccupationInput}
            onKeyDown={handleOccupationKeyDown}
            className="border border-gray-200 px-4 py-2 rounded-lg w-full mb-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Type occupation and press Enter"
          />
          {localForm.preferredOccupation && (
            <div className="mt-2">
              <span className="inline-block bg-primary/10 text-primary rounded px-3 py-1 text-sm font-medium">
                {localForm.preferredOccupation}
              </span>
            </div>
          )}
        </div>

        {/* Personal Narrative */}
        <div className="mb-6">
          <label className="block font-medium text-black mb-2">
            Personal Narrative <span className="text-primary">*</span>
          </label>
          <textarea
            name="personalNarrative"
            value={localForm.personalNarrative}
            onChange={(e) => {
              handleInputChange(e);
              setNarrativeTouched(true);
            }}
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Tell us about yourself..."
            rows={4}
            required
            maxLength={500}
          />
          <div className="text-xs text-secondary text-right mt-1">
            {localForm.personalNarrative.length}/500 characters
          </div>
        </div>
        {/* Language */}
        <div className="mb-6">
          <label className="block font-medium text-black mb-2">
            English Proficiency <span className="text-primary">*</span>
          </label>
          <div className="flex flex-col gap-2 mt-2">
            {englishOptions.map((opt) => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="languageProficiency"
                  value={opt}
                  checked={localForm.languageProficiency === opt}
                  onChange={handleInputChange}
                  className="accent-primary"
                  required
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <label className="block font-medium text-black mb-2">
            Other Languages
          </label>
          <select
            name="otherLanguages"
            value={localForm.otherLanguages.join(", ")}
            onChange={(e) => {
              const languages = e.target.value
                .split(",")
                .map((lang) => lang.trim())
                .filter(Boolean);
              setLocalForm((prev) => ({ ...prev, otherLanguages: languages }));
            }}
            className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            <option value="">Select a language...</option>
            {otherLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </FormDialog>
    </div>
  );
};
