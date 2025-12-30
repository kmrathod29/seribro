# Socket.io Implementation - Testing & Deployment Guide

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] All files created and modified
- [ ] No syntax errors in backend (`npm run start`)
- [ ] No build errors in frontend (`npm run build`)
- [ ] Port 7000 available on server
- [ ] Environment variables configured
- [ ] Database connected

### Backend Deployment
```bash
# Navigate to backend
cd seribro-backend

# Install dependencies (already done)
npm install socket.io

# Start server
npm run start

# Expected output:
# [Socket.io] Initialized successfully
# 🚀 Server running on port 7000
# 📡 Socket.io ready for real-time connections
```

### Frontend Deployment
```bash
# Navigate to frontend
cd seribro-frontend/client

# Install dependencies (already done)
npm install socket.io-client

# Build for production
npm run build

# Deploy dist/ folder to CDN or web server
```

### Environment Configuration

**Backend (.env)**
```
PORT=7000
FRONTEND_URL=https://yourdomain.com
CLIENT_URL=https://app.yourdomain.com
NODE_ENV=production
```

**Frontend (.env)**
```
VITE_BACKEND_URL=https://api.yourdomain.com:7000
```

---

## 🧪 Testing Procedures

### Unit Testing - Backend Socket Events

```javascript
// Test: Socket joins workspace
const socket = io('http://localhost:7000');
socket.emit('join_workspace', {
  projectId: 'test-project-123',
  userId: 'user-456'
});
// Listen for confirmation (user_online should be broadcast)

// Test: Message broadcast
// Send message via API
// Socket should receive new_message event within 100ms

// Test: Typing indicator
socket.emit('typing_start', {
  projectId: 'test-project-123',
  userId: 'user-456',
  senderName: 'John',
  senderRole: 'student'
});
// Other connected sockets should receive typing_start event
```

### Integration Testing - Full Workflow

**Test Case 1: Real-Time Message Delivery**
```
1. Open project in User A browser
2. Open same project in User B browser
3. User A sends message
4. Verify message appears in User B's browser < 100ms
5. Expected: User B sees message instantly
```

**Test Case 2: Typing Indicator**
```
1. Both users in same project
2. User A starts typing in message input
3. User B should see "Student is typing..."
4. User A stops typing
5. Indicator disappears after 3 seconds
6. Expected: Indicator shows/hides correctly
```

**Test Case 3: Online Status**
```
1. Both users in same project
2. Check User B's header: should show "Online" with green dot
3. User A refreshes page
4. Status briefly shows "Offline"
5. After reconnect, shows "Online" again
6. Expected: Status updates correctly
```

**Test Case 4: Polling Fallback**
```
1. Both users in same project
2. Open DevTools → Network
3. Disable WebSocket: open console
   socketRef.current.disconnect()
4. User A sends message
5. Message appears with delay (polling interval)
6. Expected: Message eventually appears via polling
```

**Test Case 5: File Attachments**
```
1. Both users in same project
2. User A sends message with file
3. File uploads successfully
4. User B receives message with attachment link
5. User B can download file
6. Expected: Files work with Socket.io
```

### Load Testing

```bash
# Install artillery for load testing
npm install -g artillery

# Create test file: load-test.yml
```

```yaml
config:
  target: "http://localhost:7000"
  phases:
    - duration: 60
      arrivalRate: 10  # 10 connections/second

scenarios:
  - name: "Connect and message"
    flow:
      - think: 2
      - send:
          url: /api/workspace/projects/test/messages
          method: POST
          json:
            message: "Test message"
```

```bash
# Run test
artillery run load-test.yml
```

---

## 🔍 Monitoring & Debugging

### Server Monitoring

```javascript
// Add to socketManager.js for enhanced logging
io.on('connection', (socket) => {
  console.log(`[Socket.io] Connected: ${socket.id}`);
  console.log(`[Socket.io] Active connections: ${io.engine.clientsCount}`);
  
  socket.on('disconnect', () => {
    console.log(`[Socket.io] Disconnected: ${socket.id}`);
    console.log(`[Socket.io] Remaining connections: ${io.engine.clientsCount}`);
  });
});
```

### Browser DevTools Monitoring

**Network Tab:**
- WS or WSS protocol for WebSocket connections
- Look for `socket.io/?EIO=4&transport=websocket`

**Console Tab:**
```javascript
// Check connection status
socketRef.current?.connected  // true if connected

// Check socket ID
socketRef.current?.id

// View recent messages
console.log('Messages:', messages)

// View typing users
console.log('Typing:', typingUsers)

// View online users
console.log('Online:', Array.from(onlineUsers))
```

### Metrics to Track

| Metric | Tool | Alert Threshold |
|--------|------|-----------------|
| Connection Time | DevTools | > 2 seconds |
| Message Latency | Console logs | > 500ms |
| Disconnection Rate | Server logs | > 5% |
| CPU Usage | Server monitor | > 80% |
| Memory Usage | Server monitor | > 500MB |

---

## 🚨 Troubleshooting

### Socket Connection Issues

**Problem**: "Socket fails to connect"
```
✓ Verify port 7000 is open
✓ Check CORS origins configured
✓ Review firewall settings
✓ Check browser console for errors
✓ Verify backend is running
```

**Problem**: "Connection succeeds but no events"
```
✓ Verify join_workspace is emitted
✓ Check projectId format
✓ Verify userId is correct
✓ Check Network tab for event packets
```

### Message Not Appearing

**Problem**: "Real-time message not received"
```
✓ Check socket connected (DevTools)
✓ Check message saved to DB
✓ Try polling fallback
✓ Check network tab for new_message event
✓ Verify correct room subscription
```

**Problem**: "Polling messages duplicated"
```
✓ Message merge logic uses _id as key
✓ Check for duplicate _ids in database
✓ Verify mergeMessages function
```

### Performance Issues

**Problem**: "High latency on messages"
```
✓ Check server load (htop/top)
✓ Check database query time
✓ Reduce polling interval if using fallback
✓ Enable compression in Socket.io
✓ Use CDN for static files
```

**Problem**: "Memory leak with typing events"
```
✓ Verify typeTimeout cleanup
✓ Check typingUsers Map doesn't grow indefinitely
✓ Monitor browser memory (DevTools)
✓ Ensure event listeners removed on unmount
```

---

## 📈 Performance Optimization Tips

### For Production

1. **Enable Compression**
```javascript
// socketManager.js
io = socketIO(httpServer, {
  compress: true,  // Enable message compression
  // ... other options
});
```

2. **Reduce Polling Interval (if needed)**
```javascript
// ProjectWorkspace.jsx
pollingRef.current = setInterval(() => loadMessages(1), 60000);  // 60s instead of 30s
```

3. **Implement Message Pagination**
- Only load last 50 messages initially
- Load more on scroll
- Reduces payload size

4. **Use Redis for Scaling**
```javascript
// For multiple server instances
const redis = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');

io.adapter(createAdapter(pubClient, subClient));
```

5. **Enable Socket.io Caching**
```javascript
io = socketIO(httpServer, {
  serveClient: false,  // Serve client from CDN
  // ...
});
```

---

## 🔐 Security Hardening

### CORS Configuration
```javascript
// Restrict to specific origins
initializeSocketIO(httpServer, [
  'https://yourdomain.com',
  'https://app.yourdomain.com'
]);
```

### Rate Limiting
```javascript
// Add to socketManager.js
const rateLimit = {};

socket.on('typing_start', (data) => {
  const key = socket.id;
  const now = Date.now();
  
  if (rateLimit[key] && now - rateLimit[key] < 100) {
    return; // Ignore rapid typing events
  }
  
  rateLimit[key] = now;
  // Process typing_start...
});
```

### Authentication Verification
```javascript
// Verify user has access to project
socket.on('join_workspace', async (data) => {
  const { projectId, userId } = data;
  
  // Verify user access to project
  const hasAccess = await validateProjectAccess(userId, projectId);
  if (!hasAccess) {
    socket.disconnect(true);
    return;
  }
  
  // Proceed with join
  socket.join(`project_${projectId}`);
});
```

---

## 📋 Post-Deployment Checklist

After deploying to production:

- [ ] All users can connect and send messages
- [ ] Real-time messages appear < 200ms
- [ ] Typing indicators work
- [ ] Online status updates
- [ ] Fallback to polling works
- [ ] No JavaScript errors in console
- [ ] Mobile clients work (responsive)
- [ ] File uploads with messages work
- [ ] Notifications still send
- [ ] Database not overloaded
- [ ] Memory usage stable
- [ ] CPU usage < 50%

---

## 🎯 Success Criteria

✅ **Implementation is successful when:**

1. Messages deliver via Socket.io in < 100ms
2. Polling fallback works when Socket.io disabled
3. Typing indicators show/hide correctly
4. Online status reflects actual connections
5. No duplicate messages in database
6. File attachments work with messages
7. Zero message loss over 24 hours
8. All existing features still work
9. Load testing shows < 10% CPU at 100 concurrent users
10. Error logs show no critical errors

---

## 📞 Rollback Procedure

If critical issues discovered:

```bash
# Revert to previous commit
git revert <commit-hash>

# Or remove Socket.io:
npm uninstall socket.io socket.io-client

# Comments out: emitNewMessage() in sendMessage controller
# Removes: Socket.io listeners from ProjectWorkspace.jsx
# Remove: TypingIndicator component usage
# Remove: Online status from WorkspaceHeader
# Change port back to 5000

# Polling will work immediately with no changes needed
```

---

## 📚 Reference Documentation

- [Socket.io Documentation](https://socket.io/docs/)
- [Socket.io Client API](https://socket.io/docs/v4/client-api/)
- [Socket.io Server API](https://socket.io/docs/v4/server-api/)
- [Testing with Socket.io](https://socket.io/docs/v4/testing/)

---

**Status**: ✅ Ready for Production
**Last Updated**: Phase 5.4.1
**Deployment Date**: [DATE]
