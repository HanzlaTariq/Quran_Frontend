import api from './api';

const userService = {
  // Get user dashboard stats
  getDashboardStats: () => api.get('/dashboard/stats'),
  
  // Get learning progress
  getLearningProgress: () => api.get('/dashboard/progress'),
  
  // Get upcoming sessions
  getUpcomingSessions: () => api.get('/dashboard/upcoming-sessions'),
  
  // Get achievements
  getAchievements: () => api.get('/dashboard/achievements'),
  
  // Get notifications
  getNotifications: () => api.get('/notifications'),
  
  // Mark notification as read
  markNotificationAsRead: (notificationId) => 
    api.put(`/notifications/${notificationId}/read`),
  
  // Mark all notifications as read
  markAllNotificationsAsRead: () => api.put('/notifications/read-all'),
  
  // Get subscription info
  getSubscription: () => api.get('/subscription'),
  
  // Update subscription
  updateSubscription: (subscriptionData) => 
    api.put('/subscription', subscriptionData),
  
  // Get payment history
  getPaymentHistory: () => api.get('/payments/history'),
  
  // Get invoices
  getInvoices: () => api.get('/payments/invoices'),
  
  // Download invoice
  downloadInvoice: (invoiceId) => 
    api.get(`/payments/invoices/${invoiceId}/download`),
  
  // Get support tickets
  getSupportTickets: () => api.get('/support/tickets'),
  
  // Create support ticket
  createSupportTicket: (ticketData) => 
    api.post('/support/tickets', ticketData),
  
  // Get ticket messages
  getTicketMessages: (ticketId) => 
    api.get(`/support/tickets/${ticketId}/messages`),
  
  // Send message to ticket
  sendTicketMessage: (ticketId, message) => 
    api.post(`/support/tickets/${ticketId}/messages`, { message }),
};

export default userService;