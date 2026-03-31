import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    // Return only the data part of the response
    return response.data;
  },
  (error) => {
    // Handle different error scenarios
    let errorMessage = 'An unexpected error occurred';

    if (error.response) {
      // Server responded with error status
      errorMessage = error.response.data?.error || 
                     error.response.data?.message || 
                     `Server error: ${error.response.status}`;
      
      // Handle 401 - Unauthorized (token expired or invalid)
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.request) {
        // Request was made but no response received
        const cfg = error.config || {};
        const attempted = `${cfg.baseURL || ''}${cfg.url || ''}`;
        // If offline, prefer that message
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          errorMessage = 'No internet connection. Please check your network and try again.';
        } else {
          errorMessage = `No response from server at ${attempted}. Server may be down or blocked (CORS).`;
        }
        // Log full error for debugging
        console.error('API request had no response:', { attemptedUrl: attempted, error });
    } else {
      // Something else happened
      errorMessage = error.message || errorMessage;
    }

    // Create a consistent error object
    const customError = new Error(errorMessage);
    customError.response = error.response;
    customError.request = error.request;
    
    return Promise.reject(customError);
  }
);

export default api;