// src/pages/student/course.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Rating,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  IconButton,
  LinearProgress,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Badge,
  Tooltip,
  Zoom,
  Fade,
  useTheme,
  useMediaQuery,
  InputAdornment,
  alpha,
  Collapse,
} from '@mui/material';
import {
  Search,
  FilterList,
  LocationOn,
  Language,
  Schedule,
  Groups,
  Videocam,
  Book,
  Mosque,
  AccessTime,
  CalendarToday,
  CheckCircle,
  EventBusy,
  School,
  MenuBook,
  AutoStories,
  Psychology,
  Timer,
  MonetizationOn,
  Person,
  Favorite,
  FavoriteBorder,
  Bookmark,
  BookmarkBorder,
  Visibility,
  ArrowForward,
  ArrowBack,
  DoneAll,
  Info,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import timezoneUtils from '../../utils/timezoneUtils';

const Courses = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [courses, setCourses] = useState([]);
  const [ulmaList, setUlmaList] = useState([]);
  const [filteredUlma, setFilteredUlma] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    course: '',
    language: '',
    timezone: '',
    rating: 0,
  });
  const [selectedUlma, setSelectedUlma] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [enrollmentDialog, setEnrollmentDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState({
    startTime: '',
    endTime: '',
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [enrollmentStep, setEnrollmentStep] = useState(0);
  const [courseDetailsDialog, setCourseDetailsDialog] = useState(false);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);
  const [filtersExpanded, setFiltersExpanded] = useState(!isMobile);
  const [favorites, setFavorites] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const selectedCourseData = courses.find(c => c._id === selectedCourse);

  // Destructure timezone utilities
  const {
    getUserTimezone,
    convertTimeBetweenTimezones,
    formatTime12,
    generateTimeSlots,
    createScheduleWithTimezone,
  } = timezoneUtils;

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Days configuration
  const daysOfWeek = [
    { id: 'mon', label: 'Monday', short: 'Mon' },
    { id: 'tue', label: 'Tuesday', short: 'Tue' },
    { id: 'wed', label: 'Wednesday', short: 'Wed' },
    { id: 'thu', label: 'Thursday', short: 'Thu' },
    { id: 'fri', label: 'Friday', short: 'Fri' },
    { id: 'sat', label: 'Saturday', short: 'Sat' },
  ];

  // Get selected ulma times for display
  const getSelectedUlmaStudentTimes = (sel = selectedUlma) => {
    if (!sel) return { startStudent: '', endStudent: '', teacherStart: '', teacherEnd: '', ulmaTZ: '', studentTZ: '' };
    const studentTZ = getUserTimezone(user);
    const ulmaTZ = sel.timezone || sel.user?.timezone || 'UTC';
    const teacherStart = sel.workingHours?.startTime || '09:00';
    const teacherEnd = sel.workingHours?.endTime || '21:00';
    const startStudent = convertTimeBetweenTimezones(teacherStart, ulmaTZ, studentTZ);
    const endStudent = convertTimeBetweenTimezones(teacherEnd, ulmaTZ, studentTZ);
    return { startStudent, endStudent, teacherStart, teacherEnd, ulmaTZ, studentTZ };
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterUlma();
  }, [filters, searchTerm, ulmaList]);

  const fetchData = async () => {
    try {
      const [coursesRes, ulmaRes] = await Promise.all([
        axios.get('/api/students/courses'),
        axios.get('/api/students/ulma/available'),
      ]);

      const availableCourses = coursesRes.data.courses || coursesRes.data;
      setCourses(Array.isArray(availableCourses) ? availableCourses : []);

      const availableUlma = ulmaRes.data.ulma || ulmaRes.data;
      setUlmaList(Array.isArray(availableUlma) ? availableUlma : []);
      setFilteredUlma(Array.isArray(availableUlma) ? availableUlma : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filterUlma = () => {
    let filtered = [...ulmaList];

    if (searchTerm) {
      filtered = filtered.filter(ulma =>
        ulma.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ulma.expertise?.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filters.course) {
      filtered = filtered.filter(ulma =>
        ulma.expertise?.includes(filters.course)
      );
    }

    if (filters.language) {
      filtered = filtered.filter(ulma =>
        ulma.user.languages?.includes(filters.language)
      );
    }

    if (filters.timezone) {
      filtered = filtered.filter(ulma =>
        ulma.timezone === filters.timezone
      );
    }

    if (filters.rating > 0) {
      filtered = filtered.filter(ulma =>
        ulma.rating?.average >= filters.rating
      );
    }

    setFilteredUlma(filtered);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUlmaSelect = async (ulma) => {
    setSelectedUlma(ulma);
    setSelectedDays([]);
    setSelectedTimeSlot({ startTime: '', endTime: '' });

    const workingHours = ulma.workingHours || { startTime: '09:00', endTime: '21:00' };
    const studentTZ = getUserTimezone(user);
    const ulmaTZ = ulma.timezone || ulma.user?.timezone || 'UTC';
    const timeSlots = generateTimeSlots(workingHours.startTime, workingHours.endTime, 30, ulmaTZ, studentTZ);
    setAvailableSlots(timeSlots);

    setDialogOpen(true);
  };

  const handleCourseDetails = (course) => {
    setSelectedCourseDetails(course);
    setCourseDetailsDialog(true);
  };

  const handleDayToggle = (day) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const handleEnrollment = async () => {
    if (!selectedTimeSlot?.startTime || !selectedTimeSlot?.endTime) {
      toast.error('Time slot missing');
      return;
    }

    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    if (selectedDays.length === 0) {
      toast.error('Please select at least one day');
      return;
    }

    try {
      const selectedCourseData = courses.find(c =>
        c.name === selectedCourse || c._id === selectedCourse
      );

      const startParts = selectedTimeSlot.startTime.split(':');
      const endParts = selectedTimeSlot.endTime.split(':');
      const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
      const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
      const durationMinutes = endMinutes - startMinutes;

      const studentTZ = getUserTimezone(user);
      const ulmaTZ = selectedUlma?.timezone || selectedUlma?.user?.timezone || 'UTC';

      // Create schedule with proper timezone handling
      const schedule = createScheduleWithTimezone({
        days: selectedDays,
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
        studentTimezone: studentTZ,
        teacherTimezone: ulmaTZ,
        durationMinutes: durationMinutes
      });

      const enrollmentData = {
        ulmaId: selectedUlma._id,
        course: selectedCourse,
        schedule: schedule,
        monthlyFee: selectedCourseData?.monthlyFee || 50,
      };

      console.log('Enrollment Data being sent:', enrollmentData);

      const response = await axios.post('/api/students/enroll', enrollmentData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      toast.success('Enrollment request sent successfully!');
      setEnrollmentDialog(false);
      setDialogOpen(false);
      setSelectedDays([]);
      setSelectedTimeSlot({ startTime: '', endTime: '' });
      navigate('/student/dashboard');
    } catch (error) {
      console.error('Enrollment error details:', error);

      if (error.response) {
        toast.error(error.response.data.message || 'Enrollment failed');
      } else if (error.request) {
        toast.error('No response from server. Please check your connection.');
      } else {
        toast.error('Enrollment failed: ' + error.message);
      }
    }
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const toggleBookmark = (id) => {
    setBookmarks(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const CourseCard = ({ course }) => (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
          },
        }}
      >
        <Box
          sx={{
            height: 140,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              display: 'flex',
              gap: 1,
            }}
          >
            <Tooltip title="Add to favorites">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(course._id);
                }}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.9)',
                  '&:hover': { bgcolor: 'white' },
                }}
              >
                {favorites.includes(course._id) ? (
                  <Favorite color="error" />
                ) : (
                  <FavoriteBorder />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Bookmark course">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(course._id);
                }}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.9)',
                  '&:hover': { bgcolor: 'white' },
                }}
              >
                {bookmarks.includes(course._id) ? (
                  <Bookmark color="primary" />
                ) : (
                  <BookmarkBorder />
                )}
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Avatar
              sx={{
                bgcolor: 'white',
                color: theme.palette.primary.main,
                width: 48,
                height: 48,
              }}
            >
              <AutoStories />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                {course.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {course.duration || 3} months course
              </Typography>
            </Box>
          </Box>
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              {course.description || 'Comprehensive Quran learning course designed for all levels.'}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MenuBook fontSize="small" color="primary" />
              Key Topics:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {course.curriculum?.slice(0, 3).map((item, idx) => {
                let displayText = '';
                if (typeof item === 'object' && item !== null) {
                  if (item.topic) displayText = item.week ? `Week ${item.week}: ${item.topic}` : item.topic;
                  else if (item.description) displayText = item.week ? `Week ${item.week}: ${item.description}` : item.description;
                  else if (item.week) displayText = `Week ${item.week}`;
                  else if (item.title) displayText = item.title;
                } else if (typeof item === 'string') displayText = item;
                return (
                  <Chip
                    key={idx}
                    label={displayText || 'Course topic'}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 1.5 }}
                  />
                );
              })}
              {(!course.curriculum || course.curriculum.length === 0) && (
                <>
                  <Chip label="Quran Reading" size="small" variant="outlined" sx={{ borderRadius: 1.5 }} />
                  <Chip label="Tajweed Rules" size="small" variant="outlined" sx={{ borderRadius: 1.5 }} />
                  <Chip label="Memorization" size="small" variant="outlined" sx={{ borderRadius: 1.5 }} />
                </>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Timer fontSize="small" color="action" />
              <Typography variant="caption">30 min sessions</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <School fontSize="small" color="action" />
              <Typography variant="caption">All levels</Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Monthly Fee
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <MonetizationOn fontSize="small" color="primary" />
                <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                  ${course.monthlyFee || 50}
                </Typography>
                <Typography variant="caption" color="text.secondary">/month</Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              endIcon={<ArrowForward />}
              onClick={() => handleCourseDetails(course)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
              }}
            >
              Details
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const UlmaCard = ({ ulma }) => {
    const studentTZ = getUserTimezone(user);
    const ulmaTZ = ulma.timezone || ulma.user?.timezone || 'UTC';
    const teacherStart = ulma.workingHours?.startTime || '09:00';
    const teacherEnd = ulma.workingHours?.endTime || '21:00';
    const startStudent = convertTimeBetweenTimezones(teacherStart, ulmaTZ, studentTZ);
    const endStudent = convertTimeBetweenTimezones(teacherEnd, ulmaTZ, studentTZ);

    return (
      <motion.div
        variants={fadeInUp}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            borderRadius: 3,
            boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
            },
          }}
        >
          <Box
            sx={{
              position: 'relative',
              p: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Tooltip title="Online">
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        bgcolor: 'success.main',
                        borderRadius: '50%',
                        border: '2px solid white',
                      }}
                    />
                  </Tooltip>
                }
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    border: '3px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  src={ulma.user?.profileImage}
                >
                  {ulma.user?.name?.charAt(0) || 'U'}
                </Avatar>
              </Badge>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {ulma.user?.name || 'Ulma'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <LocationOn fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
                      <Typography variant="body2" color="text.secondary">
                        {ulma.user?.country || 'Not specified'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Rating value={ulma.rating?.average || 0} readOnly size="small" />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      ({ulma.rating?.totalReviews || 0} reviews)
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Psychology fontSize="small" color="primary" />
                Expertise:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {ulma.expertise?.map((exp, idx) => (
                  <Chip
                    key={idx}
                    label={exp}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ borderRadius: 1.5 }}
                  />
                )) || (
                  <Typography variant="body2" color="text.secondary">
                    No expertise listed
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          <CardContent sx={{ p: 3 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime fontSize="small" color="primary" />
                Working Hours (Your Local Time)
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule fontSize="small" color="action" />
                  <Typography variant="body2">
                    {formatTime12(startStudent)} - {formatTime12(endStudent)}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Teacher: {formatTime12(teacherStart)} - {formatTime12(teacherEnd)} ({ulmaTZ})
                </Typography>
              </Paper>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Groups fontSize="small" color="action" />
                <Typography variant="body2">
                  {ulma.experience || 0}+ years exp.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Language fontSize="small" color="action" />
                <Typography variant="body2">
                  {ulma.user?.languages?.join(', ') || 'English'}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleUlmaSelect(ulma)}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  py: 1,
                }}
              >
                Select Teacher
              </Button>
              <Tooltip title="View Profile">
                <IconButton
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                  }}
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderEnrollmentStep = () => {
    switch (enrollmentStep) {
      case 0:
        return (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Select Course
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Choose the course you want to study with {selectedUlma?.user?.name}
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Choose a Course</InputLabel>
              <Select
                value={selectedCourse}
                label="Choose a Course"
                onChange={(e) => setSelectedCourse(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Select a course</MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course._id} value={course._id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span>{course.name}</span>
                      <Chip
                        label={`$${course.monthlyFee || 50}/mo`}
                        size="small"
                        color="primary"
                        sx={{ ml: 2 }}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedCourse && selectedCourseData && (
              <Fade in={true}>
                <Box
                  sx={{
                    mt: 3,
                    p: 2.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}
                >
                  <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                    Course Details:
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedCourseData.description || 'No description available.'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Chip
                      icon={<Timer />}
                      label={`${selectedCourseData.duration || 3} months`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      icon={<MonetizationOn />}
                      label={`$${selectedCourseData.monthlyFee || 50}/month`}
                      size="small"
                      color="primary"
                    />
                  </Box>
                </Box>
              </Fade>
            )}
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Select Schedule
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Choose your preferred days and time for weekly classes
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Select Days
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                You can select multiple days (Sunday is holiday)
              </Typography>
              
              <Grid container spacing={1} sx={{ mt: 1 }}>
                {daysOfWeek.map((day) => (
                  <Grid item xs={6} sm={4} key={day.id}>
                    <Paper
                      variant="outlined"
                      onClick={() => handleDayToggle(day.id)}
                      sx={{
                        p: 1.5,
                        textAlign: 'center',
                        cursor: 'pointer',
                        borderRadius: 2,
                        bgcolor: selectedDays.includes(day.id) 
                          ? alpha(theme.palette.primary.main, 0.1)
                          : 'transparent',
                        borderColor: selectedDays.includes(day.id)
                          ? theme.palette.primary.main
                          : theme.palette.divider,
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                        },
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: selectedDays.includes(day.id) ? 600 : 400 }}>
                        {day.short}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {selectedDays.length > 0 && (
              <Fade in={true}>
                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Select Time Slot
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    30-minute intervals based on teacher's availability
                  </Typography>

                  <Box
                    sx={{
                      maxHeight: 300,
                      overflowY: 'auto',
                      pr: 1,
                      mt: 2,
                    }}
                  >
                    <Grid container spacing={1}>
                      {availableSlots.map((slot, index) => {
                        const isSelected = selectedTimeSlot.startTime === slot.studentStartTime &&
                          selectedTimeSlot.endTime === slot.studentEndTime;

                        return (
                          <Grid item xs={6} key={index}>
                            <Tooltip title={`Teacher time: ${slot.teacherLabel}`} arrow>
                              <Button
                                fullWidth
                                variant={isSelected ? "contained" : "outlined"}
                                onClick={() => {
                                  setSelectedTimeSlot({
                                    startTime: slot.studentStartTime,
                                    endTime: slot.studentEndTime,
                                    
                                  });
                                }}
                                sx={{
                                  borderRadius: 2,
                                  py: 1,
                                  textTransform: 'none',
                                  position: 'relative',
                                  ...(isSelected && {
                                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                                  }),
                                }}
                              >
                                {slot.label}
                                {isSelected && (
                                  <CheckCircle
                                    sx={{
                                      position: 'absolute',
                                      top: -4,
                                      right: -4,
                                      fontSize: 16,
                                      color: 'success.main',
                                      bgcolor: 'white',
                                      borderRadius: '50%',
                                    }}
                                  />
                                )}
                              </Button>
                            </Tooltip>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                </Box>
              </Fade>
            )}

            {selectedTimeSlot.startTime && selectedTimeSlot.endTime && (
              <Fade in={true}>
                <Alert
                  severity="success"
                  icon={<CheckCircle fontSize="inherit" />}
                  sx={{ mt: 3, borderRadius: 2 }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Schedule:
                  </Typography>
                  <Typography variant="body2">
                    Days: {selectedDays.map(dayId => {
                      const day = daysOfWeek.find(d => d.id === dayId);
                      return day?.label;
                    }).join(', ')}
                  </Typography>
                  <Typography variant="body2">
                    Time (your timezone): {formatTime12(selectedTimeSlot.startTime)} - {formatTime12(selectedTimeSlot.endTime)}
                  </Typography>
                  {selectedTimeSlot.teacherStartTime && selectedTimeSlot.teacherEndTime && (
                    <Typography variant="body2">
                      Teacher time: {formatTime12(selectedTimeSlot.teacherStartTime)} - {formatTime12(selectedTimeSlot.teacherEndTime)}
                    </Typography>
                  )}
                </Alert>
              </Fade>
            )}
          </motion.div>
        );

      case 2:
        const durationMinutes = selectedTimeSlot.startTime && selectedTimeSlot.endTime
          ? (parseInt(selectedTimeSlot.endTime.split(':')[0]) * 60 + parseInt(selectedTimeSlot.endTime.split(':')[1])) -
            (parseInt(selectedTimeSlot.startTime.split(':')[0]) * 60 + parseInt(selectedTimeSlot.startTime.split(':')[1]))
          : 0;

        const monthlyFee = courses.find(c => c._id === selectedCourse)?.monthlyFee || 50;

        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'success.main' }}>
              <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
              Confirm Enrollment
            </Typography>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                mt: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Enrollment Summary
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Teacher
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedUlma?.user?.name}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Course
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedCourseData?.name}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Monthly Fee
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <MonetizationOn color="primary" fontSize="small" />
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                      ${monthlyFee}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday fontSize="small" color="primary" />
                      Schedule Details
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Days:</strong> {selectedDays.map(dayId => {
                          const day = daysOfWeek.find(d => d.id === dayId);
                          return day?.label;
                        }).join(', ')}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Time:</strong> {formatTime12(selectedTimeSlot.startTime)} - {formatTime12(selectedTimeSlot.endTime)}
                      </Typography>
                    
                      <Typography variant="body2" gutterBottom>
                        <strong>Duration:</strong> {durationMinutes} minutes per class
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Your Timezone: {getUserTimezone(user)}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Alert
                    severity="info"
                    icon={<Info />}
                    sx={{ borderRadius: 2 }}
                  >
                    <Typography variant="body2">
                      Your enrollment request will be reviewed by admin. You'll be notified once approved.
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '30%',
              height: '100%',
              background: `radial-gradient(circle at top right, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
                  Quran Courses
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                  Learn Quran with qualified teachers at your own pace
                </Typography>
              </Box>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: { xs: 60, md: 80 },
                  height: { xs: 60, md: 80 },
                }}
              >
                <Mosque sx={{ fontSize: { xs: 30, md: 40 } }} />
              </Avatar>
            </Box>
          </Box>
        </Paper>
      </motion.div>

      {/* Tabs */}
      <Paper sx={{ mb: 4, borderRadius: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant={isMobile ? "fullWidth" : "standard"}
          centered={!isMobile}
          sx={{
            '& .MuiTab-root': {
              py: 2,
              fontSize: { xs: '0.875rem', md: '1rem' },
            },
          }}
        >
          <Tab icon={<Book />} label="Courses" iconPosition="start" />
          <Tab icon={<Groups />} label="Available Teachers" iconPosition="start" />
        </Tabs>
      </Paper>

      <AnimatePresence mode="wait">
        {activeTab === 0 ? (
          <motion.div
            key="courses"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Available Courses
                  <Chip
                    label={courses.length}
                    size="small"
                    color="primary"
                    sx={{ ml: 2 }}
                  />
                </Typography>
              </Box>

              {loading ? (
                <Box sx={{ width: '100%', py: 4 }}>
                  <LinearProgress sx={{ borderRadius: 2 }} />
                </Box>
              ) : courses.length === 0 ? (
                <Paper
                  sx={{
                    p: 6,
                    textAlign: 'center',
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  }}
                >
                  <AutoStories sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Courses Available
                  </Typography>
                  <Typography color="text.secondary">
                    Please check back later for new courses
                  </Typography>
                </Paper>
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  <Grid container spacing={3}>
                    {courses.map((course) => (
                      <Grid item key={course._id || course.name} xs={12} sm={6} lg={4}>
                        <CourseCard course={course} />
                      </Grid>
                    ))}
                  </Grid>
                </motion.div>
              )}
            </Box>
          </motion.div>
        ) : (
          <motion.div
            key="teachers"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Filters Section */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: filtersExpanded ? 3 : 0,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Filter Teachers
                </Typography>
                <Button
                  onClick={() => setFiltersExpanded(!filtersExpanded)}
                  sx={{ textTransform: 'none' }}
                >
                  {filtersExpanded ? 'Hide Filters' : 'Show Filters'}
                </Button>
              </Box>

              <Collapse in={filtersExpanded}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      placeholder="Search by name or expertise..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        ),
                      }}
                      size="small"
                      sx={{ borderRadius: 2 }}
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Course</InputLabel>
                      <Select
                        value={filters.course}
                        label="Course"
                        onChange={(e) => handleFilterChange('course', e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="">All Courses</MenuItem>
                        {Array.from(new Set(ulmaList.flatMap(ulma => ulma.expertise || []))).map((course, idx) => (
                          <MenuItem key={idx} value={course}>
                            {course}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={filters.language}
                        label="Language"
                        onChange={(e) => handleFilterChange('language', e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="">All Languages</MenuItem>
                        {Array.from(new Set(ulmaList.flatMap(ulma => ulma.user.languages || []))).map((lang, idx) => (
                          <MenuItem key={idx} value={lang}>
                            {lang}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Timezone</InputLabel>
                      <Select
                        value={filters.timezone}
                        label="Timezone"
                        onChange={(e) => handleFilterChange('timezone', e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="">All Timezones</MenuItem>
                        {Array.from(new Set(ulmaList.map(ulma => ulma.timezone || 'Asia/Dubai'))).map((tz, idx) => (
                          <MenuItem key={idx} value={tz}>
                            {tz}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Min Rating</InputLabel>
                      <Select
                        value={filters.rating}
                        label="Min Rating"
                        onChange={(e) => handleFilterChange('rating', e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value={0}>Any Rating</MenuItem>
                        <MenuItem value={3}>3+ Stars</MenuItem>
                        <MenuItem value={4}>4+ Stars</MenuItem>
                        <MenuItem value={4.5}>4.5+ Stars</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => {
                        setFilters({
                          course: '',
                          language: '',
                          timezone: '',
                          rating: 0,
                        });
                        setSearchTerm('');
                      }}
                      sx={{ height: '100%', borderRadius: 2 }}
                    >
                      Clear
                    </Button>
                  </Grid>
                </Grid>
              </Collapse>
            </Paper>

            {/* Results Count */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Available Teachers
                <Chip
                  label={filteredUlma.length}
                  size="small"
                  color="primary"
                  sx={{ ml: 2 }}
                />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filteredUlma.length} teachers found
              </Typography>
            </Box>

            {/* Teachers Grid */}
            {loading ? (
              <Box sx={{ width: '100%', py: 4 }}>
                <LinearProgress sx={{ borderRadius: 2 }} />
              </Box>
            ) : filteredUlma.length === 0 ? (
              <Paper
                sx={{
                  p: 6,
                  textAlign: 'center',
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <Groups sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Teachers Found
                </Typography>
                <Typography color="text.secondary">
                  Try adjusting your filters to see more results
                </Typography>
              </Paper>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <Grid container spacing={3}>
                  {filteredUlma.map((ulma) => (
                    <Grid item key={ulma._id} xs={12} sm={6} lg={4}>
                      <UlmaCard ulma={ulma} />
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Course Details Dialog */}
      <Dialog
        open={courseDetailsDialog}
        onClose={() => setCourseDetailsDialog(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          pb: 2,
        }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 56,
                height: 56,
              }}
            >
              <AutoStories />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {selectedCourseDetails?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedCourseDetails?.duration || 3} months • ${selectedCourseDetails?.monthlyFee || 50}/month
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedCourseDetails && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  About This Course
                </Typography>
                <Typography paragraph sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  {selectedCourseDetails.description || 'Comprehensive Quran learning course designed for all levels. Perfect for beginners and advanced students.'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    height: '100%',
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Info color="primary" fontSize="small" />
                    Course Details
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Timer color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Duration</Typography>
                        <Typography variant="body1">{selectedCourseDetails.duration || 3} months</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <School color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Level</Typography>
                        <Typography variant="body1">{selectedCourseDetails.level || 'Beginner to Advanced'}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Videocam color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Format</Typography>
                        <Typography variant="body1">Live Online Classes</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    height: '100%',
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" fontSize="small" />
                    What You'll Learn
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle color="success" sx={{ fontSize: 18 }} />
                      <Typography variant="body2">Quran Reading & Pronunciation</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle color="success" sx={{ fontSize: 18 }} />
                      <Typography variant="body2">Tajweed Rules & Application</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle color="success" sx={{ fontSize: 18 }} />
                      <Typography variant="body2">Memorization Techniques</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle color="success" sx={{ fontSize: 18 }} />
                      <Typography variant="body2">Tafsir & Understanding</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Alert
                  severity="info"
                  icon={<Info />}
                  sx={{ borderRadius: 3 }}
                >
                  To enroll in this course, please select an available teacher from the "Available Teachers" tab.
                </Alert>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
          <Button
            onClick={() => setCourseDetailsDialog(false)}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setCourseDetailsDialog(false);
              setActiveTab(1);
            }}
            endIcon={<ArrowForward />}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Find Teachers
          </Button>
        </DialogActions>
      </Dialog>

      {/* Teacher Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          pb: 2,
        }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    bgcolor: 'success.main',
                    borderRadius: '50%',
                    border: '2px solid white',
                  }}
                />
              }
            >
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  border: '3px solid white',
                }}
                src={selectedUlma?.user?.profileImage}
              >
                {selectedUlma?.user?.name?.charAt(0)}
              </Avatar>
            </Badge>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {selectedUlma?.user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedUlma?.expertise?.join(' • ')}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedUlma && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    height: '100%',
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person color="primary" fontSize="small" />
                    About
                  </Typography>
                  <Typography paragraph sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                    {selectedUlma.bio || 'Experienced Quran teacher with passion for teaching. Specializes in Tajweed and memorization techniques for students of all ages.'}
                  </Typography>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Experience
                    </Typography>
                    <Typography variant="h6">
                      {selectedUlma.experience || 5}+ years
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Languages
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {selectedUlma.user?.languages?.map((lang, idx) => (
                        <Chip key={idx} label={lang} size="small" variant="outlined" />
                      )) || <Chip label="English" size="small" variant="outlined" />}
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    height: '100%',
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime color="primary" fontSize="small" />
                    Availability
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Working Hours (Your Local Time)
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Schedule color="primary" />
                        <Typography variant="h6">
                          {(() => {
                            const t = getSelectedUlmaStudentTimes(selectedUlma);
                            return `${formatTime12(t.startStudent)} - ${formatTime12(t.endStudent)}`;
                          })()}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Teacher's time: {(() => {
                          const t = getSelectedUlmaStudentTimes(selectedUlma);
                          return `${formatTime12(t.teacherStart)} - ${formatTime12(t.teacherEnd)} (${t.ulmaTZ})`;
                        })()}
                      </Typography>
                    </Paper>
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Rating
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Rating value={selectedUlma.rating?.average || 0} readOnly size="large" />
                      <Typography variant="body1">
                        {selectedUlma.rating?.average || 0} ({selectedUlma.rating?.totalReviews || 0} reviews)
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.info.main, 0.02),
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Info color="info" fontSize="small" />
                    Important Notes
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle color="success" sx={{ fontSize: 18 }} />
                      Classes are 30 minutes duration
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle color="success" sx={{ fontSize: 18 }} />
                      You can select multiple days per week
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EventBusy color="warning" sx={{ fontSize: 18 }} />
                      Sunday is weekly holiday
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle color="success" sx={{ fontSize: 18 }} />
                      Time slots based on teacher's availability
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setDialogOpen(false);
              setEnrollmentDialog(true);
              setEnrollmentStep(0);
            }}
            endIcon={<ArrowForward />}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Enroll Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enrollment Dialog */}
      <Dialog
        open={enrollmentDialog}
        onClose={() => {
          setEnrollmentDialog(false);
          setEnrollmentStep(0);
          setSelectedCourse('');
          setSelectedDays([]);
          setSelectedTimeSlot({ startTime: '', endTime: '' });
        }}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          pb: 3,
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Enrollment Process
          </Typography>
          <Stepper
            activeStep={enrollmentStep}
            alternativeLabel
            sx={{
              '& .MuiStepLabel-root .Mui-completed': {
                color: 'success.main',
              },
              '& .MuiStepLabel-root .Mui-active': {
                color: 'primary.main',
              },
            }}
          >
            <Step>
              <StepLabel>Select Course</StepLabel>
            </Step>
            <Step>
              <StepLabel>Choose Schedule</StepLabel>
            </Step>
            <Step>
              <StepLabel>Confirm</StepLabel>
            </Step>
          </Stepper>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3, minHeight: 400 }}>
          <AnimatePresence mode="wait">
            {renderEnrollmentStep()}
          </AnimatePresence>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
          {enrollmentStep > 0 && (
            <Button
              onClick={() => setEnrollmentStep(enrollmentStep - 1)}
              startIcon={<ArrowBack />}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Back
            </Button>
          )}
          <Button
            onClick={() => {
              if (enrollmentStep < 2) {
                setEnrollmentStep(enrollmentStep + 1);
              } else {
                handleEnrollment();
              }
            }}
            variant="contained"
            disabled={
              (enrollmentStep === 0 && !selectedCourse) ||
              (enrollmentStep === 1 &&
                (selectedDays.length === 0 ||
                 !selectedTimeSlot.startTime ||
                 !selectedTimeSlot.endTime))
            }
            endIcon={enrollmentStep === 2 ? <DoneAll /> : <ArrowForward />}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            {enrollmentStep === 2 ? 'Submit Enrollment' : 'Next'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Courses;