// src/components/workspace/ImageModal.jsx
// Sub-Phase 5.4.5: Image Viewer Modal

import React from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

const ImageModal = ({ isOpen, imageUrl, imageTitle, onClose }) => {
  const [zoom, setZoom] = React.useState(100);

  if (!isOpen) {
    return null;
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
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
            {imageTitle || 'Image'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center overflow-auto">
          <img
            src={imageUrl}
            alt={imageTitle || 'Image'}
            style={{ width: `${zoom}%` }}
            className="transition-all duration-200"
          />
        </div>

        {/* Footer with zoom controls */}
        <div className="flex items-center justify-between p-4 border-t border-gray-700 bg-gray-800/50">
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
          <button
            onClick={onClose}
            className="px-4 py-2 bg-yellow-500/20 text-yellow-300 border border-yellow-500 rounded hover:bg-yellow-500/30 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
