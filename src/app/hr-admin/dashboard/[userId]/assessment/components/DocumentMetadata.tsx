import React from "react";

interface DocumentMetadataProps {
  sentDate: string | Date;
  hrAdminName: string;
  companyName: string;
  candidateId: string;
}

const DocumentMetadata: React.FC<DocumentMetadataProps> = ({
  sentDate,
  hrAdminName,
  companyName,
  candidateId,
}) => {
  return (
    <div className="mt-8 pt-6 border-t border-gray-200 bg-gray-50 rounded-xl p-4">
      <h3
        className="text-lg font-semibold mb-3 text-black"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        Document Information
      </h3>
      <div
        className="grid grid-cols-2 gap-4 text-sm"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <div>
          <span className="font-medium text-black">Sent Date:</span>{" "}
          <span style={{ color: "#595959" }}>
            {new Date(sentDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div>
          <span className="font-medium text-black">Sent By:</span>{" "}
          <span style={{ color: "#595959" }}>{hrAdminName}</span>
        </div>
        <div>
          <span className="font-medium text-black">Company:</span>{" "}
          <span style={{ color: "#595959" }}>{companyName}</span>
        </div>
        <div>
          <span className="font-medium text-black">Candidate ID:</span>{" "}
          <span style={{ color: "#595959" }}>{candidateId}</span>
        </div>
      </div>
    </div>
  );
};

export default DocumentMetadata;
