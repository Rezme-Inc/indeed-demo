import React from "react";

interface FormDialogProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  submitText?: string;
  isEditing?: boolean;
}

export const FormDialog: React.FC<FormDialogProps> = ({
  isOpen,
  title,
  onClose,
  onSubmit,
  children,
  submitText = "Save",
  isEditing = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-black">{title}</h3>
        <button
          type="button"
          className="text-2xl text-secondary hover:text-black transition-colors"
          onClick={onClose}
        >
          &times;
        </button>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        {children}
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            {isEditing ? `Update ${submitText}` : `Save ${submitText}`}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-secondary font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
