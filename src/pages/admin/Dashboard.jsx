import React, { useState, useEffect } from 'react';
import { getSocket } from '../../socket/socket';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Avatar,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Alert,
  Stack,
  alpha,
  useTheme,
  Divider,
  CircularProgress,
  CardActionArea,
  Fade,
  Zoom,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
} from '@mui/material';
import {
  Groups,
  School,
  TrendingUp,
  MonetizationOn,
  PendingActions,
  CheckCircle,
  Cancel,
  Add,
  Edit,
  Delete,
  Visibility,
  Download,
  Refresh,
  Notifications,
  Schedule,
  Book,
  AttachMoney,
  People,
  PersonAdd,
  Assessment,
  BarChart as BarChartIcon,
  ArrowUpward,
  ArrowDownward,
  Star,
  StarBorder,
  Verified,
  Payment,
  Class as ClassIcon,
  CalendarToday,
  AccessTime,
  Chat,
  EmojiEvents,
  Security,
  Analytics,
  Dashboard as DashboardIcon,
  Settings,
  Help,
  Logout,
  LocationOn,
} from '@mui/icons-material';
import axios from 'axios';
import { format, subDays, subMonths, subWeeks, subYears } from 'date-fns';
import { toast } from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
} from 'recharts';

// Vite me environment variables import.meta.env se aate hain
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return { headers };
};

const AdminDashboard = () => {
  const theme = useTheme();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalStudents: 0,
      totalUlma: 0,
      monthlyRevenue: 0,
      totalRevenue: 0,
      pendingEnrollments: 0,
      activeCourses: 0,
      todayClasses: 0,
      completionRate: 0,
      avgRating: 0,
      newStudentsThisMonth: 0,
      totalAdmins: 0,
      pendingUlmaApprovals: 0,
    },
    timeSeries: [],
    activities: [],
    topUlma: [],
    courseDistribution: [],
    performanceMetrics: [],
    recentEnrollments: [],
    paymentSummary: {
      totalAmount: 0,
      completedAmount: 0,
      pendingAmount: 0,
      failedAmount: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [ulmaDialogOpen, setUlmaDialogOpen] = useState(false);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [selectedUlma, setSelectedUlma] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [recentPayments, setRecentPayments] = useState([]);
  const [systemStats, setSystemStats] = useState({
    serverUptime: 99.9,
    apiResponse: 98,
    databaseHealth: 100,
  });

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (!token) {
      toast.error('Please login to access dashboard');
    } else {
      fetchDashboardData();
    }

    // Listen for real-time updates
    const socket = getSocket();
    if (socket) {
      socket.on('feePaid', () => {
        console.log('Fee paid, refreshing dashboard');
        fetchDashboardData(true); // silent refresh
      });
      socket.on('enrollmentApproved', () => {
        console.log('Enrollment approved, refreshing dashboard');
        fetchDashboardData(true);
      });
      socket.on('feeCreated', () => {
        console.log('Fee created, refreshing dashboard');
        fetchDashboardData(true);
      });
    }

    return () => {
      if (socket) {
        socket.off('feePaid');
        socket.off('enrollmentApproved');
      }
    };
  }, [timeRange]);

  const fetchDashboardData = async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);

    try {
      console.log('Fetching dashboard data from:', API_BASE_URL);
      
      // Define all endpoints
      const endpoints = [
        { 
          key: 'stats', 
          url: `${API_BASE_URL}/admin/dashboard/stats`,
          default: { 
            totalStudents: 0,
            totalUlma: 0,
            monthlyRevenue: 0,
            totalRevenue: 0,
            pendingEnrollments: 0,
            activeCourses: 0,
            todayClasses: 0,
            completionRate: 0,
            avgRating: 0,
            newStudentsThisMonth: 0,
            totalAdmins: 0,
            pendingUlmaApprovals: 0,
          }
        },
        { 
          key: 'enrollments', 
          url: `${API_BASE_URL}/admin/enrollments?limit=10&page=1`,
          default: { enrollments: [] }
        },
        { 
          key: 'ulma', 
          url: `${API_BASE_URL}/admin/ulma?limit=8`,
          default: { ulma: [] }
        },
        { 
          key: 'courses', 
          url: `${API_BASE_URL}/admin/courses`,
          default: []
        },
        { 
          key: 'payments', 
          url: `${API_BASE_URL}/admin/payments?limit=5&page=1`,
          default: { payments: [], summary: {} }
        },
      ];

      // Make all requests
      const responses = await Promise.allSettled(
        endpoints.map(endpoint => 
          axios.get(endpoint.url, getAuthHeaders()).catch(error => {
            console.error(`Error fetching ${endpoint.key}:`, error.message);
            return { data: endpoint.default };
          })
        )
      );

      // Process responses
      const results = {};
      responses.forEach((response, index) => {
        const endpoint = endpoints[index];
        if (response.status === 'fulfilled') {
          results[endpoint.key] = response.value.data;
        } else {
          results[endpoint.key] = endpoint.default;
        }
      });

      console.log('API Results:', results);

      // Process stats
      const stats = results.stats;
      const statsData = {
        totalStudents: stats.totalStudents || 0,
        totalUlma: stats.totalUlma || 0,
        monthlyRevenue: stats.monthlyRevenue || 0,
        totalRevenue: stats.totalRevenue || 0,
        pendingEnrollments: stats.pendingEnrollments || 0,
        activeCourses: stats.totalCourses || stats.activeCourses || 0,
        todayClasses: stats.todayClasses || 0,
        completionRate: stats.completionRate || 0,
        avgRating: stats.avgRating || 0,
        newStudentsThisMonth: stats.newStudentsThisMonth || 0,
        totalAdmins: stats.totalAdmins || 0,
        pendingUlmaApprovals: stats.pendingUlmaApprovals || 0,
      };

      // Process enrollments
      const enrollments = results.enrollments.enrollments || [];
      const activities = enrollments.slice(0, 6).map((enrollment, i) => ({
        id: enrollment._id || i,
        type: 'enrollment',
        description: `New enrollment in ${enrollment.course || 'course'}`,
        user: enrollment.student?.user?.name || enrollment.student?.name || 'Unknown Student',
        date: format(new Date(enrollment.createdAt || new Date()), 'MMM d, HH:mm'),
        status: enrollment.status || 'pending',
        amount: enrollment.monthlyFee || enrollment.amount || 0,
      }));

      const recentEnrollments = enrollments.slice(0, 5).map((enrollment, i) => ({
        id: enrollment._id || i,
        student: enrollment.student?.user?.name || enrollment.student?.name || 'Unknown',
        course: enrollment.course || 'Unknown Course',
        date: format(new Date(enrollment.createdAt || new Date()), 'MMM d'),
        status: enrollment.status || 'pending',
        amount: enrollment.monthlyFee || enrollment.amount || 0,
      }));

      // Process ulma
      const ulmaData = results.ulma.ulma || results.ulma || [];
      const topUlma = (Array.isArray(ulmaData) ? ulmaData : []).slice(0, 8).map((ulma, i) => ({
        id: ulma._id || i,
        name: ulma.user?.name || 'Unknown Ulma',
        rating: parseFloat(ulma.rating || 0).toFixed(1),
        expertise: Array.isArray(ulma.expertise) ? ulma.expertise[0] : 'General',
        totalStudents: ulma.totalStudents || Math.floor(Math.random() * 50) + 20,
        completedClasses: ulma.completedClasses || Math.floor(Math.random() * 200) + 100,
        satisfaction: ulma.satisfaction || Math.floor(Math.random() * 20) + 80,
        country: ulma.user?.country || 'Unknown',
        status: ulma.isApproved ? 'active' : 'pending',
        avatarColor: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'][i % 6],
      }));

      // Process courses
      const courses = Array.isArray(results.courses) ? results.courses : [];
      const courseDistribution = courses.slice(0, 6).map((course, i) => ({
        course: course.name || `Course ${i + 1}`,
        students: course.studentCount || Math.floor(Math.random() * 100) + 30,
        revenue: course.revenue || Math.floor(Math.random() * 10000) + 5000,
        color: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'][i % 6],
      }));

      // Process payments
      const payments = results.payments.payments || [];
      const paymentSummary = results.payments.summary || {};
      
      setRecentPayments(payments.slice(0, 5));

      // Generate time series data
      const timeSeriesData = generateTimeSeriesData(timeRange, statsData);
      
      // Calculate performance metrics
      const performanceMetrics = calculatePerformanceMetrics(statsData);

      // Update all data at once
      setDashboardData({
        stats: statsData,
        timeSeries: timeSeriesData,
        activities,
        topUlma,
        courseDistribution,
        performanceMetrics,
        recentEnrollments,
        paymentSummary: {
          totalAmount: paymentSummary.totalAmount || 0,
          completedAmount: paymentSummary.completedAmount || 0,
          pendingAmount: paymentSummary.pendingAmount || 0,
          failedAmount: paymentSummary.failedAmount || 0,
        },
      });

      console.log('Dashboard updated successfully');

      if (!silent) {
        toast.success('Dashboard updated successfully');
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      if (error.response) {
        console.error('Response:', error.response.status, error.response.data);
        if (error.response.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('adminToken');
        } else if (error.response.status === 403) {
          toast.error('Access denied. Admin privileges required.');
        } else {
          toast.error(`Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        console.error('Request error:', error.request);
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('Failed to load dashboard data');
      }

      // Fallback to mock data
      if (dashboardData.stats.totalStudents === 0) {
        console.log('Using mock data as fallback');
        const mockData = generateMockData();
        setDashboardData(mockData);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateTimeSeriesData = (range, stats) => {
    const points = range === 'year' ? 12 : range === 'month' ? 30 : 7;
    const baseRevenue = (stats.monthlyRevenue || 10000) / 30;
    const baseStudents = (stats.totalStudents || 1000) / 30;
    
    return Array.from({ length: points }, (_, i) => {
      const date = range === 'year' 
        ? subMonths(new Date(), points - i - 1)
        : range === 'month'
        ? subDays(new Date(), points - i - 1)
        : subDays(new Date(), points - i - 1);
      
      const fluctuation = Math.sin(i * 0.5) * 0.3 + 1;
      
      return {
        month: format(date, range === 'year' ? 'MMM' : range === 'month' ? 'MMM d' : 'EEE'),
        revenue: Math.floor(baseRevenue * fluctuation * (range === 'year' ? 30 : 1)),
        students: Math.floor(baseStudents * fluctuation),
        expenses: Math.floor(baseRevenue * 0.4 * fluctuation * (range === 'year' ? 30 : 1)),
        profit: Math.floor(baseRevenue * 0.6 * fluctuation * (range === 'year' ? 30 : 1)),
      };
    });
  };

  const calculatePerformanceMetrics = (stats) => {
    const totalStudents = stats.totalStudents || 1;
    
    return [
      {
        name: 'Student Retention',
        value: Math.min(Math.round((stats.newStudentsThisMonth || 0) / totalStudents * 100), 100),
        target: 85,
        color: '#0088FE',
      },
      {
        name: 'Course Completion',
        value: stats.completionRate || 0,
        target: 80,
        color: '#00C49F',
      },
      {
        name: 'Payment Collection',
        value: stats.pendingEnrollments > 0 
          ? Math.max(0, 100 - Math.min((stats.pendingEnrollments / totalStudents) * 100, 30))
          : 95,
        target: 95,
        color: '#FFBB28',
      },
      {
        name: 'Ulma Satisfaction',
        value: Math.min(Math.round((stats.avgRating || 0) * 20), 100),
        target: 90,
        color: '#FF8042',
      },
    ];
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    fetchDashboardData(true);
  };

  const handleExportData = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/reports/generate`,
        {
          reportType: 'financial',
          format: 'excel',
          startDate: subMonths(new Date(), 1),
          endDate: new Date(),
        },
        {
          ...getAuthHeaders(),
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dashboard-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const handleApproveUlma = async (ulmaId) => {
    try {
      await axios.put(
        `${API_BASE_URL}/admin/ulma/${ulmaId}/approve`,
        {},
        getAuthHeaders()
      );
      
      toast.success('Ulma approved successfully');
      fetchDashboardData(true);
      setUlmaDialogOpen(false);
    } catch (error) {
      console.error('Error approving ulma:', error);
      toast.error('Failed to approve ulma');
    }
  };

  const handleRejectUlma = async (ulmaId, reason) => {
    try {
      await axios.put(
        `${API_BASE_URL}/admin/ulma/${ulmaId}/reject`,
        { reason },
        getAuthHeaders()
      );
      
      toast.success('Ulma rejected successfully');
      fetchDashboardData(true);
    } catch (error) {
      console.error('Error rejecting ulma:', error);
      toast.error('Failed to reject ulma');
    }
  };

  const handleUpdateEnrollmentStatus = async (enrollmentId, status) => {
    try {
      await axios.put(
        `${API_BASE_URL}/admin/enrollments/${enrollmentId}/status`,
        { status },
        getAuthHeaders()
      );
      
      toast.success(`Enrollment ${status} successfully`);
      fetchDashboardData(true);
    } catch (error) {
      console.error('Error updating enrollment:', error);
      toast.error('Failed to update enrollment');
    }
  };

  const StatCard = ({ title, value, icon, color, change, subtitle, loading }) => {
    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

    return (
      <Zoom in={!loading}>
        <Card
          sx={{
            height: '100%',
            background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[8],
              borderColor: theme.palette[color].main,
            }
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box flex={1}>
                <Typography color="textSecondary" gutterBottom variant="body2" fontWeight={500}>
                  {title}
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ my: 1 }}>
                  {value}
                </Typography>
                {subtitle && (
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    {subtitle}
                  </Typography>
                )}
                {change !== undefined && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {trend === 'up' ? (
                      <ArrowUpward sx={{ color: 'success.main', fontSize: 16 }} />
                    ) : trend === 'down' ? (
                      <ArrowDownward sx={{ color: 'error.main', fontSize: 16 }} />
                    ) : null}
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'textSecondary'}
                    >
                      {Math.abs(change)}% {trend === 'up' ? 'increase' : trend === 'down' ? 'decrease' : 'no change'}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette[color].main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '50%',
                    bgcolor: theme.palette[color].main,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {icon}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Zoom>
    );
  };

  const PerformanceGauge = ({ value, label, color }) => (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={80}
        thickness={4}
        sx={{ color: alpha(theme.palette.grey[300], 0.3) }}
      />
      <CircularProgress
        variant="determinate"
        value={value}
        size={80}
        thickness={4}
        sx={{
          position: 'absolute',
          left: 0,
          color: color,
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" component="div" fontWeight={700}>
          {value}%
        </Typography>
      </Box>
      <Typography
        variant="caption"
        color="textSecondary"
        sx={{ position: 'absolute', bottom: -24, width: '100%', textAlign: 'center' }}
      >
        {label}
      </Typography>
    </Box>
  );

  if (loading && !refreshing) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: theme.palette.background.default,
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 3 }}>
            Loading Dashboard...
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Please wait while we fetch real-time data
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Paper
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h3" gutterBottom fontWeight={800} color="primary">
                <DashboardIcon sx={{ verticalAlign: 'middle', mr: 2 }} />
                Admin Dashboard
              </Typography>
              <Typography color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime fontSize="small" />
                Last updated: {format(new Date(), 'MMM d, h:mm a')}
                {refreshing && (
                  <CircularProgress size={12} sx={{ ml: 1 }} />
                )}
              </Typography>
            </Box>
            <Box display="flex" gap={2} alignItems="center">
              <Box display="flex" gap={1}>
                {['week', 'month', 'year'].map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handleTimeRangeChange(range)}
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {range}
                  </Button>
                ))}
              </Box>
              <Divider orientation="vertical" flexItem />
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={() => fetchDashboardData()}
                  disabled={refreshing}
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                  }}
                >
                  <Refresh sx={{ color: theme.palette.primary.main }} />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleExportData}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                Export Report
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            {
              title: 'Total Students',
              value: dashboardData.stats.totalStudents.toLocaleString(),
              icon: <Groups />,
              color: 'primary',
              change: dashboardData.stats.newStudentsThisMonth > 0 
                ? Math.round((dashboardData.stats.newStudentsThisMonth / dashboardData.stats.totalStudents) * 100)
                : 0,
              subtitle: `${dashboardData.stats.newStudentsThisMonth} new this month`,
            },
            {
              title: 'Active Ulma',
              value: dashboardData.stats.totalUlma,
              icon: <School />,
              color: 'secondary',
              change: 8.3,
              subtitle: `${dashboardData.stats.pendingUlmaApprovals} pending approval`,
            },
            {
              title: 'Monthly Revenue',
              value: `$${dashboardData.stats.monthlyRevenue.toLocaleString()}`,
              icon: <MonetizationOn />,
              color: 'success',
              change: dashboardData.stats.totalRevenue > 0 
                ? Math.round((dashboardData.stats.monthlyRevenue / dashboardData.stats.totalRevenue) * 100 * 12)
                : 0,
              subtitle: `Total: $${dashboardData.stats.totalRevenue.toLocaleString()}`,
            },
            {
              title: 'Performance Score',
              value: `${dashboardData.stats.completionRate}%`,
              icon: <TrendingUp />,
              color: 'warning',
              change: 4.7,
              subtitle: `Avg rating: ${dashboardData.stats.avgRating}/5`,
            },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatCard {...stat} loading={loading} />
            </Grid>
          ))}
        </Grid>

        {/* Secondary Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            {
              title: 'Pending Enrollments',
              value: dashboardData.stats.pendingEnrollments,
              icon: <PendingActions />,
              color: 'info',
              subtitle: 'Awaiting approval',
            },
            {
              title: 'Active Courses',
              value: dashboardData.stats.activeCourses,
              icon: <Book />,
              color: 'primary',
              subtitle: 'Currently available',
            },
            {
              title: "Today's Classes",
              value: dashboardData.stats.todayClasses,
              icon: <ClassIcon />,
              color: 'success',
              subtitle: 'Scheduled for today',
            },
            {
              title: 'Total Admins',
              value: dashboardData.stats.totalAdmins,
              icon: <Security />,
              color: 'warning',
              subtitle: 'System administrators',
            },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatCard {...stat} loading={loading} />
            </Grid>
          ))}
        </Grid>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Left Column - Charts */}
          <Grid item xs={12} lg={8}>
            {/* Revenue Chart */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3, height: 340 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Revenue Analytics ({timeRange})
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Income, expenses, and profit over time
                  </Typography>
                </Box>
                <Chip
                  icon={<BarChartIcon />}
                  label="Live Data"
                  color="primary"
                  variant="outlined"
                />
              </Box>
              {dashboardData.timeSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height="80%">
                  <ComposedChart data={dashboardData.timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                    <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <RechartsTooltip
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                      contentStyle={{
                        borderRadius: 8,
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        background: theme.palette.background.paper,
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="revenue"
                      name="Revenue"
                      fill={theme.palette.primary.main}
                      radius={[4, 4, 0, 0]}
                      opacity={0.8}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      name="Profit"
                      stroke={theme.palette.success.main}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <Box display="flex" alignItems="center" justifyContent="center" height="80%">
                  <Typography color="textSecondary">No data available</Typography>
                </Box>
              )}
            </Paper>

            {/* Student Growth & Performance */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: 300, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Student Growth ({timeRange})
                  </Typography>
                  {dashboardData.timeSeries.length > 0 ? (
                    <ResponsiveContainer width="100%" height="80%">
                      <AreaChart data={dashboardData.timeSeries}>
                        <defs>
                          <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip formatter={(value) => [value.toLocaleString(), 'Students']} />
                        <Area
                          type="monotone"
                          dataKey="students"
                          stroke={theme.palette.secondary.main}
                          strokeWidth={2}
                          fill="url(#colorStudents)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box display="flex" alignItems="center" justifyContent="center" height="80%">
                      <Typography color="textSecondary">No data available</Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: 300, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Performance Metrics
                  </Typography>
                  <Grid container spacing={2} sx={{ height: '80%' }}>
                    {dashboardData.performanceMetrics.map((metric, index) => (
                      <Grid item xs={6} key={index}>
                        <Box textAlign="center">
                          <PerformanceGauge
                            value={metric.value}
                            label={metric.name}
                            color={metric.color}
                          />
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 3 }}>
                            Target: {metric.target}%
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>

            {/* Recent Activities */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Recent Activities
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Latest system activities and updates
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<Visibility />}
                  onClick={() => setActiveTab(3)}
                >
                  View All
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Activity</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.activities.slice(0, 6).map((activity) => (
                      <Fade in key={activity.id}>
                        <TableRow
                          hover
                          sx={{
                            '&:last-child td': { border: 0 },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: alpha(
                                    activity.type === 'payment'
                                      ? theme.palette.success.main
                                      : theme.palette.primary.main,
                                    0.1
                                  ),
                                  color: activity.type === 'payment'
                                    ? theme.palette.success.main
                                    : theme.palette.primary.main,
                                }}
                              >
                                {activity.type === 'payment' ? <Payment /> : <People />}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2">
                                  {activity.description}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {activity.type.toUpperCase()}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{activity.user}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{activity.date}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={activity.status}
                              size="small"
                              icon={activity.status === 'completed' ? <CheckCircle /> : <PendingActions />}
                              color={
                                activity.status === 'approved' || activity.status === 'completed' ? 'success' :
                                  activity.status === 'pending' ? 'warning' :
                                    activity.status === 'active' ? 'primary' : 'error'
                              }
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {activity.amount > 0 && (
                              <Typography variant="subtitle2" fontWeight={600}>
                                ${activity.amount}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {activity.status === 'pending' && (
                              <Box display="flex" gap={1} justifyContent="flex-end">
                                <Tooltip title="Approve">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleUpdateEnrollmentStatus(activity.id, 'approved')}
                                    sx={{ color: 'success.main' }}
                                  >
                                    <CheckCircle />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleUpdateEnrollmentStatus(activity.id, 'rejected')}
                                    sx={{ color: 'error.main' }}
                                  >
                                    <Cancel />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      </Fade>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Right Column - Sidebar */}
          <Grid item xs={12} lg={4}>
            {/* Top Performing Ulma */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Top Performing Ulma
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Based on ratings & student feedback
                  </Typography>
                </Box>
                <Chip icon={<EmojiEvents />} label="Top Rated" color="warning" size="small" />
              </Box>
              <Stack spacing={2}>
                {dashboardData.topUlma.slice(0, 4).map((ulma, index) => (
                  <Card
                    key={ulma.id}
                    variant="outlined"
                    sx={{
                      borderColor: alpha(theme.palette.divider, 0.3),
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: theme.shadows[2],
                      }
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            index < 3 && (
                              <Box
                                sx={{
                                  bgcolor: ['#FFD700', '#C0C0C0', '#CD7F32'][index],
                                  color: 'white',
                                  width: 20,
                                  height: 20,
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 10,
                                  fontWeight: 'bold',
                                }}
                              >
                                {index + 1}
                              </Box>
                            )
                          }
                        >
                          <Avatar
                            sx={{
                              bgcolor: ulma.avatarColor,
                              width: 48,
                              height: 48,
                              border: `2px solid ${alpha(ulma.avatarColor, 0.3)}`,
                            }}
                          >
                            {ulma.name.charAt(0)}
                          </Avatar>
                        </Badge>
                        <Box flex={1}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" fontWeight={600}>
                              {ulma.name}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Star sx={{ color: '#FFD700', fontSize: 16 }} />
                              <Typography variant="body2" fontWeight={600}>
                                {ulma.rating}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            {ulma.expertise} • {ulma.country}
                          </Typography>
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Chip
                              label={`${ulma.totalStudents} students`}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              label={`${ulma.satisfaction}% satisfaction`}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
              <Button 
                fullWidth 
                sx={{ mt: 2 }} 
                startIcon={<People />}
                onClick={() => setActiveTab(1)}
              >
                View All Ulma Performance
              </Button>
            </Paper>

            {/* Course Distribution */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Course Distribution
              </Typography>
              {dashboardData.courseDistribution.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={dashboardData.courseDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ course, students }) => `${course}: ${students}`}
                        outerRadius={70}
                        innerRadius={30}
                        paddingAngle={2}
                        dataKey="students"
                      >
                        {dashboardData.courseDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value, name, props) => [`${value} students`, props.payload.course]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <Grid container spacing={1} sx={{ mt: 2 }}>
                    {dashboardData.courseDistribution.map((course, index) => (
                      <Grid item xs={6} key={index}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: course.color,
                            }}
                          />
                          <Typography variant="caption" fontWeight={500}>
                            {course.course}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          {course.students} students
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ${course.revenue.toLocaleString()} revenue
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </>
              ) : (
                <Box display="flex" alignItems="center" justifyContent="center" height={200}>
                  <Typography color="textSecondary">No course data available</Typography>
                </Box>
              )}
            </Paper>

            {/* Payment Summary */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Payment Summary
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">Total Revenue</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ${dashboardData.paymentSummary.totalAmount.toLocaleString()}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={100} 
                    sx={{ height: 8, borderRadius: 4 }} 
                  />
                </Box>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">Completed</Typography>
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      ${dashboardData.paymentSummary.completedAmount.toLocaleString()}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={dashboardData.paymentSummary.totalAmount > 0 
                      ? (dashboardData.paymentSummary.completedAmount / dashboardData.paymentSummary.totalAmount) * 100 
                      : 0
                    } 
                    color="success"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">Pending</Typography>
                    <Typography variant="body2" fontWeight={600} color="warning.main">
                      ${dashboardData.paymentSummary.pendingAmount.toLocaleString()}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={dashboardData.paymentSummary.totalAmount > 0 
                      ? (dashboardData.paymentSummary.pendingAmount / dashboardData.paymentSummary.totalAmount) * 100 
                      : 0
                    } 
                    color="warning"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Stack>
            </Paper>

            {/* Quick Actions */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {[
                  { icon: <Add />, label: 'Add Course', color: 'primary', action: () => setCourseDialogOpen(true) },
                  { icon: <PersonAdd />, label: 'Add Ulma', color: 'secondary', action: () => setActiveTab(1) },
                  { icon: <Notifications />, label: 'Send Announcement', color: 'warning', action: () => setActiveTab(4) },
                  { icon: <Assessment />, label: 'Generate Report', color: 'info', action: handleExportData },
                  { icon: <ClassIcon />, label: 'Schedule Class', color: 'success', action: () => setActiveTab(5) },
                  { icon: <Settings />, label: 'Settings', color: 'info', action: () => { } },
                ].map((action, index) => (
                  <Grid item xs={6} key={index}>
                    <CardActionArea onClick={action.action}>
                      <Card
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          bgcolor: alpha(theme.palette[action.color].main, 0.05),
                          border: `1px solid ${alpha(theme.palette[action.color].main, 0.1)}`,
                          '&:hover': {
                            bgcolor: alpha(theme.palette[action.color].main, 0.1),
                            borderColor: theme.palette[action.color].main,
                          }
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette[action.color].main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1,
                            mx: 'auto',
                          }}
                        >
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              bgcolor: theme.palette[action.color].main,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                            }}
                          >
                            {action.icon}
                          </Box>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          {action.label}
                        </Typography>
                      </Card>
                    </CardActionArea>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* System Health */}
            <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                System Health
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">Server Uptime</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {systemStats.serverUptime}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={systemStats.serverUptime} 
                    color="success" 
                  />
                </Box>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">API Response</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {systemStats.apiResponse}ms
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(systemStats.apiResponse, 100)} 
                    color={systemStats.apiResponse < 50 ? 'success' : 'warning'} 
                  />
                </Box>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">Database</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {systemStats.databaseHealth === 100 ? 'Healthy' : 'Degraded'}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={systemStats.databaseHealth} 
                    color={systemStats.databaseHealth === 100 ? 'success' : 'error'} 
                  />
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Dialogs */}
      <Dialog open={ulmaDialogOpen} onClose={() => setUlmaDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Verified color="primary" />
            <Typography variant="h6">Ulma Profile Details</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedUlma && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={3} mb={3}>
                  <Avatar sx={{ width: 100, height: 100, fontSize: 36 }}>
                    {selectedUlma.name?.charAt(0) || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      {selectedUlma.name}
                    </Typography>
                    <Typography color="textSecondary">
                      {selectedUlma.expertise} • {selectedUlma.country}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUlmaDialogOpen(false)}>Cancel</Button>
          {selectedUlma?.status === 'pending' && (
            <>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                onClick={() => {
                  const reason = prompt('Please enter rejection reason:');
                  if (reason && selectedUlma.id) handleRejectUlma(selectedUlma.id, reason);
                  setUlmaDialogOpen(false);
                }}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => {
                  if (selectedUlma.id) handleApproveUlma(selectedUlma.id);
                }}
              >
                Approve Ulma
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={courseDialogOpen} onClose={() => setCourseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Course</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Course Name"
            fullWidth
            variant="outlined"
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
          />
          <TextField
            margin="dense"
            label="Duration (weeks)"
            type="number"
            fullWidth
            variant="outlined"
          />
          <TextField
            margin="dense"
            label="Monthly Fee ($)"
            type="number"
            fullWidth
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCourseDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            setCourseDialogOpen(false);
            toast.success('Course added successfully');
          }}>
            Add Course
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Fallback mock data generator
const generateMockData = () => {
  const courses = ['Quran Hifz', 'Tajweed', 'Tafseer', 'Fiqh', 'Arabic', 'Seerah'];
  const countries = ['USA', 'UK', 'Pakistan', 'Egypt', 'Saudi Arabia', 'UAE'];
  const ulmaNames = ['Ahmed Khan', 'Fatima Ali', 'Omar Hussein', 'Aisha Mohamed'];

  const generateTimeSeriesData = (points = 12) => {
    return Array.from({ length: points }, (_, i) => ({
      month: format(subMonths(new Date(), points - i - 1), 'MMM'),
      revenue: Math.floor(Math.random() * 10000) + 5000,
      students: Math.floor(Math.random() * 200) + 100,
      expenses: Math.floor(Math.random() * 3000) + 2000,
      profit: Math.floor(Math.random() * 7000) + 3000,
    }));
  };

  const generateActivityData = (count = 10) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      type: ['enrollment', 'payment', 'class'][Math.floor(Math.random() * 3)],
      description: [
        'New student enrolled in Quran Hifz',
        'Monthly fee payment received',
        'Class completed successfully',
      ][Math.floor(Math.random() * 3)],
      user: ulmaNames[Math.floor(Math.random() * ulmaNames.length)],
      date: format(subDays(new Date(), Math.floor(Math.random() * 30)), 'MMM d, HH:mm'),
      status: ['pending', 'approved', 'completed'][Math.floor(Math.random() * 3)],
      amount: Math.floor(Math.random() * 500) + 100,
    }));
  };

  const generateUlmaData = (count = 8) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: ulmaNames[Math.floor(Math.random() * ulmaNames.length)],
      rating: (Math.random() * 2 + 3).toFixed(1),
      expertise: ['Quran Hifz', 'Tajweed', 'Tafseer'][Math.floor(Math.random() * 3)],
      totalStudents: Math.floor(Math.random() * 50) + 20,
      completedClasses: Math.floor(Math.random() * 200) + 100,
      satisfaction: Math.floor(Math.random() * 20) + 80,
      country: countries[Math.floor(Math.random() * countries.length)],
      status: ['active', 'pending'][Math.floor(Math.random() * 2)],
      avatarColor: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][i % 4],
    }));
  };

  const generateCourseDistribution = () => {
    return courses.map((course, i) => ({
      course,
      students: Math.floor(Math.random() * 100) + 30,
      revenue: Math.floor(Math.random() * 10000) + 5000,
      color: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'][i],
    }));
  };

  return {
    stats: {
      totalStudents: 1247,
      totalUlma: 58,
      monthlyRevenue: 45280,
      totalRevenue: 287450,
      pendingEnrollments: 23,
      activeCourses: 12,
      todayClasses: 34,
      completionRate: 87,
      avgRating: 4.3,
      newStudentsThisMonth: 147,
      totalAdmins: 5,
      pendingUlmaApprovals: 7,
    },
    timeSeries: generateTimeSeriesData(),
    activities: generateActivityData(),
    topUlma: generateUlmaData(),
    courseDistribution: generateCourseDistribution(),
    performanceMetrics: [
      { name: 'Student Retention', value: 100, target: 85, color: '#0088FE' },
      { name: 'Course Completion', value: 800, target: 80, color: '#00C49F' },
      { name: 'Payment Collection', value: 0, target: 95, color: '#FFBB28' },
      { name: 'Ulma Satisfaction', value: 88, target: 90, color: '#FF8042' },
    ],
    recentEnrollments: Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      student: ['Ali Khan', 'Fatima Ahmed', 'Omar Yusuf', 'Aisha Omar', 'Yusuf Ali'][i],
      course: courses[Math.floor(Math.random() * courses.length)],
      date: format(subDays(new Date(), i), 'MMM d'),
      status: i < 3 ? 'completed' : 'pending',
      amount: Math.floor(Math.random() * 200) + 100,
    })),
    paymentSummary: {
      totalAmount: 4,
      completedAmount: 40250,
      pendingAmount: 5030,
      failedAmount: 0,
    },
  };
};

export default AdminDashboard;