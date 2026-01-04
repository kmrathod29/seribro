// src/components/workspace/MessageInput.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Paperclip, Send, X } from 'lucide-react';

const MAX_FILES = 3;
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-zip-compressed',
];

const MessageInput = ({ onSend, disabled, onTypingStart, onTypingStop }) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [localSending, setLocalSending] = useState(false);
  const fileRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Auto expand textarea up to ~5 lines
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const maxHeight = 5 * 24; // approx 5 lines * line-height
    ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
  }, [text]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const combined = [...files, ...selected];
    if (combined.length > MAX_FILES) {
      setError('Max 3 files allowed');
      return;
    }
    const filtered = combined.filter((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        setError(`Invalid file type for ${f.name}`);
        return false;
      }
      if (f.size > MAX_SIZE) {
        setError(`${f.name} exceeds 5MB`);
        return false;
      }
      return true;
    });
    setError('');
    setFiles(filtered);
  };

  const removeFile = (name) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    // Emit typing_start when user starts typing
    if (newText.trim() && onTypingStart) {
      onTypingStart();
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing_stop after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (onTypingStop) {
        onTypingStop();
      }
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Send message on Enter (unless Shift is held)
      e.preventDefault();
      if (!text.trim() && files.length === 0) {
        setError('Add a message or attachment');
        return;
      }
      handleSend();
    }
  };

  const handleSend = async () => {
    // Clear typing timeout and emit typing_stop
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (onTypingStop) {
      onTypingStop();
    }

    if (!text.trim() && files.length === 0) {
      setError('Add a message or attachment');
      return;
    }
    setError('');

    // Prepare payload
    const payload = { text: text.trim(), files };

    // Optimistic UI: clear input and files immediately
    setText('');
    setFiles([]);
    if (fileRef.current) fileRef.current.value = '';

    setLocalSending(true);
    try {
      const res = await onSend(payload);
      if (!res?.success) {
        // On failure, set inline error (no alert)
        setError(res?.message || 'Failed to send message');
        return res;
      }
      // On success: do nothing (optimistic UI already updated)
      return res;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      return { success: false, message: err.message };
    } finally {
      setLocalSending(false);
    }
  };

  const charColor = text.length >= 1900 ? 'text-red-400' : text.length >= 1800 ? 'text-orange-400' : 'text-gray-400';
  const sendDisabled = disabled || localSending || (!text.trim() && files.length === 0);

  return (
    <div className="bg-slate-800/70 border border-white/10 rounded-xl p-4 space-y-3 shadow-lg">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        className="w-full bg-slate-900/70 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-amber-400 min-h-[60px] resize-none"
        maxLength={2000}
        disabled={disabled || localSending}
      />
      <div className="flex items-center justify-between text-xs">
        <span className={`${charColor}`}>{text.length}/2000 characters</span>
        {error && <span className="text-red-400">{error}</span>}
      </div>

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file) => (
            <div
              key={file.name}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-200"
            >
              <span className="truncate max-w-[160px]">{file.name}</span>
              <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              <button onClick={() => removeFile(file.name)} className="text-red-300 hover:text-red-200" aria-label="Remove file">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => fileRef.current?.click()} disabled={disabled} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10" aria-label="Attach files">
            <Paperclip className="w-5 h-5" />
          </button>
          <input ref={fileRef} type="file" multiple className="hidden" accept={ALLOWED_TYPES.join(',')} onChange={handleFileChange} />
        </div>

        <button onClick={handleSend} disabled={sendDisabled} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60">
          <Send className="w-4 h-4" />
          {(localSending || disabled) ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;

