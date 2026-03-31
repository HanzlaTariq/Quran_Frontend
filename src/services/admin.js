import api from './api';

const adminService = {
  // Get admin dashboard stats
  getAdminStats: () => api.get('/admin/stats'),
  
  // Get all users
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  
  // Get user by ID
  getUser: (userId) => api.get(`/admin/users/${userId}`),
  
  // Update user
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  
  // Delete user
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  
  // Get all sessions
  getAllSessions: (params = {}) => api.get('/admin/sessions', { params }),
  
  // Get all qari requests
  getQariRequests: () => api.get('/admin/qari-requests'),
  
  // Approve qari request
  approveQariRequest: (requestId) => 
    api.put(`/admin/qari-requests/${requestId}/approve`),
  
  // Reject qari request
  rejectQariRequest: (requestId) => 
    api.put(`/admin/qari-requests/${requestId}/reject`),
  
  // Get system logs
  getSystemLogs: (params = {}) => api.get('/admin/logs', { params }),
  
  // Get revenue stats
  getRevenueStats: (params = {}) => api.get('/admin/revenue', { params }),
  
  // Get platform analytics
  getPlatformAnalytics: (params = {}) => api.get('/admin/analytics', { params }),
  
  // Send broadcast notification
  sendBroadcastNotification: (notificationData) => 
    api.post('/admin/broadcast', notificationData),
  
  // Get content submissions
  getContentSubmissions: () => api.get('/admin/content/submissions'),
  
  // Approve content
  approveContent: (contentId) => 
    api.put(`/admin/content/${contentId}/approve`),
  
  // Reject content
  rejectContent: (contentId) => 
    api.put(`/admin/content/${contentId}/reject`),

  // Enrollment management
  getEnrollments: (params = {}) => api.get('/admin/enrollments', { params }),
  getEnrollment: (id) => api.get(`/admin/enrollments/${id}`),
  createEnrollment: (enrollmentData) => api.post('/admin/enrollments', enrollmentData),
  updateEnrollmentStatus: (id, statusData) => api.put(`/admin/enrollments/${id}/status`, statusData),
  approveEnrollment: (id, notes) => api.put(`/admin/enrollments/${id}/approve`, { notes }),
  deleteEnrollment: (id) => api.delete(`/admin/enrollments/${id}`),
  getEnrollmentStats: () => api.get('/admin/enrollments/stats'),

  // Get all ulmas for dropdown
  getAllUlmas: () => api.get('/admin/ulma'),

  // Get all students for dropdown
  getAllStudents: () => api.get('/admin/users?role=student'),

  // Get all courses for dropdown
  getAllCourses: () => api.get('/admin/courses'),
};

export default adminService;