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
  const handleEdit = () => {
    onEdit();
    // Scroll to the form after a small delay to ensure it's rendered
    setTimeout(() => {
      // Find the form dialog in the current section and scroll to it
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
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium text-black">{title}</h4>
          {subtitle && <p className="text-sm text-secondary">{subtitle}</p>}
          {details.map((detail, index) => {
            // Check if this detail is a URL (starts with "URL:")
            if (detail.startsWith("URL: ")) {
              const url = detail.replace("URL: ", "");
              // Ensure URL has a protocol for proper linking
              const fullUrl = url.startsWith("http://") || url.startsWith("https://") 
                ? url 
                : `https://${url}`;
              return (
                <p key={index} className="text-sm text-secondary">
                  URL:{" "}
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-red-600 underline transition-colors"
                  >
                    {url}
                  </a>
                </p>
              );
            }
            return (
              <p key={index} className="text-sm text-secondary">
                {detail}
              </p>
            );
          })}
          {narrative && <p className="text-sm mt-2 text-black">{narrative}</p>}
        </div>
        <div className="flex gap-2 ml-4">
          <button
            type="button"
            onClick={handleEdit}
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
