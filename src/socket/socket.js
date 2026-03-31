import { io } from "socket.io-client";

let socket;

export const connectSocket = ({ userId, role, classId }) => {
  // Agar socket already connected hai toh return karo
  if (socket && socket.connected) {
    console.log('Socket already connected');
    return socket;
  }

  // Agar socket exists but disconnected hai toh disconnect karo
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const SOCKET_URL = import.meta.env.SOCKET_URL || 'http://localhost:5001';
  
  console.log('Connecting to socket:', { userId, role, classId, url: SOCKET_URL });

  // Important: Ensure classId is a string and not undefined
  const safeClassId = classId || '';
  
  socket = io(SOCKET_URL, {
    query: { 
      userId, 
      role, 
      classId: safeClassId 
    },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: true,
    // forceNew: true,
    path: '/socket.io'
  });

  socket.on('connect', () => {
    console.log('Socket connected successfully with ID:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('Socket reconnected after', attemptNumber, 'attempts');
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    console.log('Disconnecting socket...');
    socket.disconnect();
    socket = null;
  }
};