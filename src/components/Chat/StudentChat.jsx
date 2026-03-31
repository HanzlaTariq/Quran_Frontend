import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Avatar,
  Paper,
  CircularProgress,
  alpha,
  useTheme,
  Tooltip,
  Badge,
  Fade,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Send as SendIcon,
  Check as CheckIcon,
  DoneAll as DoneAllIcon,
  MoreVert as MoreVertIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  ArrowBack as ArrowBackIcon,
  Error as ErrorIcon,
  WifiOff as WifiOffIcon,
} from '@mui/icons-material';
import { format, isToday, isYesterday } from 'date-fns';
import api from '../../config/axios';
import { connectSocket, getSocket, disconnectSocket } from '../../socket/socket';
import { motion, AnimatePresence } from 'framer-motion';

const StudentChat = ({ conversationId, ulma, onBack }) => {
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [courseId, setCourseId] = useState(null);
  const [user, setUser] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('User loaded:', parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setError('Failed to load user data');
        setShowError(true);
      }
    } else {
      setError('Please login to continue');
      setShowError(true);
    }
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fetch conversation details to get courseId
  useEffect(() => {
    const fetchConversationDetails = async () => {
      if (!conversationId) return;

      try {
        console.log('Fetching conversation details for:', conversationId);
        const res = await api.get(`/chat/conversation/${conversationId}`);

        console.log('Conversation details response:', res.data);

        if (res.data.success && res.data.conversation?.courseId) {
          setCourseId(res.data.conversation.courseId);
          console.log('CourseId set to:', res.data.conversation.courseId);
        } else {
          setCourseId(conversationId); // fallback
        }
      } catch (err) {
        console.error('Error fetching conversation details:', err);
        setCourseId(conversationId);
      }
    };

    if (conversationId) fetchConversationDetails();
  }, [conversationId]);

  // Connect socket — sirf user load hone pe ek baar
  useEffect(() => {
    if (!user) return;

    console.log('Attempting initial socket connection for user:', user._id);

    const connectToSocket = () => {
      try {
        disconnectSocket(); // purana socket saaf karo

        const socket = connectSocket({
          userId: user._id,
          role: 'student',
          classId: '' // pehle empty — baad mein join-room se update hoga
        });

        if (socket) {
          socket.on('connect', () => {
            console.log('Socket connected successfully with ID:', socket.id);
            setSocketConnected(true);
            setError(null);
            setRetryCount(0);
          });

          socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
            setSocketConnected(false);
            setRetryCount(prev => prev + 1);
            if (retryCount < 5) {
              setError('Connection error. Retrying...');
            } else {
              setError('Unable to connect to chat server. Please refresh.');
            }
          });

          socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            setSocketConnected(false);
          });

          socket.on('reconnect', (attemptNumber) => {
            console.log('Socket reconnected after', attemptNumber, 'attempts');
            setSocketConnected(true);
            setError(null);
          });
        }
      } catch (error) {
        console.error('Error connecting socket:', error);
        setSocketConnected(false);
      }
    };

    connectToSocket();

    return () => {
      console.log('Cleaning up socket connection');
      disconnectSocket();
    };
  }, [user]); // sirf user pe depend — courseId pe nahi

  // Jab courseId aa jaye to sirf room join karo (reconnect nahi)
  useEffect(() => {
    if (!socketConnected || !courseId || !user) return;

    const socket = getSocket();
    if (!socket) return;

    console.log('CourseId updated → joining room:', courseId);

    socket.emit('join-room', {
      userId: user._id,
      classId: courseId,
      role: 'student'
    });
  }, [courseId, socketConnected, user]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId) return;

      try {
        setLoading(true);
        console.log('Fetching messages for conversation:', conversationId);

        const res = await api.get(`/chat/messages/${conversationId}`);

        console.log('Messages response:', res.data);

        if (res.data.success) {
          setMessages(res.data.messages || []);
        } else if (Array.isArray(res.data)) {
          setMessages(res.data);
        } else {
          setMessages([]);
        }

        setError(null);
      } catch (err) {
        console.error('Error loading messages:', err);
        setError(err.response?.data?.error || 'Failed to load messages');
        setShowError(true);
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) fetchMessages();
  }, [conversationId]);

  // Socket listeners for incoming messages & errors
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    console.log('Setting up message listeners');

    const handleIncomingMessage = (msg) => {
      console.log('Received message via socket:', msg);

      if (msg.conversationId === conversationId) {
        setMessages((prev) => {
          const existingIndex = prev.findIndex(m => m.tempId === msg.tempId);

          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = { ...msg, isSending: false };
            return updated;
          }

          const messageExists = prev.some(m => m._id === msg._id);
          if (!messageExists) {
            return [...prev, msg];
          }
          return prev;
        });
      }
    };

    const handleMessageError = (errData) => {
      console.error('Server rejected message:', errData);

      setMessages(prev => prev.map(m => 
        m.tempId === errData.tempId 
          ? { ...m, isSending: false, hasError: true }
          : m
      ));

      setError(errData.error || 'Message delivery failed');
      setShowError(true);
    };

    socket.on('chat-message', handleIncomingMessage);
    socket.on('message-error', handleMessageError);

    return () => {
      socket.off('chat-message', handleIncomingMessage);
      socket.off('message-error', handleMessageError);
    };
  }, [conversationId, socketConnected]);

  // Send message
  const sendMessage = async () => {
    if (!newMsg.trim() || sending || !user || !socketConnected) return;

    const messageText = newMsg.trim();
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setNewMsg('');
    setSending(true);

    try {
      const tempMessage = {
        _id: tempId,
        tempId,
        conversationId,
        senderId: user._id,
        message: messageText,
        createdAt: new Date().toISOString(),
        isRead: false,
        isSending: true
      };

      setMessages(prev => [...prev, tempMessage]);

      const socket = getSocket();

      if (socket?.connected) {
        console.log('Sending via socket:', { message: messageText, conversationId, tempId, courseId });

        socket.emit('chat-message', {
          message: messageText,
          conversationId,
          tempId,
          senderId: user._id,
          classId: courseId || ''  // ← yeh line zaroori hai
        });

        // Timeout check
        setTimeout(() => {
          setMessages(prev => {
            const stillSending = prev.some(m => m.tempId === tempId && m.isSending);
            if (stillSending) {
              setError('Message delivery timeout – try again');
              setShowError(true);
            }
            return prev;
          });
        }, 8000);
      } else {
        // HTTP fallback
        const response = await api.post('/chat/message', {
          conversationId,
          message: messageText
        });

        if (response.data.success) {
          setMessages(prev =>
            prev.map(msg =>
              msg.tempId === tempId
                ? { ...response.data.message, isSending: false }
                : msg
            )
          );
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
      setError('Failed to send message');
      setShowError(true);
      setNewMsg(messageText);
    } finally {
      setSending(false);
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    try {
      await api.delete(`/chat/message/${messageId}`);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message');
      setShowError(true);
    }
  };

  // Format time
  const formatMessageTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      if (isToday(date)) return format(date, 'HH:mm');
      if (isYesterday(date)) return `Yesterday ${format(date, 'HH:mm')}`;
      return format(date, 'MMM d, HH:mm');
    } catch {
      return '';
    }
  };

  // Group by date
  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach(msg => {
      try {
        const date = new Date(msg.createdAt).toDateString();
        groups[date] = groups[date] || [];
        groups[date].push(msg);
      } catch {}
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  const messageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.8 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
  };

  if (!user) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <ErrorIcon sx={{ fontSize: 48, color: theme.palette.error.main, mb: 2 }} />
        <Typography variant="h6" color="error">Authentication Required</Typography>
        <Typography color="text.secondary">Please login to continue chatting</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: theme.palette.background.default, position: 'relative' }}>

      <Snackbar open={showError} autoHideDuration={6000} onClose={() => setShowError(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="error" onClose={() => setShowError(false)}>{error}</Alert>
      </Snackbar>

      {!socketConnected && (
        <Fade in>
          <Alert severity="warning" icon={<WifiOffIcon />} sx={{ position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, maxWidth: '90%' }}>
            {retryCount < 5 ? 'Connecting to chat...' : 'Connection lost. Please refresh.'}
          </Alert>
        </Fade>
      )}

      {/* Header */}
      <Paper elevation={2} sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`, bgcolor: theme.palette.background.paper }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {onBack && <IconButton onClick={onBack}><ArrowBackIcon /></IconButton>}
          <Badge overlap="circular" variant="dot" color={socketConnected ? "success" : "warning"}>
            <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
              {ulma?.name?.charAt(0) || 'T'}
            </Avatar>
          </Badge>
          <Box flex={1}>
            <Typography variant="h6">{ulma?.name || 'Teacher'}</Typography>
            <Typography variant="caption" color="text.secondary">
              {socketConnected ? 'Online' : 'Connecting...'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {loading ? (
          <CircularProgress />
        ) : Object.keys(messageGroups).length === 0 ? (
          <Typography>No messages yet</Typography>
        ) : (
          Object.entries(messageGroups).map(([date, dateMsgs]) => (
            <Box key={date}>
              <Typography variant="caption" align="center">{date}</Typography>
              {dateMsgs.map(msg => {
                const isOwn = msg.senderId === user?._id;
                return (
                  <Box key={msg._id || msg.tempId} sx={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', mb: 1 }}>
                    <Paper sx={{ p: 1.5, maxWidth: '70%', bgcolor: isOwn ? 'primary.light' : 'grey.100' }}>
                      <Typography>{msg.message}</Typography>
                      <Typography variant="caption">{formatMessageTime(msg.createdAt)}</Typography>
                      {msg.isSending && <CircularProgress size={12} />}
                    </Paper>
                  </Box>
                );
              })}
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type a message..."
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            disabled={!socketConnected || sending}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={!newMsg.trim() || sending || !socketConnected}
          >
            {sending ? <CircularProgress size={20} /> : <SendIcon />}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default StudentChat;


