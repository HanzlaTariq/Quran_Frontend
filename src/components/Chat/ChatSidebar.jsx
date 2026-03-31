import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  IconButton,
  Divider,
  Badge,
  CircularProgress,
  InputAdornment,
  alpha,
  useTheme,
  Paper,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Send as SendIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const ChatSidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    if (open && user) {
      fetchConversations();
    }
  }, [open, user]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/chat/conversations');
      
      if (response.data.success) {
        // Format conversations - conversation model uses User IDs
        const formattedConversations = response.data.conversations.map((conv) => {
          let otherUser = null;
          let displayName = 'Unknown';

          if (user.role === 'student') {
            // Student sees ulma (ulmaId is User ID)
            otherUser = {
              _id: conv.ulmaId?._id || conv.ulmaId,
              name: conv.ulmaId?.name || conv.ulmaId?.user?.name || 'Teacher',
              email: conv.ulmaId?.email || conv.ulmaId?.user?.email,
            };
            displayName = otherUser.name;
          } else if (user.role === 'ulma') {
            // Ulma sees students (studentId is User ID)
            otherUser = {
              _id: conv.studentId?._id || conv.studentId,
              name: conv.studentId?.name || conv.studentId?.user?.name || 'Student',
              email: conv.studentId?.email || conv.studentId?.user?.email,
            };
            displayName = otherUser.name;
          }

          return {
            ...conv,
            otherUser,
            displayName,
          };
        });

        // Keep only one conversation per partner (latest one),
        // so same teacher/student does not appear multiple times.
        const uniqueConversations = [];
        const seenPartnerIds = new Set();

        formattedConversations.forEach((conv) => {
          const partnerId = conv.otherUser?._id?.toString();
          const dedupeKey = partnerId || conv._id?.toString();

          if (!seenPartnerIds.has(dedupeKey)) {
            seenPartnerIds.add(dedupeKey);
            uniqueConversations.push(conv);
          }
        });

        setConversations(uniqueConversations);
        
        // Clear per-conversation unread badges until real per-conversation
        // unread API is available.
        setUnreadCounts({});
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    onClose(); // Close the sidebar
    if (user.role === 'student') {
      navigate(`/student/chat/${conversation._id}`);
    } else if (user.role === 'ulma') {
      navigate(`/ulma/chat/${conversation._id}`);
    }
  };

  const getRoleIcon = () => {
    return user.role === 'student' ? <SchoolIcon /> : <PersonIcon />;
  };

  const getRoleColor = () => {
    return user.role === 'student' ? theme.palette.primary.main : theme.palette.secondary.main;
  };

  // Animation variants
  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    }),
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  // Return null if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 420 },
          display: 'flex',
          flexDirection: 'column',
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
          backdropFilter: 'blur(10px)',
          borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: theme.shadows[20],
        },
      }}
      SlideProps={{
        direction: "right"
      }}
    >
      {/* Header with gradient background */}
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: `radial-gradient(circle at 30% 50%, ${alpha(theme.palette.common.white, 0.1)} 0%, transparent 50%)`,
            pointerEvents: 'none',
          }
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} position="relative">
          <Box display="flex" alignItems="center" gap={1}>
            <ChatIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight={600}>
              {user.role === 'student' ? 'Messages from Teachers' : 'Student Messages'}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'white',
              bgcolor: alpha(theme.palette.common.white, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.common.white, 0.2),
              },
              transition: 'all 0.2s',
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Search field with custom styling */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: alpha(theme.palette.common.white, 0.15),
              color: 'white',
              borderRadius: 3,
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: alpha(theme.palette.common.white, 0.3),
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.common.white,
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: alpha(theme.palette.common.white, 0.7),
              opacity: 1,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: alpha(theme.palette.common.white, 0.7) }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Conversations List */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
        {loading ? (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{ height: '100%', gap: 2 }}
          >
            <CircularProgress 
              size={48} 
              thickness={4}
              sx={{ 
                color: theme.palette.primary.main,
                filter: `drop-shadow(0 4px 8px ${alpha(theme.palette.primary.main, 0.3)})`
              }} 
            />
            <Typography variant="body2" color="textSecondary">
              Loading conversations...
            </Typography>
          </Box>
        ) : filteredConversations.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: 'inline-flex',
              }}
            >
              <MessageIcon sx={{ fontSize: 48, color: alpha(theme.palette.primary.main, 0.5) }} />
            </Paper>
            <Typography variant="h6" fontWeight={600} color="textPrimary">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 280 }}>
              {searchTerm 
                ? `No results found for "${searchTerm}"` 
                : user.role === 'student' 
                  ? 'Start a conversation with your teachers' 
                  : 'Start a conversation with your students'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ px: 2 }}>
            <AnimatePresence>
              {filteredConversations.map((conversation, index) => {
                const unreadCount = unreadCounts[conversation._id] || 0;
                
                return (
                  <motion.div
                    key={conversation._id}
                    custom={index}
                    variants={listItemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Paper
                      elevation={selectedConversation?._id === conversation._id ? 4 : 1}
                      sx={{
                        mb: 1,
                        borderRadius: 2,
                        overflow: 'hidden',
                        transition: 'all 0.2s',
                        bgcolor: selectedConversation?._id === conversation._id 
                          ? alpha(theme.palette.primary.main, 0.08)
                          : theme.palette.background.paper,
                        border: selectedConversation?._id === conversation._id
                          ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                          : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      }}
                    >
                      <ListItem
                        button
                        selected={selectedConversation?._id === conversation._id}
                        onClick={() => handleSelectConversation(conversation)}
                        sx={{
                          py: 1.5,
                          '&:hover': { 
                            bgcolor: 'transparent',
                          },
                          '&.Mui-selected': { 
                            bgcolor: 'transparent',
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            variant="dot"
                            color="success"
                            sx={{
                              '& .MuiBadge-badge': {
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                border: `2px solid ${theme.palette.background.paper}`,
                                bgcolor: theme.palette.success.main,
                              }
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: getRoleColor(),
                                background: `linear-gradient(135deg, ${alpha(getRoleColor(), 0.8)} 0%, ${getRoleColor()} 100%)`,
                                width: 48,
                                height: 48,
                                boxShadow: `0 4px 8px ${alpha(getRoleColor(), 0.3)}`,
                              }}
                            >
                              {conversation.displayName?.charAt(0) || 'U'}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <Typography
                                variant="subtitle1"
                                fontWeight={unreadCount > 0 ? 600 : 400}
                                sx={{
                                  color: unreadCount > 0 ? 'text.primary' : 'text.secondary',
                                }}
                              >
                                {conversation.displayName}
                              </Typography>
                              {unreadCount > 0 && (
                                <Chip
                                  label={unreadCount}
                                  size="small"
                                  sx={{
                                    bgcolor: theme.palette.primary.main,
                                    color: 'white',
                                    fontWeight: 600,
                                    height: 20,
                                    minWidth: 20,
                                    '& .MuiChip-label': {
                                      px: 0.5,
                                    },
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              sx={{
                                color: unreadCount > 0 ? 'text.primary' : 'text.secondary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '220px',
                                fontWeight: unreadCount > 0 ? 500 : 400,
                              }}
                            >
                              {conversation.lastMessage || (
                                <Box component="span" sx={{ fontStyle: 'italic', opacity: 0.7 }}>
                                  No messages yet
                                </Box>
                              )}
                            </Typography>
                          }
                        />
                      </ListItem>
                    </Paper>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </List>
        )}
      </Box>

      {/* Footer with status */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: alpha(theme.palette.background.paper, 0.5),
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: theme.palette.success.main,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { opacity: 1, transform: 'scale(1)' },
              '50%': { opacity: 0.5, transform: 'scale(1.2)' },
              '100%': { opacity: 1, transform: 'scale(1)' },
            },
          }}
        />
        <Typography variant="caption" color="textSecondary">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
    </Drawer>
  );
};

export default ChatSidebar;