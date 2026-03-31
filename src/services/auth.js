import api from './api';

const authService = {
  // Register user
  register: (userData) => api.post('/auth/register', userData),
  
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Get current user
  getMe: () => api.get('/auth/me'),
  
  // Update profile
  updateProfile: (userData) => api.put('/auth/profile', userData),
  
  // Change password
  changePassword: (passwords) => api.put('/auth/change-password', passwords),
  
  // Forgot password
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  // Reset password
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  
  // Verify email
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  
  // Resend verification email
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  
  // Update profile picture
  updateProfilePicture: (profileImage) => api.put('/auth/profile-picture', { profileImage }),
  
  // Delete account
  deleteAccount: (password) => api.delete('/auth/delete-account', { data: { password } }),
  
  // Logout
  logout: () => api.post('/auth/logout'),
};

export default authService;