import React, { createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { SystemSettingsProvider } from './context/SystemSettingsContext';
import Layout from './components/layout/Layout';



// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Student Pages
import StudentDashboard from './pages/student/component/dashboard/index';
import StudentCourses from './pages/student/Courses';
import StudentProgress from './pages/student/Progress';
import StudentFees from './pages/student/Fees';
import LiveClass from './pages/student/LiveClass';
import MonthlyReport from './pages/student/MonthlyReport';
import ViewMyCurruntEnrollemt from './pages/student/CurrentEnrollments';
import StudentChatPage from './pages/student/ChatPage';
import StudentTimetable from './pages/student/Timetable';
import StudentSettings from './pages/student/Setting'; 
// Ulma Pages
import UlmaDashboard from './pages/ulma/Dashboard';
import UlmaSettings from './pages/ulma/Settings'; // New
import UlmaTimetable from './pages/ulma/Timetable'; // New
import UlmaSchedule from './pages/ulma/Schedule';
import UlmaStudents from './pages/ulma/Students';
import UlmaLiveClass from './pages/ulma/LiveClass';
import UlmaProfile from './pages/ulma/Profile';
import UlmaAttendance from './pages/ulma/Attendance';

// Additional Ulma Pages
// import UlmaAvailability from './pages/ulma/Availability'; // New
// import UlmaPerformance from './pages/ulma/Performance'; // New
// import UlmaEarnings from './pages/ulma/Earnings'; // New
// import UlmaQuizzes from './pages/ulma/Quizzes'; // New
// import UlmaReports from './pages/ulma/Reports'; // New
// import UlmaNotifications from './pages/ulma/Notifications'; // New
import UlmaMessages from './pages/ulma/Messages'; // New

// Quran Page
import Quran from './pages/Quran/Quran';

// Home Page
import Home from './pages/HomePage';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCourses from './pages/admin/Courses';
import AdminPayments from './pages/admin/Payments';
import AdminUlma from './pages/admin/Ulma';
import AdminEnrollments from './pages/admin/Enrollments';
import AdminClasses from './pages/admin/Classes';
import AdminSettings from './pages/admin/Settings';
import AdminReports from './pages/admin/Reports';

// Components
import PrivateRoute from './components/PrivateRoute';

// -------------------- Theme & Query Client --------------------
const theme = createTheme({
  palette: {
    primary: {
      main: '#1a4d2e',
      light: '#4a7856',
      dark: '#0f2e1c',
    },
    secondary: {
      main: '#d4af37',
      light: '#dcc469',
      dark: '#9c7d1e',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// -------------------- App Component --------------------
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '10px',
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <Router>
          <AuthProvider>
            <SystemSettingsProvider>
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/login" element={<Navigate to="/login" replace />} />

              
              {/* Student Routes */}
              <Route path="/student" element={<PrivateRoute allowedRoles={['student']} />}>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="courses" element={<StudentCourses />} />
                <Route path="progress" element={<StudentProgress />} />
                <Route path="fees" element={<StudentFees />} />
                <Route path="reports/monthly" element={<MonthlyReport />} />
                <Route path="current-enrollments" element={<ViewMyCurruntEnrollemt />} />
                <Route path="live-classes" element={<LiveClass />} />
                <Route path="live-class/:classId" element={<LiveClass />} />
                <Route path="timetable" element={<StudentTimetable />} />
                <Route path="chat/:conversationId?" element={<StudentChatPage />} />
                <Route path="settings" element={<StudentSettings />} />
                <Route path="quran" element={<Quran />} />
              </Route>

              {/* Ulma Routes */}
              <Route path="/ulma" element={<PrivateRoute allowedRoles={['ulma']} />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<UlmaDashboard />} />
                <Route path="settings" element={<UlmaSettings />} />
                <Route path="timetable" element={<UlmaTimetable />} />
                <Route path="schedule" element={<UlmaSchedule />} />
                <Route path="students" element={<UlmaStudents />} />
                <Route path="live-class/:classId" element={<UlmaLiveClass />} />
                <Route path="profile" element={<UlmaProfile />} />
                <Route path="attendance" element={<UlmaAttendance />} />
                <Route path="chat/:conversationId" element={<UlmaMessages />} />
                {/* <Route path="availability" element={<UlmaAvailability />} /> */}
                {/* <Route path="performance" element={<UlmaPerformance />} />
                <Route path="earnings" element={<UlmaEarnings />} />
                <Route path="quizzes" element={<UlmaQuizzes />} />
                <Route path="reports" element={<UlmaReports />} />
                <Route path="notifications" element={<UlmaNotifications />} />
               
                <Route path="students/:studentId" element={<UlmaStudents />} /> */}
                <Route path="quran" element={<Quran />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<PrivateRoute allowedRoles={['admin']} />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="ulma" element={<AdminUlma />} />
                <Route path="enrollments" element={<AdminEnrollments />} />
                <Route path="classes" element={<AdminClasses />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="reports" element={<AdminReports />} />
              </Route>

              {/* Default & Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </SystemSettingsProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;