import api from './api';

const chatService = {
  // Get conversations for current user
  getMyConversations: () => api.get('/chat/conversations'),

  // Get messages for a conversation
  getMessages: (conversationId) => api.get(`/chat/messages/${conversationId}`),

  // Send message
  sendMessage: (messageData) => api.post('/chat/message', messageData),

  // Create conversation
  createConversation: (conversationData) => api.post('/chat/conversation', conversationData),

  // Get unread message count
  getUnreadCount: () => api.get('/chat/unread-count'),

  // Delete message
  deleteMessage: (messageId) => api.delete(`/chat/message/${messageId}`),

  // Get conversation details
  getConversationDetails: (conversationId) => api.get(`/chat/conversation/${conversationId}`),
};

export default chatService;