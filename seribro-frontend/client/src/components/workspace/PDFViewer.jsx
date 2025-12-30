// src/components/workspace/PDFViewer.jsx
// Sub-Phase 5.4.5: PDF Viewer Component

import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
} from 'lucide-react';

const PDFViewer = ({ isOpen, pdfUrl, pdfTitle, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);

  if (!isOpen) {
    return null;
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLoadSuccess = (pdf) => {
    setTotalPages(pdf.numPages);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-gray-200 truncate">
            {pdfTitle || 'PDF'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center overflow-auto bg-gray-800/50">
          <iframe
            src={`${pdfUrl}#page=${currentPage}`}
            title={pdfTitle || 'PDF'}
            className="w-full h-full border-0"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center top',
            }}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 bg-gray-800/50 p-4 space-y-3">
          {/* Page Navigation */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-sm text-gray-400 min-w-[100px] text-center">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom and Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleZoomOut}
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
                Zoom Out
              </button>
              <span className="text-sm text-gray-400 min-w-[60px] text-center">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
                Zoom In
              </button>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={pdfUrl}
                download={pdfTitle || 'document.pdf'}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-500 rounded hover:bg-blue-500/30 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-yellow-500/20 text-yellow-300 border border-yellow-500 rounded hover:bg-yellow-500/30 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
