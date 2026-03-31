import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
  Tooltip,
  Tabs,
  Tab,
  Avatar,
  useTheme,
  alpha,
  Stack,
  useMediaQuery,
  Pagination,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Schedule as ScheduleIcon,
  Videocam,
  CheckCircle,
  Cancel,
  Pending,
  FilterList,
  AccessTime,
  Refresh,
  School,
  Person,
  Event,
  Timer,
  MenuBook,
  Close,
  ChevronLeft,
  ChevronRight,
  AssignmentTurnedIn,
} from '@mui/icons-material';
import axios from 'axios';
import { format, isToday, isPast, isFuture, isTomorrow, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const getAttendanceStatus = (attendance) => {
  if (typeof attendance === 'boolean') {
    return attendance ? 'present' : 'absent';
  }
  if (!attendance) return 'pending';
  if (typeof attendance === 'object') {
    if (attendance.status) return attendance.status;
    if (attendance._id) return 'pending';
  }
  if (typeof attendance === 'string' && attendance.match(/^[0-9a-fA-F]{24}$/)) {
    return 'pending';
  }
  const norm = String(attendance).trim().toLowerCase();
  if (['present', 'absent', 'late'].includes(norm)) return norm;
  return 'pending';
};

const formatTo12Hour = (timeValue) => {
  if (!timeValue) return '';

  const parsed = String(timeValue).match(/^(\d{1,2}):(\d{2})/);
  if (!parsed) return timeValue;

  const hours24 = Number(parsed[1]);
  const minutes = parsed[2];
  if (Number.isNaN(hours24)) return timeValue;

  const suffix = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = ((hours24 + 11) % 12) + 1;
  return `${hours12}:${minutes} ${suffix}`;
};

const getClassStartDateTime = (classItem) => {
  if (!classItem) return null;

  if (classItem.utcStart) {
    const utcDate = new Date(classItem.utcStart);
    if (!Number.isNaN(utcDate.getTime())) return utcDate;
  }

  if (classItem.date && classItem.startTime) {
    const datePart = String(classItem.date).split('T')[0];
    const localDateTime = new Date(`${datePart}T${classItem.startTime}`);
    if (!Number.isNaN(localDateTime.getTime())) return localDateTime;
  }

  if (classItem.date) {
    const fallbackDate = new Date(classItem.date);
    if (!Number.isNaN(fallbackDate.getTime())) return fallbackDate;
  }

  return null;
};
// Mobile Card Component for List View
const MobileClassCard = ({ classItem, onStartClass, onJoinClass, onEdit, onDelete, onViewDetails, onMarkAttendance }) => {
  const theme = useTheme();
  const studentName = classItem.student?.user?.name || classItem.studentName || 'Unknown';
  const courseName = classItem.course?.name || classItem.course || 'No Course';

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return { bg: '#4caf50', light: alpha('#4caf50', 0.1) };
      case 'ongoing': return { bg: '#ff9800', light: alpha('#ff9800', 0.1) };
      case 'scheduled': return { bg: '#2196f3', light: alpha('#2196f3', 0.1) };
      default: return { bg: '#9e9e9e', light: alpha('#9e9e9e', 0.1) };
    }
  };

  const statusColors = getStatusColor(classItem.status);

  return (
    <Card sx={{ mb: 2, borderRadius: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              {studentName.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {studentName}
              </Typography>
              <Typography variant="caption" color="textSecondary" display="flex" alignItems="center" gap={0.5}>
                <School sx={{ fontSize: 12 }} />
                {courseName}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={classItem.status?.toUpperCase()}
            size="small"
            sx={{ bgcolor: statusColors.light, color: statusColors.bg }}
          />
        </Box>

        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="caption" color="textSecondary">Date</Typography>
            <Typography variant="body2">{format(new Date(classItem.date), 'MMM d, yyyy')}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="textSecondary">Time</Typography>
            <Typography variant="body2">{formatTo12Hour(classItem.startTime)} - {formatTo12Hour(classItem.endTime)}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="textSecondary">Topic</Typography>
            <Typography variant="body2">{classItem.topic || 'Quran Class'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="textSecondary">Attendance</Typography>
            <Box mt={0.5}>
              {getAttendanceStatus(classItem.attendance) === 'present' && (
                <Tooltip title={classItem.attendance?.markedAt ? `Marked at ${new Date(classItem.attendance.markedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}` : 'Present'}>
                  <Chip icon={<CheckCircle sx={{ fontSize: 16 }} />} label="Present" size="small" color="success" variant="outlined" />
                </Tooltip>
              )}
              {getAttendanceStatus(classItem.attendance) === 'absent' && (
                <Tooltip title={classItem.attendance?.markedAt ? `Marked at ${new Date(classItem.attendance.markedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}` : 'Absent'}>
                  <Chip icon={<Cancel sx={{ fontSize: 16 }} />} label="Absent" size="small" color="error" variant="outlined" />
                </Tooltip>
              )}
              {getAttendanceStatus(classItem.attendance) === 'late' && (
                <Tooltip title={classItem.attendance?.markedAt ? `Marked at ${new Date(classItem.attendance.markedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}` : 'Late'}>
                  <Chip icon={<ScheduleIcon sx={{ fontSize: 16 }} />} label="Late" size="small" color="warning" variant="outlined" />
                </Tooltip>
              )}
              {getAttendanceStatus(classItem.attendance) === 'pending' && (
                <Chip icon={<Pending sx={{ fontSize: 16 }} />} label="Pending" size="small" variant="outlined" />
              )}
            </Box>
          </Grid>
        </Grid>

        <Box display="flex" gap={1} justifyContent="flex-end">
          {classItem.status === 'scheduled' && (
            <Tooltip title="Start Class">
              <IconButton size="small" color="primary" onClick={() => onStartClass(classItem._id || classItem.id)}>
                <Videocam />
              </IconButton>
            </Tooltip>
          )}
          {classItem.status === 'ongoing' && (
            <Tooltip title="Join Live Class">
              <IconButton size="small" color="success" onClick={() => onJoinClass(classItem._id || classItem.id)}>
                <Videocam />
              </IconButton>
            </Tooltip>
          )}
          {(classItem.status === 'ongoing' || classItem.status === 'completed') && getAttendanceStatus(classItem.attendance) === 'pending' && (
            <Tooltip title="Mark Attendance">
              <IconButton size="small" color="secondary" onClick={() => onMarkAttendance(classItem)}>
                <AssignmentTurnedIn />
              </IconButton>
            </Tooltip>
          )}
          {classItem.status === 'scheduled' && (
            <>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => onEdit(classItem)}>
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" color="error" onClick={() => onDelete(classItem)}>
                  <Delete />
                </IconButton>
              </Tooltip>
            </>
          )}
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => onViewDetails(classItem)}>
              <Visibility />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

const UlmaSchedule = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState({
    attendance: 'present',
    progress: {
      paraCompleted: '',
      surahCompleted: '',
      remarks: '',
    },
  });
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    date: '',
    startTime: '',
    endTime: '',
    course: '',
    topic: '',
    notes: '',
  });
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    studentId: '',
  });
  const [activeTab, setActiveTab] = useState(1);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // Memoized fetch functions to prevent infinite loops
  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const params = { ...filters, limit: 50 };
      const { data } = await axios.get('/api/ulma/schedule', { params });
      setSchedule(data.classes || []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters.status, filters.date, filters.studentId]); // Only depend on filter values

  const fetchStudents = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/ulma/students?limit=100');
      setStudents(data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }, []);

  // Separate useEffect for initial load
  useEffect(() => {
    fetchSchedule();
    fetchStudents();
  }, [fetchSchedule, fetchStudents]); // Now this won't cause infinite loops

  // Listen for attendance updates
  useEffect(() => {
    const handleAttendanceUpdate = () => {
      fetchSchedule();
    };

    window.addEventListener('attendanceUpdated', handleAttendanceUpdate);

    return () => {
      window.removeEventListener('attendanceUpdated', handleAttendanceUpdate);
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSchedule();
  };

  const handleOpenDialog = (classItem = null) => {
    if (classItem) {
      let courseId = '';
      if (typeof classItem.course === 'object' && classItem.course) {
        courseId = classItem.course._id || '';
      } else if (typeof classItem.course === 'string') {
        courseId = classItem.course;
      }

      const studentName = classItem.studentName || classItem.student?.user?.name || classItem.student?.name || '';

      setFormData({
        studentId: '',
        date: format(new Date(classItem.date), 'yyyy-MM-dd'),
        startTime: classItem.startTime,
        endTime: classItem.endTime,
        course: courseId,
        topic: classItem.topic || '',
        notes: classItem.notes || '',
      });
      const classId = classItem._id || classItem.id;
      const selectedClassData = {
        ...classItem,
        studentName,
        _id: classId,
        id: classId
      };
      setSelectedClass(selectedClassData);
    } else {
      setFormData({
        studentId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: '09:00',
        endTime: '10:00',
        course: '',
        topic: '',
        notes: '',
      });
      setSelectedClass(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedClass(null);
  };

  const handleOpenDetailsDialog = (classItem) => {
    setSelectedClass(classItem);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedClass(null);
  };

  const handleMarkAttendance = (classItem) => {
    setSelectedClass(classItem);
    setAttendanceData({
      attendance: 'present',
      progress: {
        paraCompleted: classItem.progress?.paraCompleted || '',
        surahCompleted: classItem.progress?.surahCompleted || '',
        remarks: classItem.progress?.remarks || '',
      },
    });
    setAttendanceDialogOpen(true);
  };

  const handleSubmitAttendance = async () => {
    if (!selectedClass) return;

    try {
      setMarkingAttendance(true);
      const classId = selectedClass._id || selectedClass.id;

      const response = await axios.post(`/api/ulma/classes/${classId}/attendance`, {
        attendance: attendanceData.attendance,
        progress: attendanceData.progress,
      });

      toast.success('Attendance marked successfully');
      setAttendanceDialogOpen(false);

      // Trigger attendance update event for other components
      localStorage.setItem('attendanceUpdated', Date.now().toString());
      window.dispatchEvent(new CustomEvent('attendanceUpdated'));

      fetchSchedule(); // Refresh the schedule to show updated attendance
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setMarkingAttendance(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedClass && !formData.studentId) {
      toast.error('Please select a student');
      return;
    }

    try {
      if (!formData.startTime || !formData.endTime) {
        toast.error('Start time and end time are required');
        return;
      }

      if (selectedClass) {
        const classId = selectedClass._id || selectedClass.id;

        if (!classId) {
          toast.error('Error: Class ID is missing');
          return;
        }

        const submitData = {
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          topic: formData.topic,
          notes: formData.notes,
        };

        const { data } = await axios.put(`/api/ulma/classes/${classId}`, submitData);
        toast.success('Class updated successfully');
        fetchSchedule();
      } else {
        const { data } = await axios.post('/api/ulma/classes', formData);
        toast.success('Class scheduled successfully');
        fetchSchedule();
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Submit error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to save class');
    }
  };

  const handleDelete = async () => {
    try {
      const classId = selectedClass._id || selectedClass.id;
      await axios.delete(`/api/ulma/classes/${classId}`);
      toast.success('Class deleted successfully');
      setDeleteDialogOpen(false);
      fetchSchedule();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete class');
    }
  };

  const handleStartClass = async (classId) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`/api/ulma/classes/${classId}/start`);
      setSchedule((prev) =>
        prev.map((cls) =>
          (cls._id || cls.id) === classId
            ? { ...cls, status: 'ongoing' }
            : cls
        )
      );
      toast.success('Class started. Join is now available for both teacher and student.');
      fetchSchedule();
    } catch (error) {
      console.error('Error starting class:', error);
      toast.error(error.response?.data?.message || 'Failed to start class');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = (classId) => {
    navigate(`/ulma/live-class/${classId}`);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value || '',
    }));
    setPage(1); // Reset page when filters change
  };

  const getFilteredClasses = useMemo(() => {
    let filtered = [...schedule];

    if (activeTab === 1) {
      filtered = filtered.filter(c => isToday(new Date(c.date)));
    } else if (activeTab === 2) {
      filtered = filtered.filter(c => isFuture(new Date(c.date)));
    } else if (activeTab === 3) {
      filtered = filtered.filter(c => isPast(new Date(c.date)));
    }

    filtered.sort((a, b) => {
      const startA = getClassStartDateTime(a);
      const startB = getClassStartDateTime(b);

      if (!startA && !startB) return 0;
      if (!startA) return 1;
      if (!startB) return -1;

      return startA - startB;
    });

    return filtered;
  }, [schedule, activeTab]);

  // Pagination
  const paginatedClasses = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return getFilteredClasses.slice(start, end);
  }, [getFilteredClasses, page, rowsPerPage]);

  const pageCount = Math.ceil(getFilteredClasses.length / rowsPerPage);

  const getCalendarEvents = useMemo(() => {
    return schedule.map(classItem => ({
      id: classItem._id || classItem.id,
      title: `${classItem.student?.user?.name} - ${classItem.course?.name || classItem.course}`,
      start: new Date(`${classItem.date}T${classItem.startTime}`),
      end: new Date(`${classItem.date}T${classItem.endTime}`),
      resource: classItem,
    }));
  }, [schedule]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return { bg: '#4caf50', light: alpha('#4caf50', 0.1) };
      case 'ongoing': return { bg: '#ff9800', light: alpha('#ff9800', 0.1) };
      case 'scheduled': return { bg: '#2196f3', light: alpha('#2196f3', 0.1) };
      default: return { bg: '#9e9e9e', light: alpha('#9e9e9e', 0.1) };
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              {loading ? <Skeleton width={60} /> : value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: alpha(color, 0.2), width: { xs: 40, sm: 56 }, height: { xs: 40, sm: 56 } }}>
            <Icon sx={{ fontSize: { xs: 24, sm: 32 }, color }} />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  // Loading skeleton for table
  if (loading && schedule.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: { xs: 2, md: 3 } }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: { xs: 2, md: 3 } }}>
      {/* Header Section */}
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 4, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              Class Schedule
            </Typography>
            <Typography color="textSecondary" variant="body2">
              Manage your teaching schedule and track class progress
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={refreshing}
              size={isMobile ? "small" : "medium"}
            >
              {refreshing ? <CircularProgress size={20} /> : 'Refresh'}
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              size={isMobile ? "small" : "medium"}
            >
              {isMobile ? 'Add' : 'Schedule Class'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2, overflowX: 'auto' }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ minHeight: { xs: 48, sm: 64 } }}
        >
          <Tab label="All" />
          
          <Tab label="Today"   />
          <Tab label="Upcoming" />
          <Tab label="Past" />
          {!isMobile && <Tab label="Calendar" />}
        </Tabs>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Date"
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="ongoing">Ongoing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Student</InputLabel>
              <Select
                value={filters.studentId}
                label="Student"
                onChange={(e) => handleFilterChange('studentId', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {students.map((student) => (
                  <MenuItem key={student._id} value={student._id}>
                    {student.user?.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<FilterList />}
              onClick={fetchSchedule}
            >
              Apply
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      {activeTab === 4 && !isMobile ? (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Box sx={{ height: { xs: 400, sm: 500, md: 600 } }}>
            <Calendar
              localizer={localizer}
              events={getCalendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              views={['month', 'week', 'day']}
              defaultView="month"
              onSelectEvent={(event) => setSelectedClass(event.resource)}
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: getStatusColor(event.resource.status).bg,
                  borderRadius: '4px',
                },
              })}
            />
          </Box>
        </Paper>
      ) : activeTab !== 4 ? (
        <>
          {isMobile ? (
            // Mobile Card View
            <Box>
              {paginatedClasses.map((classItem) => (
                <MobileClassCard
                  key={classItem._id || classItem.id}
                  classItem={classItem}
                  onStartClass={handleStartClass}
                  onJoinClass={handleJoinClass}
                  onEdit={handleOpenDialog}
                  onDelete={(item) => {
                    setSelectedClass(item);
                    setDeleteDialogOpen(true);
                  }}
                  onViewDetails={handleOpenDetailsDialog}
                  onMarkAttendance={handleMarkAttendance}
                />
              ))}
              {paginatedClasses.length === 0 && (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  No classes found matching your criteria.
                </Alert>
              )}
              {pageCount > 1 && (
                <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
                  <Pagination
                    count={pageCount}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                    size={isMobile ? "small" : "medium"}
                  />
                </Box>
              )}
            </Box>
          ) : (
            // Desktop Table View
            <>
              <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto' }}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Student & Course</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date & Time</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Topic</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Attendance</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedClasses.map((classItem) => {
                      const studentName = classItem.student?.user?.name || classItem.studentName || 'Unknown';
                      const courseName = classItem.course?.name || classItem.course || 'No Course';
                      const statusColors = getStatusColor(classItem.status);

                      return (
                        <TableRow key={classItem._id || classItem.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                {studentName.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {studentName}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {courseName}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {format(new Date(classItem.date), 'MMM d, yyyy')}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {formatTo12Hour(classItem.startTime)} - {formatTo12Hour(classItem.endTime)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {classItem.topic || 'Quran Class'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={classItem.status?.toUpperCase()}
                              size="small"
                              sx={{ bgcolor: statusColors.light, color: statusColors.bg }}
                            />
                          </TableCell>
                          <TableCell>
                            {getAttendanceStatus(classItem.attendance) === 'present' && (
                              <Tooltip title={classItem.attendance?.markedAt ? `Marked at ${new Date(classItem.attendance.markedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}` : 'Present'}>
                                <CheckCircle color="success" />
                              </Tooltip>
                            )}
                            {getAttendanceStatus(classItem.attendance) === 'absent' && (
                              <Tooltip title={classItem.attendance?.markedAt ? `Marked at ${new Date(classItem.attendance.markedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}` : 'Absent'}>
                                <Cancel color="error" />
                              </Tooltip>
                            )}
                            {getAttendanceStatus(classItem.attendance) === 'late' && (
                              <Tooltip title={classItem.attendance?.markedAt ? `Marked at ${new Date(classItem.attendance.markedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}` : 'Late'}>
                                <ScheduleIcon color="warning" />
                              </Tooltip>
                            )}
                            {getAttendanceStatus(classItem.attendance) === 'pending' && <Pending color="action" />}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={0.5}>
                              {classItem.status === 'scheduled' && (
                                <Tooltip title="Start Class">
                                  <IconButton size="small" color="primary" onClick={() => handleStartClass(classItem._id || classItem.id)}>
                                    <Videocam />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {classItem.status === 'ongoing' && (
                                <Tooltip title="Join Live Class">
                                  <IconButton size="small" color="success" onClick={() => handleJoinClass(classItem._id || classItem.id)}>
                                    <Videocam />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {(classItem.status === 'ongoing' || classItem.status === 'completed') && getAttendanceStatus(classItem.attendance) === 'pending' && (
                                <Tooltip title="Mark Attendance">
                                  <IconButton size="small" color="secondary" onClick={() => handleMarkAttendance(classItem)}>
                                    <AssignmentTurnedIn />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {classItem.status === 'scheduled' && (
                                <>
                                  <Tooltip title="Edit">
                                    <IconButton size="small" onClick={() => handleOpenDialog(classItem)}>
                                      <Edit />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton size="small" color="error" onClick={() => {
                                      setSelectedClass(classItem);
                                      setDeleteDialogOpen(true);
                                    }}>
                                      <Delete />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                              <Tooltip title="View Details">
                                <IconButton size="small" onClick={() => handleOpenDetailsDialog(classItem)}>
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              {paginatedClasses.length === 0 && (
                <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                  No classes found matching your criteria.
                </Alert>
              )}
              {pageCount > 1 && (
                <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
                  <Pagination
                    count={pageCount}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </>
      ) : null}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            icon={ScheduleIcon}
            title="Total Classes"
            value={schedule.length}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            icon={CheckCircle}
            title="Completed"
            value={schedule.filter(c => c.status === 'completed').length}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            icon={Timer}
            title="Scheduled"
            value={schedule.filter(c => c.status === 'scheduled').length}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            icon={School}
            title="Students"
            value={new Set(schedule.map(c => c.student?._id || c.student?.id)).size}
            color={theme.palette.secondary.main}
          />
        </Grid>
      </Grid>

      {/* Dialogs remain the same as before */}
      {/* ... (keep all dialog components from previous version) */}

      {/* Add/Edit Class Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
      >
        <DialogTitle>
          {selectedClass ? 'Edit Class' : 'Schedule New Class'}
          {isMobile && (
            <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {selectedClass && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Student"
                  value={selectedClass.studentName || selectedClass.student?.user?.name || ''}
                  InputProps={{ readOnly: true }}
                  margin="normal"
                />
              </Grid>
            )}
            {!selectedClass && (
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Student</InputLabel>
                  <Select
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    label="Student"
                    required
                  >
                    <MenuItem value="">Select Student</MenuItem>
                    {students.map((student) => (
                      <MenuItem key={student._id} value={student._id}>
                        {student.user?.name} ({student.currentCourse})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="date"
                label="Date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="startTime"
                label="Start Time"
                type="time"
                value={formData.startTime}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="endTime"
                label="End Time"
                type="time"
                value={formData.endTime}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="topic"
                label="Topic"
                value={formData.topic}
                onChange={handleInputChange}
                margin="normal"
                placeholder="e.g., Tajweed Rules, Surah Al-Fatiha"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="notes"
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                margin="normal"
                placeholder="Additional notes for the class..."
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 1 }}>
                Meeting link is not required. Classes now run directly in-app with WebRTC.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {selectedClass ? 'Update' : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Class</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete this class?
          </Alert>
          <Typography variant="body2" color="textSecondary">
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={handleCloseDetailsDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden"
          }
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: "white"
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: "white",
                color: theme.palette.primary.main,
                fontWeight: 600
              }}
            >
              {selectedClass?.studentName?.charAt(0) ||
                selectedClass?.student?.user?.name?.charAt(0) ||
                "S"}
            </Avatar>

            <Box>
              <Typography variant="h6" fontWeight={600}>
                {selectedClass?.studentName ||
                  selectedClass?.student?.user?.name ||
                  "Student"}
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {typeof selectedClass?.course === "object"
                  ? selectedClass.course?.name
                  : selectedClass?.course}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <Grid container spacing={2}>
            {/* Date */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Date
                </Typography>

                <Typography fontWeight={600}>
                  {selectedClass?.date
                    ? format(new Date(selectedClass.date), "MMM d, yyyy")
                    : "N/A"}
                </Typography>
              </Box>
            </Grid>

            {/* Time */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Time
                </Typography>

                <Typography fontWeight={600}>
                  {formatTo12Hour(selectedClass?.startTime)} - {formatTo12Hour(selectedClass?.endTime)}
                </Typography>
              </Box>
            </Grid>

            {/* Topic */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  Topic
                </Typography>

                <Chip
                  label={selectedClass?.topic || "Quran Class"}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Grid>

            {/* Notes */}
            {selectedClass?.notes && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" mb={1}>
                    Notes
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {selectedClass.notes}
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Join live class */}
            {selectedClass?.status === 'ongoing' && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 1
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Live Class
                  </Typography>

                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleJoinClass(selectedClass._id || selectedClass.id)}
                  >
                    Join Class
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDetailsDialog} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mark Attendance Dialog */}
      <Dialog open={attendanceDialogOpen} onClose={() => setAttendanceDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mark Attendance</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Student: {selectedClass?.student?.user?.name || selectedClass?.studentName || 'Unknown'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Class: {format(new Date(selectedClass?.date || new Date()), 'MMM d, yyyy')} at {formatTo12Hour(selectedClass?.startTime)} - {formatTo12Hour(selectedClass?.endTime)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Attendance Status</InputLabel>
                <Select
                  value={attendanceData.attendance}
                  label="Attendance Status"
                  onChange={(e) => setAttendanceData(prev => ({ ...prev, attendance: e.target.value }))}
                >
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                  <MenuItem value="late">Late</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Para Completed"
                value={attendanceData.progress.paraCompleted}
                onChange={(e) => setAttendanceData(prev => ({
                  ...prev,
                  progress: { ...prev.progress, paraCompleted: e.target.value }
                }))}
                placeholder="e.g., 5"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Surah Completed"
                value={attendanceData.progress.surahCompleted}
                onChange={(e) => setAttendanceData(prev => ({
                  ...prev,
                  progress: { ...prev.progress, surahCompleted: e.target.value }
                }))}
                placeholder="e.g., Al-Fatiha"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks"
                multiline
                rows={3}
                value={attendanceData.progress.remarks}
                onChange={(e) => setAttendanceData(prev => ({
                  ...prev,
                  progress: { ...prev.progress, remarks: e.target.value }
                }))}
                placeholder="Additional remarks about the class..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttendanceDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitAttendance}
            disabled={markingAttendance}
          >
            {markingAttendance ? 'Marking...' : 'Mark Attendance'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UlmaSchedule;