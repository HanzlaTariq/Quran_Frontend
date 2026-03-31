import React, { useState, useEffect } from 'react';
import { Container, Grid, LinearProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Import components
import WelcomeHeader from './components/dashboard/WelcomeHeader';
import StatsCards from './components/dashboard/StatsCards';
import WeeklyChart from './components/dashboard/WeeklyChart';
import TodaysSchedule from './components/dashboard/TodaysSchedule';
import StudentsTable from './components/dashboard/StudentsTable';
import UpcomingClasses from './components/dashboard/UpcomingClasses';
import QuickStats from './components/dashboard/QuickStats';
import QuickActions from './components/dashboard/QuickActions';
import Notifications from './components/dashboard/Notifications';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/ulma/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartClass = async (classId) => {
    try {
      await axios.post(`/api/ulma/classes/${classId}/start`);
      await fetchDashboardData();

      navigate(`/ulma/live-class/${classId}`);
      toast.success('Class started');
    } catch (error) {
      console.error('Error starting class:', error);
      toast.error(error?.response?.data?.message || 'Failed to start class');
    }
  };

  if (loading) {
    return (
      <Container sx={{ maxWidth: '100% !important', width: '100%' }}>
        <LinearProgress />
      </Container>
    );
  }

  const today = new Date();
  const todaysClasses = dashboardData?.todaysClasses || [];
  const upcomingClasses = dashboardData?.upcomingClasses || [];

  return (
    <Container sx={{ maxWidth: '100% !important', width: '100%', px: 2, mt: 4, mb: 4 }}>
      <WelcomeHeader
        userName={user?.name}
        onSetAvailability={() => navigate('/ulma/availability')}
        onScheduleClass={() => navigate('/ulma/schedule/create')}
      />

      <StatsCards
        data={dashboardData}
        todaysClasses={todaysClasses}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>

          <TodaysSchedule
            todaysClasses={todaysClasses}
            onViewAll={() => navigate('/ulma/schedule')}
            onStartClass={handleStartClass}
          />
          <WeeklyChart weeklyStats={dashboardData?.weeklyStats} />

          <StudentsTable
            students={dashboardData?.students}
            activeTab={0}
            onTabChange={() => {}}
            onViewStudent={(id) => navigate(`/ulma/students/${id}`)}
            onMessageStudent={(id) => navigate(`/ulma/messages/${id}`)}
            onViewAll={() => navigate('/ulma/students')}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <UpcomingClasses
            upcomingClasses={upcomingClasses}
            onViewAll={() => navigate('/ulma/schedule')}
          />

          <QuickStats profile={dashboardData?.profile} />

          <QuickActions />

          <Notifications notifications={dashboardData?.notifications} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;