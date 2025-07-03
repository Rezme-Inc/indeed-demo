'use client';

import React from 'react';

interface PrintPreviewButtonProps {
  documentSelector: string;       // CSS selector for the document (e.g., '.prose', '#revocation')
  documentTitle: string;          // Used for PDF filename (e.g., 'Revocation Notice')
}

export default function PrintPreviewButton({ documentSelector, documentTitle }: PrintPreviewButtonProps) {
  const handlePreview = async () => {
    const element = document.querySelector(documentSelector);
    if (element) {
      const html2pdf = (await import('html2pdf.js')).default;

      const opt = {
        margin: 0.5,
        filename: `${documentTitle.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // Generate blob
      const worker = html2pdf().set(opt).from(element);
      const pdfBlob = await worker.outputPdf('blob');

      // Open in new tab
      const blobUrl = URL.createObjectURL(pdfBlob);
      window.open(blobUrl, '_blank');
    } else {
      console.error(`Element not found: ${documentSelector}`);
    }
  };

  return (
    <button
      type="button"
      className="px-6 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-200 flex items-center gap-2"
      style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
      onClick={handlePreview}
    >
      Print/Save
    </button>
  );
}
