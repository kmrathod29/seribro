// src/components/admin/DocumentViewer.jsx
// Modal component for viewing documents (PDF, JPG, PNG) - Phase 3
import React from 'react';
import { X, Download, Eye } from 'lucide-react';

const DocumentViewer = ({ isOpen, documentUrl, documentName, onClose }) => {
  if (!isOpen) return null;

  const isPDF = documentUrl?.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(documentUrl);

  const handleDownload = () => {
    if (documentUrl) {
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = documentName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Hinglish: Black overlay with semi-transparent backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Container - Matching theme colors */}
      <div className="relative z-10 bg-gradient-to-br from-navy via-navy-light to-navy-dark border-2 border-gold rounded-2xl w-11/12 h-5/6 max-w-5xl flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gold/30">
          <div className="flex items-center gap-3">
            <Eye className="text-gold" size={24} />
            <h2 className="text-white text-xl font-bold">{documentName || 'Document Viewer'}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg bg-gold/20 hover:bg-gold/40 text-gold transition-colors duration-300 flex items-center gap-2"
              title="Download document"
            >
              <Download size={20} />
              <span className="text-sm font-medium">Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors duration-300"
              title="Close viewer"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {isPDF ? (
            // Hinglish: PDF display ke liye iframe
            <div className="w-full h-full rounded-lg overflow-hidden border border-gold/30">
              <iframe
                src={`${documentUrl}#toolbar=1`}
                className="w-full h-full border-none"
                title="PDF Viewer"
              />
            </div>
          ) : isImage ? (
            // Hinglish: Image display ke liye img tag with responsive sizing
            <div className="flex items-center justify-center h-full">
              <img
                src={documentUrl}
                alt={documentName}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            </div>
          ) : (
            // Hinglish: Agar format support nahi hai
            <div className="flex items-center justify-center h-full">
              <div className="bg-yellow-500/20 border-2 border-yellow-500 text-yellow-300 rounded-lg p-8 text-center">
                <p className="text-lg font-semibold mb-2">Document Format Not Supported</p>
                <p className="text-sm mb-4">Supported formats: PDF, JPG, PNG, GIF, WebP</p>
                <button
                  onClick={handleDownload}
                  className="bg-yellow-500 hover:bg-yellow-600 text-navy font-bold px-6 py-2 rounded-lg transition-colors duration-300"
                >
                  Download Instead
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Info */}
        <div className="px-6 py-4 border-t border-gold/30 bg-white/5 backdrop-blur-sm">
          <p className="text-gray-400 text-sm">
            Document: <span className="text-gray-300 font-semibold">{documentName || 'Unknown'}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
