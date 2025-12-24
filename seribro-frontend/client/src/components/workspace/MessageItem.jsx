// src/components/workspace/MessageItem.jsx
import React from 'react';
import { Paperclip } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const humanTime = (dateStr) => {
  if (!dateStr) return '';
  try {
    const diff = formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    return diff === 'less than a minute ago' ? 'just now' : diff;
  } catch (e) {
    return new Date(dateStr).toLocaleString();
  }
};

const MessageItem = ({ message, isOwn, senderRole }) => {
  let bubbleClass = 'bg-gray-800/60 border-white/10 text-white';
  if (isOwn) {
    bubbleClass = senderRole === 'company' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white';
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xl w-full rounded-xl border p-3 shadow-sm ${bubbleClass}`}>
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{message.senderName}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
              {senderRole || message.senderRole}
            </span>
          </div>
          <span className="text-xs text-gray-200/70">{humanTime(message.createdAt)}</span>
        </div>
        <p className="text-sm text-gray-100 whitespace-pre-wrap">{message.message}</p>

        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.attachments.map((file, idx) => (
              <a
                key={`${file.public_id || file.url}-${idx}`}
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-sm text-white"
              >
                <Paperclip className="w-4 h-4" />
                {file.fileType && file.fileType.startsWith('image/') ? (
                  <img src={file.url} alt={file.originalName || file.filename} className="w-16 h-10 object-cover rounded" />
                ) : null}
                <span className="truncate">{file.originalName || file.filename}</span>
                {file.size && (
                  <span className="text-xs text-gray-200/70">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;

