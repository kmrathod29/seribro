// src/pages/workspace/ProjectWorkspace.jsx
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import WorkspaceHeader from '../../components/workspace/WorkspaceHeader';
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
import { Loader, AlertCircle, Building2, User } from 'lucide-react';

const ProjectWorkspace = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, hasMore: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const pollingRef = useRef(null);

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
    // polling for new messages
    pollingRef.current = setInterval(() => loadMessages(1), 30000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [projectId]);

  const handleSend = async ({ text, files }) => {
    setSending(true);
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
        <WorkspaceHeader project={project} daysRemaining={workspace?.workspace?.daysRemaining} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProjectOverviewCard project={project} />

            {/* Message Board */}
            <MessageBoard
              messages={messages}
              onSend={handleSend}
              sending={sending}
              hasMore={pagination.hasMore}
              onLoadMore={handleLoadMore}
              loading={false}
              currentUserId={workspace?.currentUserId}
            />
          </div>

          <div className="space-y-6">
            <AssignedStudentCard student={student} />
            <CompanyInfoCard company={company} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProjectWorkspace;

