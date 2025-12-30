// src/components/workspace/TypingIndicator.jsx
import React, { useEffect, useState } from 'react';

/**
 * TypingIndicator Component
 * Displays animated "X is typing..." indicator for multiple users
 * Auto-hides after 3 seconds if no new typing event received
 */
const TypingIndicator = ({ typingUsers = new Map(), currentUserId }) => {
  const [displayedUsers, setDisplayedUsers] = useState([]);

  useEffect(() => {
    // Filter out current user and convert to array
    const otherUsers = Array.from(typingUsers.entries())
      .filter(([userId]) => userId !== currentUserId)
      .map(([userId, data]) => ({
        userId,
        ...data,
      }));

    setDisplayedUsers(otherUsers);
  }, [typingUsers, currentUserId]);

  if (displayedUsers.length === 0) {
    return null;
  }

  return (
    <div className="mb-3 pl-4">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
        <span className="text-sm text-gray-400">
          {displayedUsers.length === 1
            ? `${displayedUsers[0].senderRole === 'student' ? 'Student' : 'Company'} is typing`
            : `Multiple users are typing`}
          ...
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;
