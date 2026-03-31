// teacherService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const teacherService = {
  // Get all teachers
  getAllTeachers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teachers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teachers:', error);
      throw error;
    }
  },

  // Get teacher by ID
  getTeacherById: async (teacherId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teachers/${teacherId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher:', error);
      throw error;
    }
  },

  // Search teachers
  searchTeachers: async (query) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teachers/search`, {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching teachers:', error);
      throw error;
    }
  },

  // Filter teachers
  filterTeachers: async (filters) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/teachers/filter`, filters);
      return response.data;
    } catch (error) {
      console.error('Error filtering teachers:', error);
      throw error;
    }
  }
};