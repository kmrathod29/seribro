// src/pages/workspace/ProjectWorkspace.jsx
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ErrorBoundary from '../../components/ErrorBoundary';
import WorkspaceHeader from '../../components/workspace/WorkspaceHeader';
import WorkspaceStatusFlow from '../../components/workspace/WorkspaceStatusFlow';
import MessageBoard from '../../components/workspace/MessageBoard';
import ProjectOverviewCard from '../../components/workspace/ProjectOverviewCard';
import AssignedStudentCard from '../../components/workspace/AssignedStudentCard';
import CompanyInfoCard from '../../components/workspace/CompanyInfoCard';
import {
  getWorkspaceOverview,
  getMessages,
  sendMessage,
  markMessagesAsRead,
} from '../../apis/workspaceApi';
import { Loader2 as Loader, AlertCircle } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:7000';

const ProjectWorkspace = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [workspace, setWorkspace] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, hasMore: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Map()); // userId -> { senderName, senderRole, timestamp }
  const [onlineUsers, setOnlineUsers] = useState(new Set()); // Set of online userIds
  const lastLocationRef = useRef(null); // Track last location to detect returns
  const pollingRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(new Map()); // userId -> timeoutId
  const currentUserIdRef = useRef(null); // Track current user ID for Socket.io handlers

  // Update currentUserId ref when workspace changes
  useEffect(() => {
    currentUserIdRef.current = workspace?.currentUserId;
  }, [workspace?.currentUserId]);

  // Initialize Socket.io connection - only once on component mount
  // Socket persists across re-renders and only disconnects on unmount
  useEffect(() => {
    if (!projectId) return;

    // Capture a stable reference to typing timeouts to avoid stale-ref issues in cleanup
    const capturedTypingTimeouts = typingTimeoutRef.current;

    // If socket already exists and is connected, don't recreate it
    if (socketRef.current && socketRef.current.connected) {
      console.log('[Socket.io] Socket already connected, skipping re-initialization');
      // Just ensure we're joined to the current project room
      if (currentUserIdRef.current) {
        socketRef.current.emit('join_workspace', {
          projectId,
          userId: currentUserIdRef.current,
        });
      }
      return;
    }

    // Only create socket if it doesn't exist
    if (socketRef.current) {
      console.log('[Socket.io] Socket exists but not connected, waiting for reconnection...');
      return;
    }

    try {
      console.log('[Socket.io] Creating new socket connection for projectId:', projectId);
      socketRef.current = io(SOCKET_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
        withCredentials: true,
      });

      socketRef.current.on('connect', () => {
        console.log('[Socket.io] Socket connected:', socketRef.current.id);
        
        // Emit join_workspace event immediately after connection
        const userId = currentUserIdRef.current;
        if (userId && projectId) {
          socketRef.current.emit('join_workspace', {
            projectId,
            userId: userId,
          });
          console.log('[Socket.io] Emitted join_workspace for projectId:', projectId, 'userId:', userId);
        } else {
          console.warn('[Socket.io] Connected but userId/projectId not available, will join when workspace loads');
        }
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('[Socket.io] Connection error:', error);
      });

      socketRef.current.on('reconnect_attempt', (attemptNumber) => {
        console.log('[Socket.io] Attempting to reconnect, attempt:', attemptNumber);
      });

      socketRef.current.on('reconnect', (attemptNumber) => {
        console.log('[Socket.io] Reconnected after', attemptNumber, 'attempts');
        console.log('[Socket.io] Reconnected, rejoining room');
        // Re-join workspace after reconnection
        const userId = currentUserIdRef.current;
        if (userId && projectId) {
          socketRef.current.emit('join_workspace', {
            projectId,
            userId: userId,
          });
          console.log('[Socket.io] Rejoined workspace for projectId:', projectId);
        }
      });

      socketRef.current.on('reconnect_error', (error) => {
        console.error('[Socket.io] Reconnection error:', error);
      });

      socketRef.current.on('reconnect_failed', () => {
        console.error('[Socket.io] Reconnection failed after max attempts');
      });

      socketRef.current.on('new_message', (messageData) => {
        console.log('[Socket.io] Received new_message:', messageData);
        // Only add if not optimistic (already in UI)
        if (!messageData.optimistic) {
          // Check if message is from current user - if so, we've already added it from API response
          // Ignore Socket.io messages from current user to prevent duplicates
          const isFromCurrentUser = messageData.sender?.toString() === currentUserIdRef.current?.toString();
          if (!isFromCurrentUser) {
            // Use functional setState to avoid closure issues
            setMessages((prev) => {
              const map = new Map();
              [...prev, messageData].forEach((msg) => {
                if (msg && msg._id) map.set(msg._id, msg);
              });
              const merged = Array.from(map.values()).sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              );
              return merged;
            });
          } else {
            console.log('[Socket.io] Ignoring message from current user (already in state)');
          }
        }
      });

      socketRef.current.on('typing_start', (data) => {
        const { userId, senderName, senderRole } = data;
        setTypingUsers((prev) => new Map(prev).set(userId, { senderName, senderRole, timestamp: Date.now() }));

        // Clear existing timeout for this user
        if (typingTimeoutRef.current.has(userId)) {
          clearTimeout(typingTimeoutRef.current.get(userId));
        }

        // Auto-clear typing after 3 seconds if no update received
        const timeoutId = setTimeout(() => {
          setTypingUsers((prev) => {
            const updated = new Map(prev);
            updated.delete(userId);
            return updated;
          });
          typingTimeoutRef.current.delete(userId);
        }, 3000);

        typingTimeoutRef.current.set(userId, timeoutId);
      });

      socketRef.current.on('typing_stop', (data) => {
        const { userId } = data;
        setTypingUsers((prev) => {
          const updated = new Map(prev);
          updated.delete(userId);
          return updated;
        });

        if (typingTimeoutRef.current.has(userId)) {
          clearTimeout(typingTimeoutRef.current.get(userId));
          typingTimeoutRef.current.delete(userId);
        }
      });

      socketRef.current.on('user_online', (data) => {
        const { userId } = data;
        setOnlineUsers((prev) => new Set([...prev, userId]));
      });

      socketRef.current.on('user_offline', (data) => {
        const { userId } = data;
        setOnlineUsers((prev) => {
          const updated = new Set(prev);
          updated.delete(userId);
          return updated;
        });
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('[Socket.io] Socket disconnected:', reason);
        setOnlineUsers(new Set()); // Clear online users on disconnect
        
        // Log disconnect reason for debugging
        if (reason === 'io server disconnect') {
          // Server forcefully disconnected, reconnect manually
          console.warn('[Socket.io] Server forcefully disconnected, will reconnect');
        } else if (reason === 'io client disconnect') {
          // Client manually disconnected (normal on cleanup)
          console.log('[Socket.io] Client manually disconnected (normal cleanup)');
        } else {
          // Network error or other issue, automatic reconnection should handle it
          console.log('[Socket.io] Disconnected due to:', reason, '- automatic reconnection will attempt');
        }
      });

      socketRef.current.on('error', (error) => {
        console.warn('[Socket.io] Error:', error);
      });

      return () => {
        // Cleanup function - only runs when component unmounts
        // This is the ONLY place where socket should disconnect
        console.log('[Socket.io] Cleanup: Component unmounting, disconnecting socket');
        if (socketRef.current) {
          // Remove all event listeners to prevent memory leaks
          socketRef.current.off('connect');
          socketRef.current.off('connect_error');
          socketRef.current.off('reconnect');
          socketRef.current.off('reconnect_attempt');
          socketRef.current.off('reconnect_error');
          socketRef.current.off('reconnect_failed');
          socketRef.current.off('new_message');
          socketRef.current.off('typing_start');
          socketRef.current.off('typing_stop');
          socketRef.current.off('user_online');
          socketRef.current.off('user_offline');
          socketRef.current.off('disconnect');
          socketRef.current.off('error');
          
          // Disconnect the socket - this only happens on component unmount
          socketRef.current.disconnect();
          socketRef.current = null;
        }

        // Clear typing timeouts safely using captured reference
        if (capturedTypingTimeouts) {
          capturedTypingTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
          capturedTypingTimeouts.clear();
        }
      };
    } catch (err) {
      console.warn('[Socket.io] Failed to initialize:', err.message);
    }
    // Empty dependency array - socket only created once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Socket.io join_workspace when workspace loads or projectId changes
  // This ensures we're always in the correct room without recreating the socket
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected && projectId) {
      const userId = currentUserIdRef.current || workspace?.currentUserId;
      if (userId) {
        console.log('[Socket.io] Joining workspace for projectId:', projectId, 'userId:', userId);
        socketRef.current.emit('join_workspace', {
          projectId,
          userId: userId,
        });
      }
    }
  }, [workspace?.currentUserId, projectId]);

  // Merge incoming messages with existing ones using functional state update to avoid stale deps
  const mergeMessages = useCallback((incoming) => {
    setMessages((prev) => {
      const map = new Map();
      [...prev, ...incoming].forEach((msg) => {
        if (msg && msg._id) map.set(msg._id, msg);
      });
      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      return merged;
    });
  }, []);



  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError('');
    const res = await getWorkspaceOverview(projectId);
    if (res.success) {
      // Properly update state using setWorkspace - this triggers re-render
      setWorkspace(res.data);
      mergeMessages(res.data.recentMessages || []);
      await markMessagesAsRead(projectId);
      
      // Debug: Log updated state to verify it's correct
      console.log('Workspace state updated:', {
        projectStatus: res.data?.project?.status,
        projectId: res.data?.project?._id,
        workStarted: res.data?.project?.workStarted,
        startedAt: res.data?.project?.startedAt,
      });
    } else {
      setError(res.message || 'Failed to load workspace');
    }
    setLoading(false);
  }, [projectId, mergeMessages]);

  const loadMessages = useCallback(
    async (page = 1) => {
      const res = await getMessages(projectId, page, 20);
      if (res.success) {
        mergeMessages(res.data.messages || []);
        setPagination({
          ...res.data.pagination,
          hasMore: res.data.pagination?.hasMore,
        });
      } else {
        setError(res.message || 'Failed to load messages');
      }
    },
    [projectId, mergeMessages]
  );

  useEffect(() => {
    // Run once when projectId changes to avoid re-trigger loops
    loadWorkspace();
    loadMessages(1);
    // polling for new messages (30s fallback if Socket.io fails)
    pollingRef.current = setInterval(() => loadMessages(1), 30000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [projectId, loadWorkspace, loadMessages]);

  // Force reload when returning from ReviewWork page (same URL, different location state)
  // This ensures project status is updated after approval
  useEffect(() => {
    if (lastLocationRef.current && lastLocationRef.current.pathname === location.pathname) {
      // Same path, but we're back here (possibly from ReviewWork)
      // Force reload the workspace to get updated status
      console.log('Reloading workspace after potential status change...');
      loadWorkspace();
    }
    lastLocationRef.current = location;
  }, [location, loadWorkspace]);

  // Handle sending messages - IMPORTANT: Socket connection MUST remain open after sending
  // Do NOT disconnect the socket here. The socket should stay connected for the entire session
  // and only disconnect when the user navigates away (handled by useEffect cleanup)
  const handleSend = async ({ text, files }) => {
    const tempId = `temp-${Date.now()}`;
    let optimisticAdded = false;

    try {
      setSending(true);
      setError(''); // Clear any previous errors

      // Emit typing_stop when sending - socket remains connected
      // Safely check socket connection without blocking
      try {
        if (socketRef.current && socketRef.current.connected && workspace?.currentUserId) {
          socketRef.current.emit('typing_stop', {
            projectId,
            userId: workspace.currentUserId,
          });
        }
      } catch (socketErr) {
        console.warn('[Socket.io] Error emitting typing_stop:', socketErr.message);
        // Non-blocking - continue with sending message
      }

      // Create optimistic message
      const currentUserId = workspace?.currentUserId;
      const userRole = (workspace?.student && workspace.student._id?.toString() === currentUserId?.toString()) ? 'student' : 'company';
      const optimistic = {
        _id: tempId,
        message: text,
        sender: currentUserId,
        senderName: workspace?.student?.name || workspace?.company?.companyName || 'You',
        senderRole: userRole,
        createdAt: new Date().toISOString(),
        optimistic: true,
        attachments: [],
      };

      // Append optimistic message
      setMessages((prev) => [...prev, optimistic]);
      optimisticAdded = true;

      // Send message with timeout protection
      const sendPromise = sendMessage(projectId, { text, files });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Message send timeout')), 30000)
      );

      const res = await Promise.race([sendPromise, timeoutPromise]);

      if (res.success && res.data && res.data.message) {
        // Replace optimistic message with server message using mergeMessages for proper deduplication
        const serverMessage = res.data.message;
        setMessages((prev) => {
          // Remove optimistic message and add server message using Map for deduplication
          const map = new Map();
          prev.forEach((m) => {
            if (m._id !== tempId && m && m._id) {
              map.set(m._id, m);
            }
          });
          if (serverMessage && serverMessage._id) {
            map.set(serverMessage._id, serverMessage);
          }
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          return merged;
        });
        toast.success('Message sent');
        
        // Mark as read with timeout protection
        try {
          await Promise.race([
            markMessagesAsRead(projectId),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Mark read timeout')), 5000))
          ]);
        } catch (readErr) {
          console.warn('Error marking messages as read:', readErr.message);
          // Non-blocking - message was still sent
        }
        
        return { success: true };
      } else {
        // Remove optimistic message
        setMessages((prev) => prev.filter((m) => m._id !== tempId));
        optimisticAdded = false;
        const errorMsg = res.message || 'Failed to send message';
        toast.error(errorMsg);
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      console.error('Error in handleSend:', err);
      
      // Remove optimistic message if it was added
      if (optimisticAdded) {
        setMessages((prev) => prev.filter((m) => m._id !== tempId));
      }
      
      const errorMsg = err.message === 'Message send timeout' 
        ? 'Message send is taking too long. Please check your connection and try again.'
        : 'Failed to send message. Please try again.';
      
      toast.error(errorMsg);
      setError(errorMsg);
      return { success: false, message: err.message };
    } finally {
      setSending(false);
    }
  };

  const handleLoadMore = async () => {
    if (!pagination.hasMore) return;
    const nextPage = (pagination.currentPage || 1) + 1;
    await loadMessages(nextPage);
  };

  // Handle typing indicator events
  const handleTypingStart = useCallback(() => {
    if (!socketRef.current || !socketRef.current.connected || !workspace?.currentUserId) return;

    socketRef.current.emit('typing_start', {
      projectId,
      userId: workspace.currentUserId,
      senderName: workspace?.student?.name || workspace?.student?.fname || workspace?.company?.companyName || 'User',
      senderRole: workspace?.workspace?.role || 'student',
    });
  }, [projectId, workspace?.currentUserId, workspace?.student, workspace?.company, workspace?.workspace?.role]);

  const handleTypingStop = useCallback(() => {
    if (!socketRef.current || !socketRef.current.connected || !workspace?.currentUserId) return;

    socketRef.current.emit('typing_stop', {
      projectId,
      userId: workspace.currentUserId,
    });
  }, [projectId, workspace?.currentUserId]);

  // Extract project, student, company early so renderActionButtons can access them
  const project = workspace?.project;
  const student = workspace?.student;
  const company = workspace?.company;

  // Reusable action buttons renderer (used in header area and sticky footer)
  const renderActionButtons = () => {
    return (
      <>
        {workspace?.workspace?.role === 'student' && workspace?.workspace?.canSubmitWork && project?.status === 'assigned' && (
          <button
            onClick={async () => {
              try {
                const confirmStart = window.confirm('Start work on this project? This will change the project status to In Progress.');
                if (!confirmStart) return;
                
                // Make the API call
                const startRes = await import('../../apis/workSubmissionApi').then((m) => m.startWork(project._id));
                
                if (startRes.success) {
                  toast.success('✅ Work started successfully! Status updated to In Progress.');
                  
                  // Reload workspace data to get updated status - this will trigger re-render
                  await loadWorkspace();
                  
                  // Debug: Verify state was updated
                  console.log('Work started - checking updated workspace state...');
                  // Note: workspace state might not be updated immediately due to async nature
                  // The loadWorkspace function will call setWorkspace which triggers re-render
                } else {
                  toast.error(startRes.message || 'Failed to start work');
                  setError(startRes.message || 'Failed to start work');
                }
              } catch (err) {
                console.error('Error starting work:', err);
                toast.error('Server error while starting work');
                setError('Failed to start work: ' + err.message);
              }
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-md font-semibold hover:bg-green-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Start Work
          </button>
        )}

        {workspace?.workspace?.role === 'company' && project?.paymentStatus !== 'paid' && project?.paymentStatus !== 'released' && (project?.status === 'assigned' || project?.status === 'in-progress' || project?.status === 'submitted' || project?.status === 'completed') && (
          <button onClick={() => navigate(`/payment/${project._id}`)} className="px-4 py-2 bg-amber-400 text-navy rounded-md font-semibold hover:bg-amber-500 transition-colors">💰 Pay Now</button>
        )}

        {workspace?.workspace?.role === 'student' && (project?.status === 'in-progress' || project?.status === 'revision-requested' || project?.status === 'revision_requested') && (
          <button onClick={() => navigate(`/workspace/projects/${project._id}/submit`)} className="px-4 py-2 bg-blue-500 text-white rounded-md font-semibold hover:bg-blue-600 transition-colors">📤 Submit Work</button>
        )}

        {workspace?.workspace?.role === 'company' && project?.status === 'under-review' && (
          <button onClick={() => navigate(`/workspace/projects/${project._id}/review`)} className="px-4 py-2 bg-blue-500 text-white rounded-md font-semibold hover:bg-blue-600 transition-colors">👁️ Review Submission</button>
        )}

        {project?.status === 'completed' && !project?.ratingCompleted && (
          <button onClick={() => navigate(`/workspace/projects/${project._id}/rate`)} className="px-4 py-2 bg-green-500 text-white rounded-md font-semibold hover:bg-green-600 transition-colors">⭐ Rate {workspace?.workspace?.role === 'student' ? 'Company' : 'Student'}</button>
        )}

        {/* Payment & Earnings Navigation */}
        {workspace?.workspace?.role === 'student' && (
          <button onClick={() => navigate(`/student/payments`)} className="px-4 py-2 bg-emerald-500 text-white rounded-md font-semibold hover:bg-emerald-600 transition-colors flex items-center gap-2">
            💰 My Earnings
          </button>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark flex items-center justify-center">
        <Loader className="w-10 h-10 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark flex flex-col items-center justify-center gap-4 text-center px-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-lg text-gray-200">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark flex flex-col">
      <Navbar />
      <div className="flex-1 px-4 py-8 md:py-12 max-w-6xl mx-auto w-full space-y-6">
        <WorkspaceHeader 
          project={project} 
          daysRemaining={workspace?.workspace?.daysRemaining}
          onlineUsers={onlineUsers}
          currentUserId={workspace?.currentUserId}
          student={student}
          company={company}
        />

        {/* Action bar: Status flow + role-based actions */}
        <div className="flex flex-col gap-4">
          <div className="w-full">
            <WorkspaceStatusFlow status={project?.status} revisionCount={project?.revisionCount || 0} />
          </div>

          <div className="flex justify-end items-center flex-wrap gap-3">
            {/** Render primary action buttons (desktop/header placement) */}
            {renderActionButtons()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProjectOverviewCard project={project} />

            {/* Rating prompt after completion */}
            {project?.status === 'completed' && !project?.ratingCompleted && (
              <div className="bg-slate-800/60 border border-white/10 rounded-xl p-4 shadow-lg mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold">Project completed</div>
                    <div className="text-sm text-gray-300">
                      Please rate {workspace?.workspace?.role === 'student' ? 'the company' : 'the student'} to help future users.
                    </div>
                  </div>
                  <div>
                    <button onClick={() => navigate(`/workspace/projects/${project._id}/rate`)} className="px-3 py-2 bg-amber-400 text-navy rounded font-semibold">
                      ⭐ Rate {workspace?.workspace?.role === 'student' ? 'Company' : 'Student'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Message Board */}
            <MessageBoard
              messages={messages}
              onSend={handleSend}
              sending={sending}
              hasMore={pagination.hasMore}
              onLoadMore={handleLoadMore}
              loading={false}
              currentUserId={workspace?.currentUserId}
              typingUsers={typingUsers}
              onTypingStart={handleTypingStart}
              onTypingStop={handleTypingStop}
            />
          </div>

          <div className="space-y-6">
            {student && <AssignedStudentCard student={student} />}
            {company && <CompanyInfoCard company={company} />}
          </div>
        </div>
      </div>
      {/* Sticky mobile footer for primary actions */}
      <div className="md:hidden fixed bottom-4 left-0 right-0 px-4 z-40">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex items-center justify-center gap-3 shadow-lg">
            {renderActionButtons()}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Wrap with error boundary to prevent white screen crashes
const ProjectWorkspaceWithErrorBoundary = () => {
  return (
    <ErrorBoundary>
      <ProjectWorkspace />
    </ErrorBoundary>
  );
};

export default ProjectWorkspaceWithErrorBoundary;

