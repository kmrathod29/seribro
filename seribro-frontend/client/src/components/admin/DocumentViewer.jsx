// src/components/admin/DocumentViewer.jsx
// Modal component for viewing documents (PDF, JPG, PNG) - Phase 3
import React, { useEffect, useState } from 'react';

const DocumentViewer = ({ isOpen, documentUrl, documentName, onClose }) => {
  if (!isOpen) return null;

  const isPDF = documentUrl?.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(documentUrl);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    let mounted = true;
    let objUrl = null;

    const fetchPdfAsBlob = async () => {
      if (!isPDF) return;
      setLoading(true);
      setError(null);
      try {
        // Attempt to fetch the PDF to ensure it's a real PDF and avoid iframe "Failed to load" errors
        const resp = await fetch(documentUrl, { mode: 'cors' });
        if (!resp.ok) {
          throw new Error(`Failed to fetch document: ${resp.status}`);
        }
        const contentType = resp.headers.get('content-type') || '';
        if (!contentType.includes('pdf') && !documentUrl.includes('cloudinary.com')) {
          // If it is not PDF content and not Cloudinary, show error
          throw new Error('Remote resource is not a PDF');
        }
        const blob = await resp.blob();
        objUrl = URL.createObjectURL(blob);
        if (mounted) setBlobUrl(objUrl);
      } catch (err) {
        console.warn('PDF fetch failed:', err);
        if (mounted) setError('Unable to preview PDF. You can download it instead.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (isPDF) fetchPdfAsBlob();

    return () => {
      mounted = false;
      if (objUrl) URL.revokeObjectURL(objUrl);
      setBlobUrl(null);
      setLoading(false);
      setError(null);
    };
  }, [documentUrl, isPDF]);

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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 bg-gradient-to-br from-navy via-navy-light to-navy-dark border-2 border-gold rounded-2xl w-11/12 h-5/6 max-w-5xl flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gold/30">
          <div className="flex items-center gap-3">
            <span className="text-gold">📄</span>
            <h2 className="text-white text-xl font-bold">{documentName || 'Document Viewer'}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleDownload} className="p-2 rounded-lg bg-gold/20 hover:bg-gold/40 text-gold transition-colors duration-300 flex items-center gap-2" title="Download document">
              <span className="text-sm font-medium">Download</span>
            </button>
            <button onClick={onClose} className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors duration-300" title="Close viewer">
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {isPDF ? (
            <div className="w-full h-full rounded-lg overflow-hidden border border-gold/30 flex items-center justify-center">
              {loading && <p className="text-gray-300">Loading preview...</p>}

              {!loading && !error && blobUrl && (
                <iframe src={blobUrl} className="w-full h-full border-none" title="PDF Preview" />
              )}

              {!loading && error && (
                <div className="text-center">
                  <p className="text-red-400 mb-3">{error}</p>
                  <p className="text-sm text-gray-300 mb-4">If the preview fails, try downloading the file.</p>
                  <div className="flex justify-center gap-3">
                    <a href={documentUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-amber-400 text-black rounded font-semibold">Open in new tab</a>
                    <button onClick={handleDownload} className="px-4 py-2 bg-yellow-500 text-navy rounded font-semibold">Download</button>
                  </div>
                </div>
              )}

              {!loading && !blobUrl && !error && (
                // If fetch didn't produce a blob but no error, fallback to iframe with direct URL
                <iframe src={`${documentUrl}#toolbar=1`} className="w-full h-full border-none" title="PDF Viewer" />
              )}
            </div>
          ) : isImage ? (
            <div className="flex items-center justify-center h-full">
              <img src={documentUrl} alt={documentName} className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="bg-yellow-500/20 border-2 border-yellow-500 text-yellow-300 rounded-lg p-8 text-center">
                <p className="text-lg font-semibold mb-2">Document Format Not Supported</p>
                <p className="text-sm mb-4">Supported formats: PDF, JPG, PNG, GIF, WebP</p>
                <button onClick={handleDownload} className="bg-yellow-500 hover:bg-yellow-600 text-navy font-bold px-6 py-2 rounded-lg">Download Instead</button>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gold/30 bg-white/5 backdrop-blur-sm">
          <p className="text-gray-400 text-sm">Document: <span className="text-gray-300 font-semibold">{documentName || 'Unknown'}</span></p>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
