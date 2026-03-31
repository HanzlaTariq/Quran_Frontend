import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  LinearProgress,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Avatar,
  Divider,
  alpha,
  Fade,
  Grow,
  Zoom,
  Slide,
  Badge,
  Stack,
  useTheme,
  useMediaQuery,
  Skeleton,
  Backdrop,
  Alert,
  Snackbar,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  ToggleButton,
  ToggleButtonGroup,
  Pagination,
  Breadcrumbs,
  Link,
  CardMedia,
  CardActionArea,
  Rating,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  MobileStepper,
  BottomNavigation,
  BottomNavigationAction,
  SwipeableDrawer,
  AvatarGroup,
  useScrollTrigger,
  Fab,
  Zoom as MuiZoom,
  styled
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Person,
  Search,
  Download,
  MoreVert,
  Edit,
  Visibility,
  Add,
  Refresh,
  CheckCircle,
  Cancel,
  WatchLater,
  TrendingUp,
  DateRange,
  Group,
  TrendingDown,
  CalendarToday,
  AccessTime,
  EmojiEvents,
  Star,
  TrendingUp as TrendingUpIcon,
  Timeline as TimelineIcon,
  School,
  Assignment,
  NotificationsActive,
  MenuBook,
  Insights,
  BarChart,
  Dashboard,
  People,
  Settings,
  Menu,
  Close,
  Home,
  CloudUpload,
  FilterList,
  Sort,
  GridView,
  ViewList,
  TableChart,
  ArrowUpward,
  ArrowDownward,
  CheckBox,
  CheckBoxOutlineBlank,
  Today,
  History,
  AccountCircle,
  Logout,
  Notifications,
  Help,
  Info,
  Warning,
  Verified,
  Mosque,
  Translate,
  RecordVoiceOver,
  Campaign,
  Celebration,
  Print
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import moment from 'moment';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  fontWeight: 'bold',
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[4],
  },
}));

const MotionCard = motion.create(StyledCard);
const MotionPaper = motion.create(Paper);

const AttendanceView = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attendanceDialog, setAttendanceDialog] = useState(false);
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, table
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statsTimeframe, setStatsTimeframe] = useState('week'); // week, month, year
  const [bulkAttendanceMode, setBulkAttendanceMode] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [announcementDialog, setAnnouncementDialog] = useState(false);
  const [bottomNavValue, setBottomNavValue] = useState(0);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState(null);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [editAttendanceData, setEditAttendanceData] = useState({
    date: '',
    time: '',
    status: 'present',
    remarks: '',
  });
  const [studentAttendanceRecords, setStudentAttendanceRecords] = useState([]);

  const [attendanceData, setAttendanceData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    status: 'present',
    remarks: '',
    surahProgress: '',
    tajweedRating: 3,
  });

  // Quran Academy specific stats
  const [academyStats, setAcademyStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    averageAttendance: 0,
    totalClasses: 0,
    hifzStudents: 0,
    tajweedStudents: 0,
    quranCompletion: 0,
    topPerformers: [],
    weeklyTrend: [],
    monthlyProgress: [],
    surahMemorized: [],
  });

  useEffect(() => {
    fetchStudentsAttendance();
    fetchAcademyStats();
  }, []);

  useEffect(() => {
    const handleAttendanceUpdate = () => {
      fetchStudentsAttendance();
    };
    window.addEventListener('attendanceUpdated', handleAttendanceUpdate);
    return () => window.removeEventListener('attendanceUpdated', handleAttendanceUpdate);
  }, []);

  const fetchStudentsAttendance = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/attendance/ulma/students');
      if (response.data.success) {
        setStudents(response.data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAcademyStats = async () => {
    try {
      const response = await axios.get('/api/ulma/dashboard');
      if (response.data.stats) {
        setAcademyStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleMarkAttendance = (student) => {
    setSelectedStudent(student);
    setAttendanceDialog(true);
  };

  const handleBulkAttendance = () => {
    setBulkAttendanceMode(true);
    setSelectedStudents([]);
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmitBulkAttendance = async () => {
    if (selectedStudents.length === 0) {
      toast.warning('Please select at least one student');
      return;
    }

    try {
      setMarkingAttendance(true);
      await axios.post('/api/attendance/bulk-mark', {
        studentIds: selectedStudents,
        attendanceData: {
          date: attendanceData.date,
          time: attendanceData.time,
          status: attendanceData.status,
          remarks: attendanceData.remarks,
        }
      });
      toast.success(`Attendance marked for ${selectedStudents.length} students`);
      setBulkAttendanceMode(false);
      setSelectedStudents([]);
      fetchStudentsAttendance();
    } catch (error) {
      toast.error('Failed to mark bulk attendance');
    } finally {
      setMarkingAttendance(false);
    }
  };

  const handleSubmitAttendance = async () => {
    if (!selectedStudent?.student?.enrollmentId) {
      toast.error('Enrollment ID missing');
      return;
    }

    const markedAt = attendanceData.time
      ? new Date(`${attendanceData.date}T${attendanceData.time}`)
      : new Date();

    try {
      setMarkingAttendance(true);
      await axios.post('/api/attendance/mark', {
        studentId: selectedStudent.student._id,
        enrollmentId: selectedStudent.student.enrollmentId,
        date: attendanceData.date,
        time: attendanceData.time,
        status: attendanceData.status,
        remarks: attendanceData.remarks,
        surahProgress: attendanceData.surahProgress,
        tajweedRating: attendanceData.tajweedRating,
        markedAt,
      });

      toast.success('Attendance marked successfully');
      setAttendanceDialog(false);
      setAttendanceData({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        status: 'present',
        remarks: '',
        surahProgress: '',
        tajweedRating: 3,
      });
      
      window.dispatchEvent(new CustomEvent('attendanceUpdated'));
      fetchStudentsAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setMarkingAttendance(false);
    }
  };

  const handleEditAttendance = (attendanceRecord) => {
    setEditingAttendance(attendanceRecord);
    setEditAttendanceData({
      date: attendanceRecord.date || '',
      time: attendanceRecord.time || '',
      status: attendanceRecord.status || 'present',
      remarks: attendanceRecord.remarks || '',
    });
  };

  const handleSaveEditedAttendance = async () => {
    if (!editingAttendance) return;

    try {
      setMarkingAttendance(true);
      await axios.put(`/api/attendance/${editingAttendance._id}`, {
        date: editAttendanceData.date,
        time: editAttendanceData.time,
        status: editAttendanceData.status,
        remarks: editAttendanceData.remarks,
      });

      toast.success('Attendance updated successfully');
      setEditingAttendance(null);
      setEditAttendanceData({
        date: '',
        time: '',
        status: 'present',
        remarks: '',
      });
      fetchStudentsAttendance();
      // Refresh the attendance records for the current student
      if (selectedStudentForDetail) {
        fetchStudentAttendanceRecords(
          selectedStudentForDetail.student._id,
          selectedStudentForDetail.student.enrollmentId
        );
      }
    } catch (error) {
      toast.error('Failed to update attendance');
    } finally {
      setMarkingAttendance(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingAttendance(null);
    setEditAttendanceData({
      date: '',
      time: '',
      status: 'present',
      remarks: '',
    });
  };

  const fetchStudentAttendanceRecords = async (studentId, enrollmentId) => {
    try {
      const params = enrollmentId ? { enrollmentId } : {};
      const response = await axios.get(`/api/attendance/student/${studentId}`, { params });
      if (response.data.success) {
        setStudentAttendanceRecords(response.data.attendance || []);
      }
    } catch (error) {
      console.error('Failed to fetch student attendance records:', error);
      setStudentAttendanceRecords([]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle fontSize="small" />;
      case 'absent': return <Cancel fontSize="small" />;
      case 'late': return <WatchLater fontSize="small" />;
      default: return null;
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           student.student.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (filterStatus === 'all') return matchesSearch;
      const attendance = student.attendance;
      if (filterStatus === 'high' && attendance.percentage >= 90) return matchesSearch;
      if (filterStatus === 'medium' && attendance.percentage >= 70 && attendance.percentage < 90) return matchesSearch;
      if (filterStatus === 'low' && attendance.percentage < 70) return matchesSearch;
      return false;
    });
  }, [students, searchQuery, filterStatus]);

  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.student.name.localeCompare(b.student.name);
        case 'percentage': return b.attendance.percentage - a.attendance.percentage;
        case 'present': return b.attendance.present - a.attendance.present;
        default: return 0;
      }
    });
  }, [filteredStudents, sortBy]);

  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return sortedStudents.slice(start, start + rowsPerPage);
  }, [sortedStudents, page, rowsPerPage]);

  const getAttendanceStats = () => {
    const total = students.length;
    const present = students.filter(s => s.todayStatus === 'present').length;
    const absent = students.filter(s => s.todayStatus === 'absent').length;
    const late = students.filter(s => s.todayStatus === 'late').length;
    const avgAttendance = students.reduce((sum, s) => sum + s.attendance.percentage, 0) / total;
    
    return { total, present, absent, late, avgAttendance: Math.round(avgAttendance) };
  };

  const stats = getAttendanceStats();

  const handleExportData = () => {
    const exportData = students.map(s => ({
      'Student Name': s.student.name,
      'Enrollment ID': s.student.enrollmentId,
      'Email': s.student.email,
      'Present': s.attendance.present,
      'Absent': s.attendance.absent,
      'Late': s.attendance.late,
      'Attendance %': s.attendance.percentage,
      'Hifz Progress': s.hifzProgress || 'N/A',
      'Tajweed Level': s.tajweedLevel || 'N/A',
      'Last Updated': new Date().toLocaleString()
    }));
    
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quran_academy_attendance_${moment().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const handleAnnouncement = async (message) => {
    try {
      await axios.post('/api/announcements', { message });
      toast.success('Announcement sent to all students');
      setAnnouncementDialog(false);
    } catch (error) {
      toast.error('Failed to send announcement');
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
              <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: { xs: 7, sm: 0 } }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            borderRadius: 0,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
          elevation={3}
        >
          <BottomNavigation
            value={bottomNavValue}
            onChange={(event, newValue) => setBottomNavValue(newValue)}
            showLabels
          >
            <BottomNavigationAction label="Home" icon={<Home />} />
            <BottomNavigationAction label="Students" icon={<People />} />
            <BottomNavigationAction label="Quran" icon={<MenuBook />} />
            <BottomNavigationAction label="Profile" icon={<AccountCircle />} />
          </BottomNavigation>
        </Paper>
      )}

      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 2, sm: 3 } }}>
        {/* Header Section with Islamic Design */}
        <MotionPaper
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            mb: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative Islamic Pattern */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Mosque sx={{ fontSize: 32, color: 'primary.main' }} />
                <GradientText variant={isMobile ? "h5" : "h4"} component="h1">
                  Quran Academy Attendance
                </GradientText>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Manage student attendance, track Quran progress, and monitor performance
              </Typography>
              <Breadcrumbs sx={{ mt: 1 }}>
                <Link href="#" color="inherit">Dashboard</Link>
                <Link href="#" color="inherit">Attendance</Link>
                <Typography color="text.primary">Students</Typography>
              </Breadcrumbs>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Tooltip title="Export Data">
                <IconButton onClick={handleExportData} color="primary">
                  <Download />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh">
                <IconButton onClick={fetchStudentsAttendance} color="primary">
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Bulk Attendance">
                <Button
                  variant="outlined"
                  startIcon={<Group />}
                  onClick={handleBulkAttendance}
                  size={isMobile ? "small" : "medium"}
                >
                  Bulk Mark
                </Button>
              </Tooltip>
              <Tooltip title="Quick Mark">
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setAttendanceDialog(true)}
                  size={isMobile ? "small" : "medium"}
                >
                  Mark Attendance
                </Button>
              </Tooltip>
            </Box>
          </Box>
        </MotionPaper>

        {/* Statistics Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard onClick={() => setFilterStatus('all')}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Students</Typography>
                  <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
                </Box>
                <School sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.3) }} />
              </Box>
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {academyStats.hifzStudents} Hifz • {academyStats.tajweedStudents} Tajweed
                </Typography>
              </Box>
            </StatCard>
          </Grid>
          
          <Grid item xs={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard onClick={() => setFilterStatus('all')}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Present Today</Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">{stats.present}</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: alpha(theme.palette.success.main, 0.3) }} />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(stats.present / stats.total) * 100} 
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
                color="success"
              />
            </StatCard>
          </Grid>
          
          <Grid item xs={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Avg Attendance</Typography>
                  <Typography variant="h4" fontWeight="bold" color="info.main">{stats.avgAttendance}%</Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: alpha(theme.palette.info.main, 0.3) }} />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.avgAttendance} 
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
                color="info"
              />
            </StatCard>
          </Grid>
          
          <Grid item xs={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Quran Progress</Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">{academyStats.quranCompletion || 0}%</Typography>
                </Box>
                <MenuBook sx={{ fontSize: 40, color: alpha(theme.palette.warning.main, 0.3) }} />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={academyStats.quranCompletion || 0} 
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
                color="warning"
              />
            </StatCard>
          </Grid>
        </Grid>

        {/* Search and Filters Bar */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                placeholder="Search by name, email or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                size="small"
              />
            </Grid>
            
            <Grid item xs={{ xs: 6, sm: 3, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter</InputLabel>
                <Select
                  value={filterStatus}
                  label="Filter"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Students</MenuItem>
                  <MenuItem value="high">High ({'>'}90%)</MenuItem>
                  <MenuItem value="medium">Medium (70-90%)</MenuItem>
                  <MenuItem value="low">Low ({'<'}70%)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={{ xs: 6, sm: 3, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="name">Name (A-Z)</MenuItem>
                  <MenuItem value="percentage">Attendance %</MenuItem>
                  <MenuItem value="present">Present Count</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, val) => val && setViewMode(val)}
                  size="small"
                >
                  <ToggleButton value="grid">
                    <GridView fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="list">
                    <ViewList fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="table">
                    <TableChart fontSize="small" />
                  </ToggleButton>
                </ToggleButtonGroup>
                
                <TextField
                  select
                  size="small"
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  sx={{ width: 80 }}
                >
                  <MenuItem value={6}>6</MenuItem>
                  <MenuItem value={12}>12</MenuItem>
                  <MenuItem value={24}>24</MenuItem>
                  <MenuItem value={48}>48</MenuItem>
                </TextField>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Main Content - Students Display */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Grid container spacing={2}>
                {paginatedStudents.map((item, index) => (
                  <Grid item xs={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item.student._id}>
                    <MotionCard
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -8 }}
                    >
                      <CardContent>
                        {/* Student Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              item.todayStatus === 'present' ? 
                                <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} /> :
                              item.todayStatus === 'late' ?
                                <WatchLater sx={{ fontSize: 16, color: 'warning.main' }} /> : null
                            }
                          >
                            <Avatar
                              sx={{
                                width: 56,
                                height: 56,
                                bgcolor: `hsl(${item.student.name.length * 40 % 360}, 70%, 50%)`,
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                              }}
                            >
                              {item.student.name.charAt(0).toUpperCase()}
                            </Avatar>
                          </Badge>
                          <Box sx={{ ml: 2, flex: 1 }}>
                            <Typography variant="h6" fontWeight="bold" noWrap>
                              {item.student.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.course || 'General'}
                            </Typography>
                          </Box>
                          <IconButton size="small">
                            <MoreVert />
                          </IconButton>
                        </Box>

                        {/* Quran Progress Badge */}
                        {item.quranProgress && (
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption">Quran Progress</Typography>
                              <Typography variant="caption" fontWeight="bold">{item.quranProgress}%</Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={item.quranProgress}
                              sx={{ height: 4, borderRadius: 2 }}
                            />
                          </Box>
                        )}

                        <Divider sx={{ my: 1.5 }} />

                        {/* Attendance Stats */}
                        <Grid container spacing={1} sx={{ mb: 1.5 }}>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <CheckCircle color="success" sx={{ fontSize: 20 }} />
                              <Typography variant="h6" color="success.main" sx={{ fontSize: '1rem' }}>
                                {item.attendance.present}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Present
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Cancel color="error" sx={{ fontSize: 20 }} />
                              <Typography variant="h6" color="error.main" sx={{ fontSize: '1rem' }}>
                                {item.attendance.absent}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Absent
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <WatchLater color="warning" sx={{ fontSize: 20 }} />
                              <Typography variant="h6" color="warning.main" sx={{ fontSize: '1rem' }}>
                                {item.attendance.late}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Late
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        {/* Attendance Progress */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">Attendance Rate</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {item.attendance.percentage}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={item.attendance.percentage}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                bgcolor: item.attendance.percentage >= 90 ? 'success.main' : 
                                         item.attendance.percentage >= 70 ? 'warning.main' : 'error.main'
                              }
                            }}
                          />
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            size="small"
                            onClick={() => handleMarkAttendance(item)}
                            startIcon={<CheckCircle />}
                            sx={{ flex: 1 }}
                          >
                            Mark
                          </Button>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}
                              onClick={() => {
                                setSelectedStudentForDetail(item);
                                setDetailDialogOpen(true);
                                fetchStudentAttendanceRecords(item.student._id, item.student.enrollmentId);
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </MotionCard>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}

          {viewMode === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Stack spacing={2}>
                {paginatedStudents.map((item, index) => (
                  <MotionCard
                    key={item.student._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                            {item.student.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6">{item.student.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.course || 'Quran Student'}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6">{item.attendance.percentage}%</Typography>
                            <Typography variant="caption">Attendance</Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                              icon={<CheckCircle />} 
                              label={item.attendance.present} 
                              size="small" 
                              color="success" 
                              variant="outlined"
                            />
                            <Chip 
                              icon={<Cancel />} 
                              label={item.attendance.absent} 
                              size="small" 
                              color="error" 
                              variant="outlined"
                            />
                            <Chip 
                              icon={<WatchLater />} 
                              label={item.attendance.late} 
                              size="small" 
                              color="warning" 
                              variant="outlined"
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                              size="small" 
                              variant="contained" 
                              onClick={() => handleMarkAttendance(item)}
                            >
                              Mark
                            </Button>
                            <IconButton 
                              size="small"
                              onClick={() => {
                                setSelectedStudentForDetail(item);
                                setDetailDialogOpen(true);
                                fetchStudentAttendanceRecords(item.student._id, item.student.enrollmentId);
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </MotionCard>
                ))}
              </Stack>
            </motion.div>
          )}

          {viewMode === 'table' && (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Paper sx={{ overflowX: 'auto' }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <TableCell>Student</TableCell>
                        <TableCell>Course</TableCell>
                        <TableCell align="center">Present</TableCell>
                        <TableCell align="center">Absent</TableCell>
                        <TableCell align="center">Late</TableCell>
                        <TableCell align="center">Attendance %</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedStudents.map((item) => (
                        <TableRow key={item.student._id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {item.student.name.charAt(0)}
                              </Avatar>
                              <Typography variant="body2" fontWeight="medium">
                                {item.student.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{item.course || 'General'}</TableCell>
                          <TableCell align="center">
                            <Chip label={item.attendance.present} size="small" color="success" />
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={item.attendance.absent} size="small" color="error" />
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={item.attendance.late} size="small" color="warning" />
                          </TableCell>
                          <TableCell align="center">
                            <Typography 
                              fontWeight="bold" 
                              color={item.attendance.percentage >= 90 ? 'success.main' : 
                                     item.attendance.percentage >= 70 ? 'warning.main' : 'error.main'}
                            >
                              {item.attendance.percentage}%
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton size="small" onClick={() => handleMarkAttendance(item)}>
                                <CheckCircle fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small"
                                onClick={() => {
                                  setSelectedStudentForDetail(item);
                                  setDetailDialogOpen(true);
                                  fetchStudentAttendanceRecords(item.student._id, item.student.enrollmentId);
                                }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {sortedStudents.length > rowsPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={Math.ceil(sortedStudents.length / rowsPerPage)}
              page={page}
              onChange={(e, val) => setPage(val)}
              color="primary"
              size={isMobile ? "small" : "medium"}
              showFirstButton
              showLastButton
            />
          </Box>
        )}

      </Container>

      {/* Mark Attendance Dialog */}
      <Dialog 
        open={attendanceDialog} 
        onClose={() => !markingAttendance && setAttendanceDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Mosque />
            Mark Quran Class Attendance
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedStudent && (
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                {selectedStudent.student.name.charAt(0)}
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                {selectedStudent.student.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedStudent.course || 'Quran Student'}
              </Typography>
              <Chip 
                label={`Current Attendance: ${selectedStudent.attendance.percentage}%`}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
          )}

          <Grid container spacing={2}>
            <Grid item xs={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={attendanceData.date}
                onChange={(e) => setAttendanceData({ ...attendanceData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarToday sx={{ mr: 1, fontSize: 20 }} />
                }}
              />
            </Grid>
            <Grid item xs={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="time"
                label="Time"
                value={attendanceData.time}
                onChange={(e) => setAttendanceData({ ...attendanceData, time: e.target.value })}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <AccessTime sx={{ mr: 1, fontSize: 20 }} />
                }}
              />
            </Grid>
          </Grid>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={attendanceData.status}
              label="Status"
              onChange={(e) => setAttendanceData({ ...attendanceData, status: e.target.value })}
            >
              <MenuItem value="present">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle color="success" /> Present
                </Box>
              </MenuItem>
              <MenuItem value="absent">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Cancel color="error" /> Absent
                </Box>
              </MenuItem>
              <MenuItem value="late">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WatchLater color="warning" /> Late
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Surah Progress"
            placeholder="e.g., Surah Al-Baqarah (Verse 1-50)"
            value={attendanceData.surahProgress}
            onChange={(e) => setAttendanceData({ ...attendanceData, surahProgress: e.target.value })}
            sx={{ mt: 2 }}
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>Tajweed Rating</Typography>
            <Rating
              value={attendanceData.tajweedRating}
              onChange={(e, val) => setAttendanceData({ ...attendanceData, tajweedRating: val || 3 })}
              size="large"
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Remarks"
            placeholder="Notes about student's progress..."
            value={attendanceData.remarks}
            onChange={(e) => setAttendanceData({ ...attendanceData, remarks: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAttendanceDialog(false)} disabled={markingAttendance}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitAttendance}
            variant="contained"
            disabled={markingAttendance}
            startIcon={markingAttendance ? <CircularProgress size={20} /> : <CheckCircle />}
          >
            {markingAttendance ? 'Marking...' : 'Mark Attendance'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Attendance Dialog */}
      <Dialog open={bulkAttendanceMode} onClose={() => setBulkAttendanceMode(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Group /> Bulk Attendance Marking
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select students to mark attendance for {moment(attendanceData.date).format('MMMM D, YYYY')}
          </Typography>
          
          <Grid container spacing={1}>
            {students.map((student) => (
              <Grid item xs={{ xs: 12, sm: 6 }} key={student.student._id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    bgcolor: selectedStudents.includes(student.student._id) ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => toggleStudentSelection(student.student._id)}
                >
                  <CardContent sx={{ py: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    {selectedStudents.includes(student.student._id) ? 
                      <CheckBox color="primary" /> : 
                      <CheckBoxOutlineBlank color="disabled" />
                    }
                    <Avatar>{student.student.name.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">{student.student.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Attendance: {student.attendance.percentage}%
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkAttendanceMode(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitBulkAttendance}
            disabled={selectedStudents.length === 0 || markingAttendance}
            startIcon={markingAttendance ? <CircularProgress size={20} /> : <CheckCircle />}
          >
            Mark {selectedStudents.length} Students
          </Button>
        </DialogActions>
      </Dialog>

      {/* Student Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)} 
        maxWidth="xl" 
        fullWidth
        PaperProps={{
          sx: {
            width: '100%',
            minHeight: { xs: '88vh', md: '80vh' },
            borderRadius: 3,
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)} 0%, ${alpha(theme.palette.info.main, 0.08)} 100%)`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          py: 2.5
        }}>
          <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 52, height: 52, fontSize: '1.25rem', fontWeight: 700 }}>
                {selectedStudentForDetail?.student?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>{selectedStudentForDetail?.student?.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedStudentForDetail?.course || 'General'}
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip size="small" color="primary" icon={<School />} label={`Present ${selectedStudentForDetail?.attendance?.present || 0}`} />
              <Chip size="small" color="success" icon={<TrendingUpIcon />} label={`${selectedStudentForDetail?.attendance?.percentage || 0}%`} />
            </Stack>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: alpha(theme.palette.background.default, 0.5) }}>
          {selectedStudentForDetail && (
            <Grid container spacing={2.5} sx={{ pt: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 2.5 }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="caption" color="text.secondary">Present</Typography>
                    <Typography variant="h4" color="success.main" fontWeight={700}>
                      {selectedStudentForDetail.attendance.present}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 2.5 }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="caption" color="text.secondary">Absent</Typography>
                    <Typography variant="h4" color="error.main" fontWeight={700}>
                      {selectedStudentForDetail.attendance.absent}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 2.5 }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="caption" color="text.secondary">Late</Typography>
                    <Typography variant="h4" color="warning.main" fontWeight={700}>
                      {selectedStudentForDetail.attendance.late}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 2.5 }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="caption" color="text.secondary">Attendance Rate</Typography>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      color={selectedStudentForDetail.attendance.percentage >= 90 ? 'success.main' :
                        selectedStudentForDetail.attendance.percentage >= 70 ? 'warning.main' : 'error.main'}
                    >
                      {selectedStudentForDetail.attendance.percentage}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={5}>
                <Card sx={{ borderRadius: 2.5, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight={700}>Update Today&apos;s Attendance</Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Date"
                          type="date"
                          value={attendanceData.date}
                          onChange={(e) => setAttendanceData({...attendanceData, date: e.target.value})}
                          size="small"
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Time"
                          type="time"
                          value={attendanceData.time}
                          onChange={(e) => setAttendanceData({...attendanceData, time: e.target.value})}
                          size="small"
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={attendanceData.status}
                            onChange={(e) => setAttendanceData({...attendanceData, status: e.target.value})}
                            label="Status"
                          >
                            <MenuItem value="present">Present</MenuItem>
                            <MenuItem value="absent">Absent</MenuItem>
                            <MenuItem value="late">Late</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Remarks"
                          multiline
                          rows={3}
                          value={attendanceData.remarks}
                          onChange={(e) => setAttendanceData({...attendanceData, remarks: e.target.value})}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={7}>
                <Card sx={{ borderRadius: 2.5, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight={700}>Attendance Summary</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.06), mb: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">Current Result</Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {selectedStudentForDetail.attendance.percentage}% overall attendance
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={selectedStudentForDetail.attendance.percentage}
                        sx={{ mt: 1.25, height: 8, borderRadius: 6 }}
                        color={selectedStudentForDetail.attendance.percentage >= 90 ? 'success' :
                          selectedStudentForDetail.attendance.percentage >= 70 ? 'warning' : 'error'}
                      />
                    </Box>

                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Click below to open full attendance marking dialog with all fields.
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<CheckCircle />}
                        onClick={() => handleMarkAttendance(selectedStudentForDetail)}
                        fullWidth
                      >
                        Mark Today&apos;s Attendance
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card sx={{ borderRadius: 2.5 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight={700}>Recent Attendance Records</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ maxHeight: 360, overflow: 'auto', border: `1px solid ${alpha(theme.palette.divider, 0.35)}`, borderRadius: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.06) }}>
                            <TableCell>Date</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Remarks</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {studentAttendanceRecords.length > 0 ? (
                            studentAttendanceRecords.slice(0, 10).map((record, index) => (
                              <TableRow key={record._id || index} hover>
                                <TableCell>{moment(record.date).format('MMM DD, YYYY')}</TableCell>
                                <TableCell>
                                  {record.time
                                    ? moment(record.time, 'HH:mm').format('hh:mm A')
                                    : record.markedAt
                                      ? moment(record.markedAt).format('hh:mm A')
                                      : '-'}
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={record.status} 
                                    size="small" 
                                    color={record.status === 'present' ? 'success' : 
                                           record.status === 'late' ? 'warning' : 'error'} 
                                  />
                                </TableCell>
                                <TableCell>{record.remarks || '-'}</TableCell>
                                <TableCell>
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleEditAttendance(record)}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} align="center">
                                <Typography variant="body2" color="text.secondary">
                                  No attendance records found
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => handleMarkAttendance(selectedStudentForDetail)}
            startIcon={<CheckCircle />}
            disabled={markingAttendance}
          >
            {markingAttendance ? 'Marking...' : 'Mark Today\'s Attendance'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Attendance Dialog */}
      <Dialog 
        open={editingAttendance !== null} 
        onClose={handleCancelEdit} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Edit Attendance Record</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={editAttendanceData.date}
              onChange={(e) => setEditAttendanceData({...editAttendanceData, date: e.target.value})}
              size="small"
            />
            <TextField
              fullWidth
              label="Time"
              type="time"
              value={editAttendanceData.time}
              onChange={(e) => setEditAttendanceData({...editAttendanceData, time: e.target.value})}
              size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={editAttendanceData.status}
                onChange={(e) => setEditAttendanceData({...editAttendanceData, status: e.target.value})}
                label="Status"
              >
                <MenuItem value="present">Present</MenuItem>
                <MenuItem value="absent">Absent</MenuItem>
                <MenuItem value="late">Late</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Remarks"
              multiline
              rows={3}
              value={editAttendanceData.remarks}
              onChange={(e) => setEditAttendanceData({...editAttendanceData, remarks: e.target.value})}
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveEditedAttendance}
            disabled={markingAttendance}
            startIcon={markingAttendance ? <CircularProgress size={20} /> : <CheckCircle />}
          >
            {markingAttendance ? 'Updating...' : 'Update Attendance'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Speed Dial for Quick Actions */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
        open={speedDialOpen}
      >
        <SpeedDialAction
          icon={<CloudUpload />}
          tooltipTitle="Bulk Upload"
          onClick={handleBulkAttendance}
        />
        <SpeedDialAction
          icon={<NotificationsActive />}
          tooltipTitle="Announcement"
          onClick={() => setAnnouncementDialog(true)}
        />
        <SpeedDialAction
          icon={<Print />}
          tooltipTitle="Print Report"
          onClick={handleExportData}
        />
      </SpeedDial>
    </Box>
  );
};

// Helper for CSV export

export default AttendanceView;