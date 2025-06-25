import React, { useState } from "react";
import { englishOptions, otherLanguages, socialFields } from "../constants";
import { Introduction } from "../types";

interface IntroductionSectionProps {
  formData: Introduction;
  onChange: (updates: Partial<Introduction>) => void;
  onDelete?: () => void;
}

export const IntroductionSection: React.FC<IntroductionSectionProps> = ({
  formData,
  onChange,
  onDelete,
}) => {
  const [occupationInput, setOccupationInput] = useState("");
  const [occupations, setOccupations] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [activePlatforms, setActivePlatforms] = useState<string[]>(() =>
    socialFields.filter(f => (formData as any)[f.name]).map(f => f.name)
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleOccupationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOccupationInput(e.target.value);
  };

  const handleOccupationKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && occupationInput.trim()) {
      e.preventDefault();
      setOccupations((prev) => [...prev, occupationInput.trim()]);
      onChange({ preferredOccupation: occupationInput.trim() });
      setOccupationInput("");
    }
  };

  const handleRemoveOccupation = (idx: number) => {
    setOccupations((prev) => prev.filter((_, i) => i !== idx));
    if (idx === 0) {
      onChange({ preferredOccupation: "" });
    }
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

  return (
    <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-semibold text-black mb-2">Introduction</h2>
      <p className="mb-6 text-secondary">
        Welcome to the Introduction section. Here, you can share your preferred
        occupations, personal narrative, and language proficiency. This
        information helps us understand your background and aspirations, setting
        the foundation for your restorative record.
      </p>

      {onDelete && (
        <button
          type="button"
          className="mb-10 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          onClick={onDelete}
        >
          Delete Introduction
        </button>
      )}

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
                    value={(formData as any)[platform] || ""}
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
        {formData.preferredOccupation && (
          <div className="mt-2">
            <span className="inline-block bg-primary/10 text-primary rounded px-3 py-1 text-sm font-medium">
              {formData.preferredOccupation}
            </span>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {occupations.map((occ, idx) => (
            <span
              key={idx}
              className="bg-gray-100 px-3 py-1 rounded-full flex items-center text-sm"
            >
              {occ}
              <button
                type="button"
                onClick={() => handleRemoveOccupation(idx)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="text-xs text-secondary mt-2">
          You can add 10 occupations of your choice
        </div>
      </div>

      {/* Personal Narrative */}
      <div className="mb-6">
        <h3 className="font-medium text-black mb-3">Personal Narrative</h3>
        <textarea
          name="personalNarrative"
          value={formData.personalNarrative}
          onChange={handleInputChange}
          className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          placeholder="Tell us about yourself..."
          rows={4}
        />
      </div>

      {/* Language */}
      <div className="mb-6">
        <h3 className="font-medium text-black mb-3">Language</h3>
        <div className="mb-4">
          <span className="text-primary font-medium mr-1">
            English Proficiency *
          </span>
          <div className="flex flex-col gap-2 mt-2">
            {englishOptions.map((opt) => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="languageProficiency"
                  value={opt}
                  checked={formData.languageProficiency === opt}
                  onChange={handleInputChange}
                  className="accent-primary"
                  required
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <span className="block mb-2 font-medium text-black">
            Other Languages
          </span>
          <select
            name="otherLanguages"
            value={formData.otherLanguages.join(", ")}
            onChange={(e) => {
              const languages = e.target.value
                .split(",")
                .map((lang) => lang.trim())
                .filter(Boolean);
              onChange({ otherLanguages: languages });
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
      </div>
    </div>
  );
};
