import api from './api';

const liveClassesService = {
  // Get all available qaris
  getQaris: (params = {}) => api.get('/classes/qaris', { params }),
  
  // Get single qari profile
  getQari: (qariId) => api.get(`/classes/qaris/${qariId}`),
  
  // Book a session
  bookSession: (sessionData) => api.post('/classes/book', sessionData),
  
  // Get my sessions
  getMySessions: (params = {}) => api.get('/classes/my-sessions', { params }),
  
  // Get session by ID
  getSession: (sessionId) => api.get(`/classes/sessions/${sessionId}`),
  
  // Update session status
  updateSessionStatus: (sessionId, statusData) => 
    api.put(`/classes/sessions/${sessionId}/status`, statusData),
  
  // Cancel session
  cancelSession: (sessionId) => api.delete(`/classes/sessions/${sessionId}`),
  
  // Add session review
  addReview: (sessionId, reviewData) => 
    api.post(`/classes/sessions/${sessionId}/reviews`, reviewData),
  
  // Get qari availability
  getQariAvailability: (qariId, date) => 
    api.get(`/classes/qaris/${qariId}/availability`, { params: { date } }),
  
  // Get session recordings
  getSessionRecordings: (sessionId) => 
    api.get(`/classes/sessions/${sessionId}/recordings`),
  
  // Download recording
  downloadRecording: (sessionId, recordingId) => 
    api.get(`/classes/sessions/${sessionId}/recordings/${recordingId}/download`),
};

export default liveClassesService;