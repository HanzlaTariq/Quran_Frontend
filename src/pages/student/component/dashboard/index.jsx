import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, LinearProgress, Typography, Box, Button } from '@mui/material';
import { useAuth } from '../../../../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { connectSocket } from "../../../../socket/socket";
import { toast } from 'react-hot-toast';

// Import sub-components
import WelcomeHeader from './WelcomeHeader';
import StatCards from './StatCards';
import ProgressSection from './ProgressSection';
import UpcomingClasses from './UpcomingClasses';
import PendingAssignments from './PendingAssignments';
import TeacherSection from './TeacherSection';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalClasses: 0,
    attendanceRate: 0,
    assignmentsPending: 0,
    assignmentsCompleted: 0,
    upcomingClassesCount: 0,
    activeEnrollments: 0,
    progressPercentage: 0,
    currentPara: 1,
    currentSurah: 'Al-Fatiha',
    ayatCompleted: 0
  });
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const [
        profileRes,
        classesRes,
        upcomingClassesRes,
        assignmentsRes,
        notificationsRes,
        statsRes,
        enrollmentsRes
      ] = await Promise.all([
        axios.get('/api/auth/profile'),
        axios.get('/api/students/classes?limit=10'),
        axios.get('/api/students/classes/upcoming'),
        axios.get('/api/students/assignments?status=pending&limit=5'),
        axios.get('/api/notifications?limit=10'),
        axios.get('/api/students/stats'),
        axios.get('/api/students/enroll/my-enrollments'),
      ]);

      const classes = Array.isArray(classesRes.data) ? classesRes.data : 
                     classesRes.data?.classes || [];

      const upcomingClasses = Array.isArray(upcomingClassesRes.data)
        ? upcomingClassesRes.data
        : upcomingClassesRes.data?.classes || [];

      const assignments = assignmentsRes.data?.assignments || 
                         assignmentsRes.data || [];

      const enrollments = enrollmentsRes.data?.enrollments || 
                         enrollmentsRes.data || [];

      const statsData = statsRes.data?.stats || statsRes.data || {};

      setDashboardData({
        student: profileRes.data,
        upcomingClasses: upcomingClasses.filter(c => c?.status === 'scheduled' || c?.status === 'ongoing'),
        recentClasses: classes.filter(c => c?.status === 'completed'),
        pendingAssignments: assignments.filter(a => a?.status === 'pending'),
        completedAssignments: assignments.filter(a => a?.status === 'completed'),
        enrollments: enrollments,
        activeEnrollment: enrollments.find(e => 
          e?.status === 'approved' || e?.status === 'active'
        )
      });
      
      setNotifications(notificationsRes.data?.notifications || 
                      notificationsRes.data || []);
      
      setStats({
        totalClasses: statsData.totalClasses || 0,
        attendanceRate: statsData.attendanceRate || 0,
        assignmentsPending: statsData.assignmentsPending || 0,
        assignmentsCompleted: statsData.assignmentsCompleted || 0,
        upcomingClassesCount: statsData.upcomingClassesCount || 0,
        activeEnrollments: statsData.activeEnrollments || 0,
        progressPercentage: statsData.progressPercentage || 0,
        currentPara: statsData.currentPara || 1,
        currentSurah: statsData.currentSurah || 'Al-Fatiha',
        ayatCompleted: statsData.ayatCompleted || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Poll for updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const activeEnrollment = dashboardData?.activeEnrollment;

  useEffect(() => {
    if (!user?._id || !activeEnrollment?._id) return;

    const socket = connectSocket({
      userId: user._id,
      role: "student",
      enrollmentId: activeEnrollment._id,
      ulmaId: activeEnrollment.ulma?._id
    });

    socket?.on('new-notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    socket?.on('class-started', (data) => {
      // Update class status in dashboard data
      setDashboardData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          upcomingClasses: prev.upcomingClasses?.map(cls => 
            cls._id === data.classId 
              ? { ...cls, status: 'ongoing', meetingLink: data.meetingLink }
              : cls
          ) || [],
          recentClasses: prev.recentClasses?.map(cls => 
            cls._id === data.classId 
              ? { ...cls, status: 'ongoing', meetingLink: data.meetingLink }
              : cls
          ) || []
        };
      });
      // Show notification
      toast.success('Your class has started! Click to join.');
    });

    return () => {
      socket?.off('new-notification');
      socket?.off('class-started');
    };
  }, [user, activeEnrollment]);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Box sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography variant="body1" color="textSecondary">
            Loading your learning dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!dashboardData) {
    return (
      <Container sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography color="error" variant="h6" gutterBottom>
            Failed to load dashboard data
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <WelcomeHeader 
        user={user}
        stats={stats}
        activeEnrollment={activeEnrollment}
        upcomingClass={dashboardData?.upcomingClasses?.find((c) => c.status === 'ongoing') || dashboardData?.upcomingClasses?.[0]}
        onJoinClass={(classId) => navigate(`/student/live-class/${classId}`)}
        onViewSchedule={() => navigate('/student/schedule')}
      />

      <StatCards 
        stats={stats}
        upcomingClasses={dashboardData?.upcomingClasses}
        activeEnrollment={activeEnrollment}
        onViewSchedule={() => navigate('/student/schedule')}
        onViewAssignments={() => navigate('/student/assignments')}
        onViewProgress={() => navigate('/student/progress')}
        onViewFees={() => navigate('/student/fees')}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <ProgressSection 
            stats={stats}
            onViewProgress={() => navigate('/student/progress')}
          />
          
          <UpcomingClasses 
            classes={dashboardData?.upcomingClasses}
            onJoinClass={(classId) => navigate(`/student/live-class/${classId}`)}
            onViewSchedule={() => navigate('/student/schedule')}
          />
          
          {dashboardData?.pendingAssignments?.length > 0 && (
            <PendingAssignments 
              assignments={dashboardData.pendingAssignments}
              onViewAll={() => navigate('/student/assignments')}
            />
          )}
        </Grid>

        <Grid item xs={12} lg={4}>
          <TeacherSection 
            activeEnrollment={activeEnrollment}
            onViewProfile={() => navigate('/student/teacher-profile')}
            onBrowseTeachers={() => navigate('/student/ulma')}
          />
          
          <QuickActions 
            onViewCourses={() => navigate('/student/courses')}
            onViewAssignments={() => navigate('/student/assignments')}
            onPayFees={() => navigate('/student/fees/pay')}
            onViewAttendance={() => navigate('/student/attendance')}
            onDownloadMaterials={() => navigate('/student/materials')}
            onScheduleClass={() => navigate('/student/schedule-class')}
            feeStatus={activeEnrollment?.status === 'approved'}
          />
          
          <RecentActivity 
            recentClasses={dashboardData?.recentClasses}
            notifications={notifications}
            onViewAll={() => navigate('/student/activity')}
            onMarkRead={(id) => {
              // Handle mark as read
              axios.put(`/api/notifications/${id}/read`);
              setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
              );
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentDashboard;