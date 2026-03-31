import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
  LinearProgress,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
  useTheme,
  Tooltip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Alert,
  Stack,
  alpha,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Schedule,
  Visibility,
  Close,
  AccessTime,
  CalendarToday,
  TrendingUp,
  School,
  Download,
  VideoCameraFront,
  Chat,
  Quiz,
  Search,
  FilterList,
  MoreVert,
  ArrowForward,
  Person,
  AttachFile,
  Book,
  Star,
  ErrorOutline,
} from '@mui/icons-material';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import timezoneUtils from '../../utils/timezoneUtils';

// Status constants for type safety
const ENROLLMENT_STATUS = {
  ACTIVE: 'active',
  APPROVED: 'approved',
  PENDING: 'pending',
};

const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
};

const CurrentEnrollments = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const theme = useTheme();
  const navigate = useNavigate();

  // Fetch enrollments
  useEffect(() => {
    const loadEnrollments = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/students/enroll/my-enrollments');
        
        if (response.data?.success) {
          const activeEnrollments = response.data.enrollments
            .filter(enrollment => 
              [ENROLLMENT_STATUS.ACTIVE, ENROLLMENT_STATUS.APPROVED].includes(enrollment.status)
            )
            .map(processEnrollmentData);
          
          setEnrollments(activeEnrollments);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error loading enrollments:', error);
        toast.error('Failed to load enrollments');
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };

    loadEnrollments();
  }, []);

  // Process enrollment data
  const processEnrollmentData = (enrollment) => {
    let courseName = 'Course';
    let courseId = null;

    if (enrollment.course) {
      if (typeof enrollment.course === 'object' && enrollment.course.name) {
        courseName = enrollment.course.name;
        courseId = enrollment.course._id;
      } else if (typeof enrollment.course === 'string') {
        courseId = enrollment.course;
      }
    }

    const toNumber = (value, fallback = 0) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    const incomingStats = enrollment.attendanceStats || {};
    const present = toNumber(
      incomingStats.present ?? incomingStats.presentCount ?? enrollment.presentClasses,
      0
    );
    const absent = toNumber(
      incomingStats.absent ?? incomingStats.absentCount,
      0
    );
    const late = toNumber(
      incomingStats.late ?? incomingStats.lateCount,
      0
    );
    const total = toNumber(
      incomingStats.total ?? incomingStats.totalClasses ?? enrollment.totalClasses ?? (present + absent + late),
      0
    );

    const rawPercentage = incomingStats.percentage
      ?? incomingStats.attendancePercentage
      ?? enrollment.attendancePercentage
      ?? enrollment.student?.progress?.attendancePercentage;

    const computedPercentage = total > 0 ? Math.round((present / total) * 100) : 0;
    const percentage = Math.max(0, Math.min(100, toNumber(rawPercentage, computedPercentage)));

    return {
      ...enrollment,
      courseName,
      courseId,
      attendanceStats: {
        ...incomingStats,
        percentage,
        present,
        absent,
        late,
        total,
        lastUpdated: incomingStats.lastUpdated || null,
      },
      upcomingClasses: enrollment.upcomingClasses || [],
      completedClasses: enrollment.completedClasses || 0,
      progress: enrollment.progress || 0,
    };
  };

  // Fetch attendance data
  const fetchAttendanceForEnrollment = useCallback(async (enrollmentId) => {
    try {
      setAttendanceLoading(true);
      setAttendanceData([]);
      const response = await axios.get(`/api/attendance/enrollment/${enrollmentId}`);
      
      if (response.data?.success) {
        setAttendanceData(response.data.attendance || []);
      } else {
        throw new Error('Invalid attendance data');
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance records');
      setAttendanceData([]);
    } finally {
      setAttendanceLoading(false);
    }
  }, []);

  // Handle view attendance
  const handleViewAttendance = useCallback((enrollment) => {
    setSelectedEnrollment(enrollment);
    fetchAttendanceForEnrollment(enrollment._id);
    setAttendanceDialogOpen(true);
  }, [fetchAttendanceForEnrollment]);

  const selectedAttendanceStats = useMemo(() => {
    const fallback = {
      percentage: selectedEnrollment?.attendanceStats?.percentage || 0,
      present: selectedEnrollment?.attendanceStats?.present || 0,
      absent: selectedEnrollment?.attendanceStats?.absent || 0,
      late: selectedEnrollment?.attendanceStats?.late || 0,
      total: selectedEnrollment?.attendanceStats?.total || 0,
    };

    if (!selectedEnrollment || attendanceData.length === 0) {
      return fallback;
    }

    const present = attendanceData.filter((item) => item.status === ATTENDANCE_STATUS.PRESENT).length;
    const absent = attendanceData.filter((item) => item.status === ATTENDANCE_STATUS.ABSENT).length;
    const late = attendanceData.filter((item) => item.status === ATTENDANCE_STATUS.LATE).length;
    const total = attendanceData.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      percentage,
      present,
      absent,
      late,
      total,
    };
  }, [selectedEnrollment, attendanceData]);

  // Status helpers
  const getStatusConfig = useCallback((status) => {
    const configs = {
      [ATTENDANCE_STATUS.PRESENT]: {
        color: '#4CAF50',
        bgColor: '#E8F5E9',
        icon: <CheckCircle fontSize="small" />,
      },
      [ATTENDANCE_STATUS.ABSENT]: {
        color: '#F44336',
        bgColor: '#FFEBEE',
        icon: <Cancel fontSize="small" />,
      },
      [ATTENDANCE_STATUS.LATE]: {
        color: '#FF9800',
        bgColor: '#FFF3E0',
        icon: <Schedule fontSize="small" />,
      },
    };
    return configs[status] || { color: '#9E9E9E', bgColor: '#FAFAFA', icon: null };
  }, []);

  const getEnrollmentStatusConfig = useCallback((status) => {
    const configs = {
      [ENROLLMENT_STATUS.ACTIVE]: {
        label: 'ACTIVE',
        color: '#2E7D32',
        bgColor: '#E8F5E9',
      },
      [ENROLLMENT_STATUS.APPROVED]: {
        label: 'APPROVED',
        color: '#1976D2',
        bgColor: '#E3F2FD',
      },
      [ENROLLMENT_STATUS.PENDING]: {
        label: 'PENDING',
        color: '#ED6C02',
        bgColor: '#FFF3E0',
      },
    };
    return configs[status] || { label: status.toUpperCase(), color: '#757575', bgColor: '#F5F5F5' };
  }, []);

  // Format date helper
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  // Filtered enrollments
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(enrollment => {
      const matchesSearch = enrollment.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          enrollment.ulma?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enrollments, searchTerm, statusFilter]);

  const enrollmentSummary = useMemo(() => {
    const total = enrollments.length;
    const active = enrollments.filter((item) => item.status === ENROLLMENT_STATUS.ACTIVE).length;
    const avgAttendance = total > 0
      ? Math.round(enrollments.reduce((sum, item) => sum + (item.attendanceStats?.percentage || 0), 0) / total)
      : 0;

    return { total, active, avgAttendance };
  }, [enrollments]);

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Empty state
  if (enrollments.length === 0 && !loading) {
    return (
      <Container maxWidth="md">
        <Box textAlign="center" py={10}>
          <School sx={{ fontSize: 80, color: 'action.disabled', mb: 3 }} />
          <Typography variant="h5" gutterBottom fontWeight={500}>
            No Active Courses Found
          </Typography>
          <Typography color="text.secondary" paragraph>
            You are not currently enrolled in any active courses.
          </Typography>
          <Button variant="contained" size="large" onClick={() => navigate('/student/courses')}>
            Explore Available Courses
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          mb: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
          background: `linear-gradient(130deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              My Enrollments
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and track your enrolled courses with live attendance and progress insights.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip color="primary" label={`${enrollmentSummary.total} Courses`} />
            <Chip color="success" label={`${enrollmentSummary.active} Active`} />
            <Chip color="info" label={`${enrollmentSummary.avgAttendance}% Avg Attendance`} />
          </Stack>
        </Box>

        {/* Search and Filter */}
        <Box display="flex" gap={1.25} alignItems="center" mt={2.5} flexWrap="wrap">
          <TextField
            placeholder="Search courses or instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: { xs: '100%', md: 320 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<FilterList />}
            onClick={(e) => setFilterAnchor(e.currentTarget)}
            size="small"
          >
            Filter Status
          </Button>
          <Menu
            anchorEl={filterAnchor}
            open={Boolean(filterAnchor)}
            onClose={() => setFilterAnchor(null)}
          >
            <MenuItem onClick={() => { setStatusFilter('all'); setFilterAnchor(null); }}>
              All Status
            </MenuItem>
            <MenuItem onClick={() => { setStatusFilter(ENROLLMENT_STATUS.ACTIVE); setFilterAnchor(null); }}>
              Active Only
            </MenuItem>
            <MenuItem onClick={() => { setStatusFilter(ENROLLMENT_STATUS.APPROVED); setFilterAnchor(null); }}>
              Approved Only
            </MenuItem>
          </Menu>
        </Box>
      </Paper>

      {/* Enrollments Grid */}
      <Grid container spacing={3}>
        {filteredEnrollments.map((enrollment) => {
          const statusConfig = getEnrollmentStatusConfig(enrollment.status);
          
          return (
            <Grid item xs={12} md={6} key={enrollment._id}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.25,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.15),
                  borderRadius: 3,
                  transition: 'all 0.25s ease',
                  background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[6],
                  },
                }}
              >
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.14), color: 'primary.main', width: 48, height: 48 }}>
                      <School />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        {enrollment.courseName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {enrollment.ulma?.user?.name || 'Instructor not assigned'}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={statusConfig.label}
                    size="small"
                    sx={{
                      bgcolor: statusConfig.bgColor,
                      color: statusConfig.color,
                      fontWeight: 500,
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Course Details */}
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Monthly Fee
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      ${enrollment.monthlyFee || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Progress
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LinearProgress
                        variant="determinate"
                        value={enrollment.progress}
                        sx={{ flex: 1, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="body2" fontWeight={500}>
                        {enrollment.progress}%
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Schedule */}
                {enrollment.schedule && (
                  <Box mb={2}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                      <AccessTime fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Class Schedule
                    </Typography>
                    <Box display="flex" alignItems={{ xs: 'flex-start', sm: 'center' }} flexDirection={{ xs: 'column', sm: 'row' }} gap={1}>
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        {enrollment.schedule.days?.map((day, idx) => (
                          <Chip
                            key={idx}
                            label={day.slice(0, 3).toUpperCase()}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                      </Box>
                      <Typography variant="body2" fontWeight={500}>
                        {(() => {
                          const displayTimes = timezoneUtils.getScheduleDisplayTimes(
                            enrollment.schedule,
                            timezoneUtils.getUserTimezone(user)
                          );
                          return displayTimes
                            ? `${displayTimes.startTime12} - ${displayTimes.endTime12}`
                            : `${enrollment.schedule.startTime} - ${enrollment.schedule.endTime}`;
                        })()}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Attendance Stats */}
                <Box mb={3}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="caption" color="text.secondary">
                      <TrendingUp fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Attendance
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {enrollment.attendanceStats.percentage}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={enrollment.attendanceStats.percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        bgcolor: enrollment.attendanceStats.percentage >= 90 ? 'success.main' :
                          enrollment.attendanceStats.percentage >= 70 ? 'warning.main' : 'error.main',
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" display="block" textAlign="right" mt={0.5}>
                    {enrollment.attendanceStats.total > 0
                      ? `${enrollment.attendanceStats.present} of ${enrollment.attendanceStats.total} classes`
                      : 'No classes marked yet'}
                  </Typography>
                </Box>

                {/* Actions */}
                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    startIcon={<Visibility />}
                    onClick={() => handleViewAttendance(enrollment)}
                    fullWidth
                    sx={{ borderRadius: 2, py: 1 }}
                  >
                    View Details
                  </Button>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

   
      {/* Attendance Dialog */}
      <Dialog
        open={attendanceDialogOpen}
        onClose={() => setAttendanceDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            minHeight: { xs: '80vh', md: '72vh' },
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Attendance Record
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedEnrollment?.courseName}
              </Typography>
            </Box>
            <IconButton onClick={() => setAttendanceDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3, bgcolor: alpha(theme.palette.background.default, 0.6) }}>
          {/* Summary Stats */}
          {selectedEnrollment && (
            <Grid container spacing={2} mb={3}>
              <Grid item xs={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight={600} color="primary.main">
                    {selectedAttendanceStats.percentage}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Overall
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight={600} color="success.main">
                    {selectedAttendanceStats.present}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Present
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight={600} color="error.main">
                    {selectedAttendanceStats.absent + selectedAttendanceStats.late}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Absent / Late
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight={600} color="warning.main">
                    {selectedAttendanceStats.total}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Classes
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Attendance Table */}
          {attendanceLoading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : attendanceData.length > 0 ? (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: 420 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceData.map((record) => {
                    const statusConfig = getStatusConfig(record.status);
                    return (
                      <TableRow key={record._id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <CalendarToday fontSize="small" color="action" />
                            {formatDate(record.date)}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(record.date) !== 'Invalid date' ? format(parseISO(record.date), 'hh:mm a') : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={statusConfig.icon}
                            label={record.status.toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: statusConfig.bgColor,
                              color: statusConfig.color,
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {record.remarks || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info" icon={<ErrorOutline />}>
              No attendance records found for this course.
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setAttendanceDialogOpen(false)}>Close</Button>
          {attendanceData.length > 0 && (
            <Button variant="contained" startIcon={<Download />} sx={{ borderRadius: 2 }}>
              Export as PDF
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CurrentEnrollments;