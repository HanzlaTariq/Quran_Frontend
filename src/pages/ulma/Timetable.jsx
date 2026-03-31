import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  IconButton,
  useMediaQuery,
  useTheme,
  Chip,
  Card,
  CardContent,
  Fab,
  SwipeableDrawer,
  Divider,
  Stack,
  alpha,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Refresh,
  Person,
  Book,
  ChevronLeft,
  ChevronRight,
  Today,
  Schedule,
  AccessTime,
  Close,
  CalendarToday,
  MenuBook,
  People,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import timezoneUtils from '../../utils/timezoneUtils';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { format, startOfWeek, addDays, addMinutes, isSameDay, isToday } from 'date-fns';

const Timetable = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [workingHours, setWorkingHours] = useState({ startTime: '08:00', endTime: '20:00' });

  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    topic: '',
    date: '',
    startTime: '',
    endTime: '',
    notes: '',
  });

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = parseInt(workingHours.startTime.split(':')[0]);
    const endHour = parseInt(workingHours.endTime.split(':')[0]);
    const startMinute = parseInt(workingHours.startTime.split(':')[1]);
    const endMinute = parseInt(workingHours.endTime.split(':')[1]);

    for (let hour = startHour; hour <= endHour; hour++) {
      if (hour === startHour) {
        if (startMinute <= 0) slots.push(`${hour.toString().padStart(2, '0')}:00`);
        if (startMinute <= 30 && hour < endHour) slots.push(`${hour.toString().padStart(2, '0')}:30`);
      } else if (hour === endHour) {
        if (endMinute >= 0) slots.push(`${hour.toString().padStart(2, '0')}:00`);
        if (endMinute >= 30) slots.push(`${hour.toString().padStart(2, '0')}:30`);
      } else {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        if (hour < endHour) slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Generate week days (Monday to Saturday)
  const weekDays = [];
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  for (let i = 0; i < 6; i++) {
    const date = addDays(weekStart, i);
    weekDays.push({
      day: format(date, 'EEEE'),
      date: format(date, 'yyyy-MM-dd'),
      displayDate: format(date, 'MMM d'),
      isToday: isToday(date),
    });
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [enrollmentsRes, studentsRes, coursesRes, profileRes] = await Promise.all([
        axios.get('/api/ulma/enrollments'),
        axios.get('/api/ulma/students?limit=100'),
        axios.get('/api/ulma/courses'),
        axios.get('/api/ulma/profile'),
      ]);

      setEnrollments(enrollmentsRes.data.enrollments || []);
      setStudents(studentsRes.data.students || []);
      setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
      
      if (profileRes.data?.workingHours) {
        setWorkingHours(profileRes.data.workingHours);
      }
      
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load data');
      setLoading(false);
    }
  };

  const handleSaveClass = async () => {
    try {
      if (selectedClass) {
        await axios.put(`/api/ulma/classes/${selectedClass.id}`, formData);
        toast.success('Class updated successfully');
      } else {
        const payload = {
          studentId: formData.studentId,
          course: formData.courseId,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          topic: formData.topic || 'Class',
          notes: formData.notes,
        };
        await axios.post('/api/ulma/classes', payload);
        toast.success('Class scheduled successfully');
      }

      setOpenDialog(false);
      setOpenDrawer(false);
      setSelectedClass(null);
      setSelectedEnrollment(null);
      setFormData({
        studentId: '',
        courseId: '',
        topic: '',
        date: '',
        startTime: '',
        endTime: '',
        notes: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to save class');
    }
  };

  const handleOpenDialog = (enrollmentSlot = null) => {
    if (enrollmentSlot) {
      setSelectedEnrollment(enrollmentSlot);
      setFormData({
        studentId: enrollmentSlot.studentId,
        courseId: enrollmentSlot.courseId,
        topic: '',
        date: enrollmentSlot.date,
        startTime: enrollmentSlot.startTime,
        endTime: enrollmentSlot.endTime,
        notes: '',
      });
    } else {
      setSelectedEnrollment(null);
      setFormData({
        studentId: '',
        courseId: '',
        topic: '',
        date: '',
        startTime: '',
        endTime: '',
        notes: '',
      });
    }
    
    if (isMobile) {
      setOpenDrawer(true);
    } else {
      setOpenDialog(true);
    }
  };

  const getEnrollmentsForDayAndTime = (date, timeSlot) => {
    const viewerTimezone = timezoneUtils.getUserTimezone(user);
    return enrollments.filter(enr => {
      if (!enr.schedule || !enr.schedule.days) return false;

      const jsDay = new Date(date).getDay();
      const dayStr = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][jsDay];
      if (!enr.schedule.days.includes(dayStr)) return false;

      const displayTimes = timezoneUtils.getScheduleDisplayTimes(enr.schedule, viewerTimezone);
      if (!displayTimes) return false;

      return displayTimes.startTime === timeSlot;
    });
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
    setCurrentWeek(newDate);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  // Mobile List View
  if (isMobile) {
    return (
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4, px: 1 }}>
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          {/* Header */}
          <Box mb={2}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Weekly Timetable
            </Typography>
            <Typography variant="body2" color="textSecondary">
              View and manage your class schedule
            </Typography>
          </Box>

          {/* Week Navigation */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <IconButton onClick={() => navigateWeek('prev')} size="small">
              <ChevronLeft />
            </IconButton>
            <Box textAlign="center">
              <Typography variant="subtitle2" fontWeight="bold">
                {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 5), 'MMM d, yyyy')}
              </Typography>
              <Button size="small" onClick={goToCurrentWeek} startIcon={<Today />}>
                Today
              </Button>
            </Box>
            <IconButton onClick={() => navigateWeek('next')} size="small">
              <ChevronRight />
            </IconButton>
          </Box>

          {/* Days List */}
          {weekDays.map((day, idx) => {
            const dayEnrollments = [];
            timeSlots.forEach(timeSlot => {
              const enrollmentsAtTime = getEnrollmentsForDayAndTime(day.date, timeSlot);
              if (enrollmentsAtTime.length > 0) {
                dayEnrollments.push({ timeSlot, enrollments: enrollmentsAtTime });
              }
            });

            return (
              <Card key={idx} sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
                <Box
                  sx={{
                    bgcolor: day.isToday ? alpha(theme.palette.primary.main, 0.1) : '#f5f5f5',
                    p: 1.5,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {day.day}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {day.displayDate}
                  </Typography>
                </Box>
                <CardContent sx={{ p: 1.5 }}>
                  {dayEnrollments.length === 0 ? (
                    <Typography variant="body2" color="textSecondary" textAlign="center" py={2}>
                      No classes scheduled
                    </Typography>
                  ) : (
                    dayEnrollments.map((item, i) => (
                      <Box key={i} mb={1}>
                        <Chip
                          icon={<AccessTime />}
                          label={item.timeSlot}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        {item.enrollments.map((enr) => (
                          <Paper
                            key={enr.id}
                            elevation={0}
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              borderRadius: 2,
                              p: 1.5,
                              mb: 1,
                              cursor: 'pointer',
                              '&:active': { bgcolor: alpha(theme.palette.primary.main, 0.15) },
                            }}
                            onClick={() => {
                              const displayTimes = timezoneUtils.getScheduleDisplayTimes(
                                enr.schedule,
                                timezoneUtils.getUserTimezone(user)
                              );
                              handleOpenDialog({
                                studentId: enr.studentId,
                                courseId: enr.courseId,
                                date: day.date,
                                startTime: displayTimes ? displayTimes.startTime : '09:00',
                                endTime: displayTimes ? displayTimes.endTime : '09:30',
                                studentName: enr.studentName,
                                courseName: enr.courseName,
                              });
                            }}
                          >
                            <Typography variant="body2" fontWeight="bold">
                              {enr.courseName}
                            </Typography>
                            <Typography variant="caption" display="block" color="textSecondary">
                              {enr.studentName}
                            </Typography>
                            <Typography variant="caption" color="primary">
                              {(() => {
                                const displayTimes = timezoneUtils.getScheduleDisplayTimes(
                                  enr.schedule,
                                  timezoneUtils.getUserTimezone(user)
                                );
                                return displayTimes
                                  ? `${displayTimes.startTime12} - ${displayTimes.endTime12}`
                                  : `${enr.schedule.startTime} - ${enr.schedule.endTime}`;
                              })()}
                            </Typography>
                          </Paper>
                        ))}
                      </Box>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}

          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            Tap on any class to schedule or view details
          </Alert>
        </Paper>

        {/* Mobile Drawer for Scheduling */}
        <SwipeableDrawer
          anchor="bottom"
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
          onOpen={() => {}}
          sx={{
            '& .MuiDrawer-paper': {
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: '90vh',
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Schedule Class
              </Typography>
              <IconButton onClick={() => setOpenDrawer(false)} size="small">
                <Close />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="Enter class topic"
              />
              
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={formData.date}
                InputLabelProps={{ shrink: true }}
                disabled
              />
              
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  label="Start Time"
                  type="time"
                  value={formData.startTime}
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
                <TextField
                  fullWidth
                  label="End Time"
                  type="time"
                  value={formData.endTime}
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
              </Box>
              
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any notes for this class"
              />
            </Stack>
            
            <Box display="flex" gap={1} mt={3}>
              <Button fullWidth variant="outlined" onClick={() => setOpenDrawer(false)}>
                Cancel
              </Button>
              <Button fullWidth variant="contained" onClick={handleSaveClass}>
                Schedule Class
              </Button>
            </Box>
          </Box>
        </SwipeableDrawer>

        {/* FAB Button */}
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => handleOpenDialog()}
        >
          <Add />
        </Fab>
      </Container>
    );
  }

  // Desktop/Tablet Grid View
  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: 4 }}>
      <Paper sx={{ p: { xs: 2, sm: 3, md: 3 }, borderRadius: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }} 
          mb={3}
          gap={2}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Weekly Timetable
            </Typography>
            <Typography color="textSecondary" variant="body2">
              View and manage your class schedule
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchData}
            size={isTablet ? "small" : "medium"}
          >
            Refresh
          </Button>
        </Box>

        {/* Week Navigation */}
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between" 
          alignItems="center" 
          mb={3}
          gap={2}
        >
          <Box display="flex" gap={1}>
            <Button 
              variant="outlined" 
              onClick={() => navigateWeek('prev')}
              startIcon={<ChevronLeft />}
              size={isTablet ? "small" : "medium"}
            >
              Previous
            </Button>
            <Button 
              variant="outlined" 
              onClick={goToCurrentWeek}
              startIcon={<Today />}
              size={isTablet ? "small" : "medium"}
            >
              Today
            </Button>
          </Box>
          <Typography variant="h6" fontWeight="medium">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 5), 'MMM d, yyyy')}
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => navigateWeek('next')}
            endIcon={<ChevronRight />}
            size={isTablet ? "small" : "medium"}
          >
            Next
          </Button>
        </Box>

        {/* Timetable Grid - Responsive */}
        <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `100px repeat(6, minmax(${isTablet ? '120px' : '150px'}, 1fr))`,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              overflow: 'hidden',
              minWidth: isTablet ? '700px' : '900px',
            }}
          >
            {/* Header Row */}
            <Box
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                borderRight: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                p: { xs: 1, sm: 2 },
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              <Schedule fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              <Typography variant="body2" component="span">Time</Typography>
            </Box>
            {weekDays.map((day, index) => (
              <Box
                key={index}
                sx={{
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  borderRight: index < 6 ? `1px solid ${theme.palette.divider}` : 'none',
                  bgcolor: day.isToday ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.primary.main, 0.02),
                  p: { xs: 1, sm: 2 },
                  textAlign: 'center',
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  {day.day.substring(0, isTablet ? 3 : undefined)}
                  {!isTablet && day.day}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {day.displayDate}
                </Typography>
              </Box>
            ))}

            {/* Time Slots */}
            {timeSlots.map((timeSlot, slotIndex) => (
              <React.Fragment key={slotIndex}>
                <Box
                  sx={{
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    borderRight: `1px solid ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.grey[500], 0.02),
                    p: 1,
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  {timeSlot}
                </Box>

                {weekDays.map((day, dayIndex) => {
                  const enrollmentsAtTime = getEnrollmentsForDayAndTime(day.date, timeSlot);
                  return (
                    <Box
                      key={`${slotIndex}-${dayIndex}`}
                      sx={{
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        borderRight: dayIndex < 6 ? `1px solid ${theme.palette.divider}` : 'none',
                        minHeight: { xs: '70px', sm: '80px', md: '100px' },
                        p: { xs: 0.5, sm: 1 },
                        bgcolor: '#fff',
                        position: 'relative',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.02),
                        },
                      }}
                    >
                      {enrollmentsAtTime.map((enr) => (
                        <Box
                          key={enr.id}
                          sx={{
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                            borderRadius: 2,
                            p: { xs: 0.5, sm: 1 },
                            mb: 0.5,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: theme.shadows[2],
                              bgcolor: alpha(theme.palette.primary.main, 0.15),
                            },
                          }}
                          onClick={() => {
                            const displayTimes = timezoneUtils.getScheduleDisplayTimes(
                              enr.schedule,
                              timezoneUtils.getUserTimezone(user)
                            );
                            handleOpenDialog({
                              studentId: enr.studentId,
                              courseId: enr.courseId,
                              date: day.date,
                              startTime: displayTimes ? displayTimes.startTime : '09:00',
                              endTime: displayTimes ? displayTimes.endTime : '09:30',
                              studentName: enr.studentName,
                              courseName: enr.courseName,
                            });
                          }}
                        >
                          <Typography 
                            variant="caption" 
                            fontWeight="bold" 
                            display="block"
                            sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' } }}
                          >
                            {enr.courseName}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            display="block" 
                            color="textSecondary"
                            sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.7rem' } }}
                          >
                            {enr.studentName}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="primary"
                            sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.7rem' } }}
                          >
                            {(() => {
                              const displayTimes = timezoneUtils.getScheduleDisplayTimes(
                                enr.schedule,
                                timezoneUtils.getUserTimezone(user)
                              );
                              return displayTimes
                                ? `${displayTimes.startTime12} - ${displayTimes.endTime12}`
                                : `${enr.schedule.startTime} - ${enr.schedule.endTime}`;
                            })()}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  );
                })}
              </React.Fragment>
            ))}
          </Box>
        </Box>

        <Alert 
          severity="info" 
          sx={{ mt: 2, borderRadius: 2 }}
          icon={<Schedule />}
        >
          Click on any blue box to schedule or view class details. Time slots are based on your working hours ({workingHours.startTime} - {workingHours.endTime}).
        </Alert>
      </Paper>

      {/* Desktop Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Book color="primary" />
            <Typography variant="h6">Schedule Class from Student Enrollment</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled>
                <InputLabel>Student</InputLabel>
                <Select value={formData.studentId} label="Student">
                  {students.find(s => s._id === formData.studentId) && (
                    <MenuItem value={formData.studentId}>
                      {students.find(s => s._id === formData.studentId)?.user?.name}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled>
                <InputLabel>Course</InputLabel>
                <Select value={formData.courseId} label="Course">
                  {courses.find(c => c._id === formData.courseId) && (
                    <MenuItem value={formData.courseId}>
                      {courses.find(c => c._id === formData.courseId)?.name}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="Enter class topic"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                disabled
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={formData.startTime}
                InputLabelProps={{ shrink: true }}
                disabled
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={formData.endTime}
                InputLabelProps={{ shrink: true }}
                disabled
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any notes for this class"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveClass} variant="contained" startIcon={<Add />}>
            Schedule Class
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Timetable;