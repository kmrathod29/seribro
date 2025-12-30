// src/pages/workspace/ProjectWorkspace.jsx
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
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
import { Loader, AlertCircle } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:7000';

const ProjectWorkspace = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, hasMore: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Map()); // userId -> { senderName, senderRole, timestamp }
  const [onlineUsers, setOnlineUsers] = useState(new Set()); // Set of online userIds
  const pollingRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(new Map()); // userId -> timeoutId

  // Initialize Socket.io connection
  useEffect(() => {
    if (!projectId) return;

    try {
      socketRef.current = io(SOCKET_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socketRef.current.on('connect', () => {
        console.log('[Socket.io] Connected:', socketRef.current.id);

        // Emit join_workspace event
        if (workspace?.currentUserId) {
          socketRef.current.emit('join_workspace', {
            projectId,
            userId: workspace.currentUserId,
          });
        }
      });

      socketRef.current.on('new_message', (messageData) => {
        console.log('[Socket.io] Received new_message:', messageData);
        // Only add if not optimistic (already in UI)
        if (!messageData.optimistic) {
          mergeMessages([messageData]);
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

      socketRef.current.on('disconnect', () => {
        console.log('[Socket.io] Disconnected - will fallback to polling');
        setOnlineUsers(new Set()); // Clear online users on disconnect
      });

      socketRef.current.on('error', (error) => {
        console.warn('[Socket.io] Error:', error);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.off('connect');
          socketRef.current.off('new_message');
          socketRef.current.off('typing_start');
          socketRef.current.off('typing_stop');
          socketRef.current.off('user_online');
          socketRef.current.off('user_offline');
          socketRef.current.off('disconnect');
          socketRef.current.off('error');
          socketRef.current.disconnect();
        }

        // Clear typing timeouts
        typingTimeoutRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
        typingTimeoutRef.current.clear();
      };
    } catch (err) {
      console.warn('[Socket.io] Failed to initialize:', err.message);
    }
  }, [projectId]);

  // Update Socket.io join_workspace when workspace loads
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected && workspace?.currentUserId && projectId) {
      socketRef.current.emit('join_workspace', {
        projectId,
        userId: workspace.currentUserId,
      });
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

  // Append messages (alias)
  const appendMessages = (incoming) => {
    mergeMessages(incoming);
  };

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError('');
    const res = await getWorkspaceOverview(projectId);
    if (res.success) {
      setWorkspace(res.data);
      mergeMessages(res.data.recentMessages || []);
      await markMessagesAsRead(projectId);
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

  const handleSend = async ({ text, files }) => {
    setSending(true);

    // Emit typing_stop when sending
    if (socketRef.current && socketRef.current.connected && workspace?.currentUserId) {
      socketRef.current.emit('typing_stop', {
        projectId,
        userId: workspace.currentUserId,
      });
    }

    // Create optimistic message
    const tempId = `temp-${Date.now()}`;
    const currentUserId = workspace?.currentUserId;
    const userRole = (workspace?.student && workspace.student._id?.toString() === currentUserId?.toString()) ? 'student' : 'company';
    const optimistic = {
      _id: tempId,
      message: text,
      sender: currentUserId,
      senderName: 'You',
      senderRole: userRole,
      createdAt: new Date().toISOString(),
      optimistic: true,
    };

    // Append optimistic message
    setMessages((prev) => [...prev, optimistic]);

    const res = await sendMessage(projectId, { text, files });

    if (res.success) {
      // Replace optimistic message with server message
      setMessages((prev) => prev.map((m) => (m._id === tempId ? res.data.message : m)));
      toast.success('Message sent');
    } else {
      // Remove optimistic message
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      toast.error(res.message || 'Failed to send message');
      setError(res.message || 'Failed to send message');
    }

    setSending(false);
    await markMessagesAsRead(projectId);
    return res;
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
      senderName: workspace?.student?.fname || workspace?.company?.companyName || 'User',
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
                const previous = project.status;
                setWorkspace((prev) => ({ ...prev, project: { ...prev.project, status: 'in-progress' } }));
                const startRes = await import('../../apis/workSubmissionApi').then((m) => m.startWork(project._id));
                if (startRes.success) {
                  toast.success('Work started successfully');
                  await loadWorkspace();
                } else {
                  setWorkspace((prev) => ({ ...prev, project: { ...prev.project, status: previous } }));
                  toast.error(startRes.message || 'Failed to start work');
                }
              } catch (err) {
                toast.error('Server error while starting work');
                await loadWorkspace();
              }
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-md font-semibold hover:bg-green-600 transition-colors"
          >
            Start Work
          </button>
        )}

        {workspace?.workspace?.role === 'company' && project?.paymentStatus === 'pending' && project?.status === 'assigned' && (
          <button onClick={() => navigate(`/payment/${project._id}`)} className="px-4 py-2 bg-amber-400 text-navy rounded-md font-semibold hover:bg-amber-500 transition-colors">Pay Now</button>
        )}

        {workspace?.workspace?.role === 'student' && (project?.status === 'in-progress' || project?.status === 'revision-requested' || project?.status === 'revision_requested') && (
          <button onClick={() => navigate(`/workspace/projects/${project._id}/submit`)} className="px-4 py-2 bg-blue-500 text-white rounded-md font-semibold hover:bg-blue-600 transition-colors">Submit Work</button>
        )}

        {workspace?.workspace?.role === 'company' && project?.status === 'under-review' && (
          <button onClick={() => navigate(`/workspace/projects/${project._id}/review`)} className="px-4 py-2 bg-blue-500 text-white rounded-md font-semibold hover:bg-blue-600 transition-colors">Review Submission</button>
        )}

        {project?.status === 'completed' && !project?.ratingCompleted && (
          <button onClick={() => navigate(`/workspace/projects/${project._id}/rate`)} className="px-4 py-2 bg-green-500 text-white rounded-md font-semibold hover:bg-green-600 transition-colors">Rate {workspace?.workspace?.role === 'student' ? 'Company' : 'Student'}</button>
        )}

        {/* Payment & Earnings Navigation */}
        {workspace?.workspace?.role === 'student' && (
          <button onClick={() => navigate(`/student/payments`)} className="px-4 py-2 bg-emerald-500 text-white rounded-md font-semibold hover:bg-emerald-600 transition-colors flex items-center gap-2">
            💰 My Earnings
          </button>
        )}

        {workspace?.workspace?.role === 'student' && project?.status === 'completed' && (
          <button onClick={() => navigate(`/workspace/projects/${project._id}/rating`)} className="px-4 py-2 bg-purple-500 text-white rounded-md font-semibold hover:bg-purple-600 transition-colors flex items-center gap-2">
            ⭐ Rate Project
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

  const project = workspace?.project;
  const student = workspace?.student;
  const company = workspace?.company;

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
                    <div className="text-sm text-gray-300">Please rate your counterparty to help future users.</div>
                  </div>
                  <div>
                    <button onClick={() => navigate(`/workspace/projects/${project._id}/rate`)} className="px-3 py-2 bg-amber-400 text-navy rounded font-semibold">Rate Project</button>
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
            <AssignedStudentCard student={student} />
            <CompanyInfoCard company={company} />
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

export default ProjectWorkspace;

