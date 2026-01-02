/**
 * backend/utils/socket/socketManager.js
 * Socket.io Real-time Messaging Manager
 * 
 * Manages:
 * - Socket.io initialization with HTTP server
 * - User ↔ Socket mappings for online tracking
 * - Room management (project workspaces)
 * - Connection/disconnect event handlers
 * - Typing indicators and presence events
 */

const socketIO = require('socket.io');

let io = null;
const socketToUserMap = new Map(); // Maps socket.id -> { userId, projectIds: Set }
const userToSocketMap = new Map();  // Maps userId -> { socketId, projectIds: Set }

/**
 * Initialize Socket.io with Express HTTP server
 * @param {http.Server} httpServer - The HTTP server instance
 * @param {Array<string>} allowedOrigins - CORS allowed origins
 * @returns {SocketIO.Server} - Initialized Socket.io instance
 */
function initializeSocketIO(httpServer, allowedOrigins = []) {
  io = socketIO(httpServer, {
    cors: {
      origin: allowedOrigins.length > 0 ? allowedOrigins : true,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 60000,
    maxHttpBufferSize: 1e6,
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`[Socket.io] User connected: ${socket.id}`);

    // Join workspace event: user joins project room
    socket.on('join_workspace', (data) => {
      try {
        const { projectId, userId } = data;
        if (!projectId || !userId) {
          console.warn('[Socket.io] join_workspace: Missing projectId or userId');
          return;
        }

        const roomId = `project_${projectId}`;

        // Track socket -> user mapping
        if (!socketToUserMap.has(socket.id)) {
          socketToUserMap.set(socket.id, { userId, projectIds: new Set() });
        }
        const socketData = socketToUserMap.get(socket.id);
        socketData.projectIds.add(projectId);

        // Track user -> socket mapping
        if (!userToSocketMap.has(userId)) {
          userToSocketMap.set(userId, { socketId: socket.id, projectIds: new Set() });
        }
        const userData = userToSocketMap.get(userId);
        userData.projectIds.add(projectId);

        // Join the room
        socket.join(roomId);
        console.log(`[Socket.io] User ${userId} joined room ${roomId}`);

        // Broadcast user online status to room
        io.to(roomId).emit('user_online', {
          userId,
          timestamp: new Date(),
          isOnline: true,
        });
      } catch (err) {
        console.error('[Socket.io] Error in join_workspace:', err.message);
      }
    });

    // Typing start event
    socket.on('typing_start', (data) => {
      try {
        const { projectId, userId, senderName, senderRole } = data;
        if (!projectId) return;

        const roomId = `project_${projectId}`;
        socket.to(roomId).emit('typing_start', {
          userId,
          senderName,
          senderRole,
          timestamp: new Date(),
        });
      } catch (err) {
        console.error('[Socket.io] Error in typing_start:', err.message);
      }
    });

    // Typing stop event
    socket.on('typing_stop', (data) => {
      try {
        const { projectId, userId } = data;
        if (!projectId) return;

        const roomId = `project_${projectId}`;
        socket.to(roomId).emit('typing_stop', {
          userId,
          timestamp: new Date(),
        });
      } catch (err) {
        console.error('[Socket.io] Error in typing_stop:', err.message);
      }
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      try {
        console.log(`[Socket.io] User disconnected: ${socket.id}`);

        const socketData = socketToUserMap.get(socket.id);
        if (socketData) {
          const { userId, projectIds } = socketData;

          // Broadcast offline status to all rooms this user was in
          projectIds.forEach((projectId) => {
            const roomId = `project_${projectId}`;
            io.to(roomId).emit('user_offline', {
              userId,
              timestamp: new Date(),
              isOnline: false,
            });
          });

          // Clean up user mappings
          userToSocketMap.delete(userId);
          socketToUserMap.delete(socket.id);
        }
      } catch (err) {
        console.error('[Socket.io] Error in disconnect handler:', err.message);
        // Still attempt cleanup even if error occurs
        socketToUserMap.delete(socket.id);
      }
    });

    // Error handler
    socket.on('error', (error) => {
      console.error(`[Socket.io] Error on socket ${socket.id}:`, error);
    });
  });

  console.log('[Socket.io] Initialized successfully');
  return io;
}

/**
 * Get the Socket.io instance (must call initializeSocketIO first)
 * @returns {SocketIO.Server} - The Socket.io instance
 */
function getIO() {
  if (!io) {
    throw new Error('[Socket.io] Not initialized. Call initializeSocketIO() first.');
  }
  return io;
}

/**
 * Emit a new message to all users in a workspace
 * @param {string} projectId - The project ID
 * @param {Object} messageData - The message object
 */
function emitNewMessage(projectId, messageData) {
  if (!io) {
    console.warn('[Socket.io] Not initialized. Message will not be broadcast via Socket.io.');
    return;
  }

  const roomId = `project_${projectId}`;
  io.to(roomId).emit('new_message', messageData);
}

/**
 * Get online users in a workspace
 * @param {string} projectId - The project ID
 * @returns {Array<string>} - Array of online user IDs
 */
function getOnlineUsersInWorkspace(projectId) {
  const onlineUsers = [];
  socketToUserMap.forEach(({ userId, projectIds }) => {
    if (projectIds.has(projectId)) {
      onlineUsers.push(userId);
    }
  });
  return onlineUsers;
}

/**
 * Check if a specific user is online in a workspace
 * @param {string} userId - The user ID
 * @param {string} projectId - The project ID
 * @returns {boolean} - True if user is online in the workspace
 */
function isUserOnlineInWorkspace(userId, projectId) {
  const userData = userToSocketMap.get(userId);
  return userData ? userData.projectIds.has(projectId) : false;
}

module.exports = {
  initializeSocketIO,
  getIO,
  emitNewMessage,
  getOnlineUsersInWorkspace,
  isUserOnlineInWorkspace,
};
