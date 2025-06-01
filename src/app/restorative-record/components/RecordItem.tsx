import React from "react";

interface RecordItemProps {
  title: string;
  subtitle?: string;
  details?: string[];
  narrative?: string;
  onEdit: () => void;
  onDelete: () => void;
}

export const RecordItem: React.FC<RecordItemProps> = ({
  title,
  subtitle,
  details = [],
  narrative,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium text-black">{title}</h4>
          {subtitle && <p className="text-sm text-secondary">{subtitle}</p>}
          {details.map((detail, index) => (
            <p key={index} className="text-sm text-secondary">
              {detail}
            </p>
          ))}
          {narrative && <p className="text-sm mt-2 text-black">{narrative}</p>}
        </div>
        <div className="flex gap-2 ml-4">
          <button
            type="button"
            onClick={onEdit}
            className="text-primary hover:text-red-600 font-medium text-sm transition-colors"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-primary hover:text-red-600 font-medium text-sm transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
