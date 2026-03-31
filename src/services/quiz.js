import api from './api';

const quizService = {
  // Get all quizzes
  getQuizzes: (params = {}) => api.get('/quizzes', { params }),
  
  // Get single quiz
  getQuiz: (quizId) => api.get(`/quizzes/${quizId}`),
  
  // Submit quiz answers
  submitQuiz: (quizId, answers) => 
    api.post(`/quizzes/${quizId}/submit`, answers),
  
  // Get my quiz results
  getMyResults: () => api.get('/quizzes/my-results'),
  
  // Get quiz result by ID
  getQuizResult: (resultId) => api.get(`/quizzes/results/${resultId}`),
  
  // Get leaderboard
  getLeaderboard: (params = {}) => api.get('/quizzes/leaderboard', { params }),
  
  // Get quiz categories
  getCategories: () => api.get('/quizzes/categories'),
  
  // Get quiz stats
  getQuizStats: () => api.get('/quizzes/stats'),
  
  // Create custom quiz
  createQuiz: (quizData) => api.post('/quizzes/custom', quizData),
  
  // Get recommended quizzes
  getRecommendedQuizzes: () => api.get('/quizzes/recommended'),
};

export default quizService;