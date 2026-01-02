// src/components/workspace/MessageBoard.jsx
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

const MessageBoard = ({
  messages,
  onSend,
  sending,
  hasMore,
  onLoadMore,
  loading,
  currentUserId,
  typingUsers = new Map(),
  onTypingStart,
  onTypingStop,
}) => {
  const listRef = useRef(null);
  const [showNewBadge, setShowNewBadge] = useState(false);
  const atBottomRef = useRef(true);
  const prevIdsRef = useRef(new Set());

  // Error-safe wrapper for onSend to prevent white screen errors
  const handleSendWrapper = async (data) => {
    try {
      const result = await onSend(data);
      if (!result?.success) {
        console.error('Send failed:', result?.message);
      }
      return result;
    } catch (error) {
      console.error('Error in handleSendWrapper:', error);
      toast.error('Failed to send message. Please try again.');
      return { success: false, message: error.message };
    }
  };

  useEffect(() => {
    // Track scroll position
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom = el.scrollHeight - (el.scrollTop + el.clientHeight) < 80; // threshold
      atBottomRef.current = nearBottom;
      if (nearBottom) setShowNewBadge(false);
    };
    el.addEventListener('scroll', onScroll);
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // Determine if there are new messages since last render
    const prevIds = prevIdsRef.current;
    const currentIds = new Set(messages.map((m) => m._id));
    const newMsgs = messages.filter((m) => !prevIds.has(m._id));

    if (newMsgs.length > 0) {
      if (atBottomRef.current) {
        // Auto-scroll to bottom
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight;
        }
      } else {
        // Show subtle badge and toast
        setShowNewBadge(true);
        toast.info('New messages', { autoClose: 2000 });
      }
    }

    prevIdsRef.current = currentIds;
  }, [messages]);

  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
      setShowNewBadge(false);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 md:p-6 flex flex-col gap-4 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Message Board</h3>
        {hasMore && (
          <button
            onClick={onLoadMore}
            className="text-sm px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        )}
      </div>

      <div ref={listRef} className="flex-1 min-h-[320px] max-h-[520px] overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-8">No messages yet. Start the conversation!</div>
        )}
        {messages.map((msg) => (
          <MessageItem
            key={msg._id}
            message={msg}
            isOwn={msg.sender?.toString?.() === currentUserId?.toString?.()}
            senderRole={msg.senderRole}
          />
        ))}

        {/* Typing Indicator */}
        <TypingIndicator typingUsers={typingUsers} currentUserId={currentUserId} />
      </div>

      {showNewBadge && (
        <div className="flex justify-center">
          <button onClick={scrollToBottom} className="px-3 py-1 rounded-full bg-amber-400 text-black font-semibold text-sm">
            New messages
          </button>
        </div>
      )}

      <MessageInput 
        onSend={handleSendWrapper} 
        disabled={sending}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
      />
    </div>
  );
};

export default MessageBoard;

