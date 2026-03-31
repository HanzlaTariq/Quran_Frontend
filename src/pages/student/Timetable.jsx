import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Button,
  IconButton,
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  Person,
  Book,
  VideoCall,
  Today,
  DateRange,
  Refresh,
} from '@mui/icons-material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays, isSameDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { connectSocket } from '../../socket/socket';
import { useAuth } from '../../context/AuthContext';
import timezoneUtils from '../../utils/timezoneUtils';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    'en-US': enUS,
  },
});

const StudentTimetable = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'calendar', 'list', or 'grid'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [workingHours, setWorkingHours] = useState({ startTime: '08:00', endTime: '20:00' });
  const { user } = useAuth();

  // Days of the week (Monday to Saturday, exclude Sunday)
  const weekDays = useMemo(() => {
    const days = [];
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Start from Monday
    for (let i = 0; i < 6; i++) { // 6 days instead of 7 (exclude Sunday)
      const date = addDays(weekStart, i);
      days.push({
        day: format(date, 'EEEE'),
        date: format(date, 'yyyy-MM-dd'),
        displayDate: format(date, 'MMM d'),
        fullDate: date,
      });
    }
    return days;
  }, [currentWeek]);

  // Get all unique time slots that have classes for the current week
  const uniqueTimeSlots = useMemo(() => {
    const timeSlotsSet = new Set();

    weekDays.forEach(day => {
      const dayClasses = classes.filter(cls =>
        format(cls.start, 'yyyy-MM-dd') === day.date
      );

      dayClasses.forEach(cls => {
        // Convert UTC time to student's local timezone
        const userTimezone = timezoneUtils.getUserTimezone(user);
        const localTime = cls.start.toLocaleTimeString('en-US', {
          timeZone: userTimezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        timeSlotsSet.add(localTime);
      });
    });

    // Sort time slots
    return Array.from(timeSlotsSet).sort();
  }, [classes, weekDays, user]);

  useEffect(() => {
    fetchTimetable();
    
    // Refresh timetable every 30 seconds
    const interval = setInterval(fetchTimetable, 30000);
    
    return () => clearInterval(interval);
  }, [currentWeek]);

  useEffect(() => {
    if (!user?._id) return;

    const socket = connectSocket({
      userId: user._id,
      role: 'student'
    });

    socket?.on('class-started', (data) => {
      setClasses(prev => prev.map(cls => 
        cls.id === data.classId || cls._id === data.classId
          ? { ...cls, status: 'ongoing', meetingLink: data.meetingLink, resource: { ...cls.resource, status: 'ongoing', meetingLink: data.meetingLink } }
          : cls
      ));
      toast.success('Your class has started! Click to join.');
    });

    return () => {
      socket?.off('class-started');
    };
  }, [user]);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      let classes = [];

      // Fetch profile for working hours
      try {
        const profileRes = await axios.get('/api/students/profile');
        if (profileRes.data?.workingHours) {
          setWorkingHours(profileRes.data.workingHours);
        }
      } catch (error) {
        // Use default working hours
      }

      // Only use approved or active enrollments (teacher-created classes excluded)
      const enrollResponse = await axios.get('/api/students/enroll/my-enrollments');
      if (enrollResponse.data?.success && enrollResponse.data.enrollments.length > 0) {
        const activeEnrollments = enrollResponse.data.enrollments.filter(e => ['approved', 'active'].includes(e.status));
        classes = generateClassesFromEnrollments(activeEnrollments);
      }

      setClasses(classes);
    } catch (error) {
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const normalizeDay = (dayName) => {
    if (!dayName) return '';
    const key = String(dayName).toLowerCase();
    if (key.startsWith('mon')) return 'mon';
    if (key.startsWith('tue')) return 'tue';
    if (key.startsWith('wed')) return 'wed';
    if (key.startsWith('thu')) return 'thu';
    if (key.startsWith('fri')) return 'fri';
    if (key.startsWith('sat')) return 'sat';
    if (key.startsWith('sun')) return 'sun';
    return '';
  };

  const generateClassesFromEnrollments = (enrollments) => {
    const futureClasses = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    weekDays.forEach(day => {
      const classDate = new Date(day.date);
      if (classDate < today) return;

      const dayName = classDate.toLocaleDateString('en-US', { weekday: 'long' });
      const dayStr = {
        sunday: 'sun',
        monday: 'mon',
        tuesday: 'tue',
        wednesday: 'wed',
        thursday: 'thu',
        friday: 'fri',
        saturday: 'sat'
      }[dayName.toLowerCase()] || '';

      enrollments.forEach(enrollment => {
        const { schedule, course, ulma } = enrollment;
        if (!schedule || !schedule.days) return;

        const normalizedScheduleDays = (Array.isArray(schedule.days) ? schedule.days : []).map(normalizeDay).filter(Boolean);
        if (!normalizedScheduleDays.includes(dayStr)) return;

        const viewerTimezone = timezoneUtils.getUserTimezone(user);
        const displayTimes = timezoneUtils.getScheduleDisplayTimes(schedule, viewerTimezone);
        if (!displayTimes) return;

        let courseName = 'Course';
        if (course) {
          if (typeof course === 'object' && course.name) {
            courseName = course.name;
          } else if (typeof course === 'string') {
            courseName = course;
          }
        }

        let utcStartDate;
        let utcEndDate;

        if (schedule.utcStart && schedule.utcEnd) {
          let utcStartValue = schedule.utcStart;
          let utcEndValue = schedule.utcEnd;

          if (typeof utcStartValue === 'object' && utcStartValue.$date) utcStartValue = utcStartValue.$date;
          if (typeof utcEndValue === 'object' && utcEndValue.$date) utcEndValue = utcEndValue.$date;

          utcStartDate = new Date(utcStartValue);
          utcEndDate = new Date(utcEndValue);

          utcStartDate.setUTCFullYear(classDate.getUTCFullYear(), classDate.getUTCMonth(), classDate.getUTCDate());
          utcEndDate.setUTCFullYear(classDate.getUTCFullYear(), classDate.getUTCMonth(), classDate.getUTCDate());
        } else if (schedule.startTime && schedule.endTime) {
          const scheduleTimezone = schedule.studentTimezone || schedule.teacherTimezone || timezoneUtils.getUserTimezone(user);
          const utcStart = timezoneUtils.localToUTC(schedule.startTime, scheduleTimezone);
          const utcEnd = timezoneUtils.localToUTC(schedule.endTime, scheduleTimezone);
          const [startHour, startMinute] = utcStart.split(':').map(Number);
          const [endHour, endMinute] = utcEnd.split(':').map(Number);
          utcStartDate = new Date(Date.UTC(classDate.getFullYear(), classDate.getMonth(), classDate.getDate(), startHour, startMinute, 0));
          utcEndDate = new Date(Date.UTC(classDate.getFullYear(), classDate.getMonth(), classDate.getDate(), endHour, endMinute, 0));
        } else {
          return;
        }

        futureClasses.push({
          id: `enrollment-${enrollment._id}-${day.date}`,
          title: `${courseName} - ${ulma?.user?.name || 'Teacher'}`,
          start: utcStartDate,
          end: utcEndDate,
          resource: {
            course: courseName,
            ulma: ulma?.user?.name,
            status: 'scheduled',
            type: 'from-enrollment',
            displayTime: `${displayTimes.startTime12} - ${displayTimes.endTime12}`
          },
        });
      });
    });

    return futureClasses;
  };

  // Find classes for a given day and time slot
  const getClassesForDayAndTime = (date, timeSlot) => {
    return classes.filter(cls => {
      const classDate = format(cls.start, 'yyyy-MM-dd');
      // Convert class start time to student's local timezone
      const userTimezone = timezoneUtils.getUserTimezone(user);
      const classTime = cls.start.toLocaleTimeString('en-US', {
        timeZone: userTimezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      return classDate === date && classTime === timeSlot;
    });
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
    setCurrentWeek(newDate);
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: '#1976d2',
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  const EventComponent = ({ event }) => {
    const userTimezone = timezoneUtils.getUserTimezone(user);
    const startTime = event.start.toLocaleTimeString('en-US', {
      timeZone: userTimezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const endTime = event.end.toLocaleTimeString('en-US', {
      timeZone: userTimezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    return (
      <div>
        <strong>{event.title}</strong>
        <br />
        <small>{startTime} - {endTime}</small>
      </div>
    );
  };

  const renderListView = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);

    const filterClassesByDate = (date) => {
      return classes.filter(cls =>
        format(cls.start, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
    };

    return (
      <Grid container spacing={2}>
        {[
          { label: 'Today', date: today, icon: <Today /> },
          { label: 'Tomorrow', date: tomorrow, icon: <DateRange /> },
          { label: 'Day After', date: dayAfter, icon: <CalendarToday /> },
        ].map(({ label, date, icon }) => {
          const dayClasses = filterClassesByDate(date);
          return (
            <Grid item xs={12} md={4} key={label}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    {icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {label} ({format(date, 'MMM dd')})
                    </Typography>
                  </Box>
                  {dayClasses.length === 0 ? (
                    <Typography color="textSecondary">No classes</Typography>
                  ) : (
                    dayClasses.map(cls => (
                      <Box key={cls.id} mb={1} p={1} border={1} borderColor="grey.300" borderRadius={1}>
                        <Typography variant="subtitle2">{cls.title}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
                          {(() => {
                            const userTimezone = timezoneUtils.getUserTimezone(user);
                            const startTime = cls.start.toLocaleTimeString('en-US', {
                              timeZone: userTimezone,
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false
                            });
                            const endTime = cls.end.toLocaleTimeString('en-US', {
                              timeZone: userTimezone,
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false
                            });
                            return `${startTime} - ${endTime}`;
                          })()}
                        </Typography>
                        <Chip label={cls.resource.status} size="small" color="primary" />
                        {cls.resource.status === 'ongoing' && cls.resource.meetingLink && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<VideoCall />}
                            onClick={() => window.open(cls.resource.meetingLink, '_blank')}
                            sx={{ mt: 1 }}
                          >
                            Join Class
                          </Button>
                        )}
                      </Box>
                    ))
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const renderGridView = () => {
    if (uniqueTimeSlots.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No classes scheduled for this week
          </Typography>
        </Paper>
      );
    }

    return (
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5">Weekly Timetable</Typography>
            <Typography color="textSecondary">
              Your class schedule for the week
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchTimetable}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Week Navigation */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Button variant="outlined" onClick={() => navigateWeek('prev')}>
            Previous Week
          </Button>
          <Typography variant="h6">
            {format(weekDays[0]?.fullDate || currentWeek, 'MMM d')} - {format(weekDays[5]?.fullDate || currentWeek, 'MMM d, yyyy')}
          </Typography>
          <Button variant="outlined" onClick={() => navigateWeek('next')}>
            Next Week
          </Button>
        </Box>

        {/* Timetable Grid - Only showing rows with data */}
        <Box sx={{ overflowX: 'auto' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '100px repeat(6, 1fr)',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            {/* Header Row - Time column and Days */}
            <Box
              sx={{
                borderBottom: '1px solid #e0e0e0',
                borderRight: '1px solid #e0e0e0',
                backgroundColor: '#f5f5f5',
                p: 2,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              Time
            </Box>
            {weekDays.map((day, index) => (
              <Box
                key={day.day}
                sx={{
                  borderBottom: '1px solid #e0e0e0',
                  borderRight: index < 5 ? '1px solid #e0e0e0' : 'none',
                  backgroundColor: '#f5f5f5',
                  p: 2,
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                <Typography variant="body2" color="textSecondary">
                  {day.displayDate}
                </Typography>
                <Typography variant="body1">
                  {day.day.slice(0, 3)}
                </Typography>
              </Box>
            ))}

            {/* Time Slots Rows - Only showing slots that have classes */}
            {uniqueTimeSlots.map((timeSlot, timeIndex) => (
              <React.Fragment key={timeSlot}>
                {/* Time Column */}
                <Box
                  sx={{
                    borderBottom: '1px solid #e0e0e0',
                    borderRight: '1px solid #e0e0e0',
                    backgroundColor: '#fafafa',
                    p: 1,
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 'medium',
                  }}
                >
                  {timeSlot}
                </Box>

                {/* Day Columns */}
                {weekDays.map((day, dayIndex) => {
                  const dayClasses = getClassesForDayAndTime(day.date, timeSlot);
                  return (
                    <Box
                      key={`${day.date}-${timeSlot}`}
                      sx={{
                        borderBottom: '1px solid #e0e0e0',
                        borderRight: dayIndex < 5 ? '1px solid #e0e0e0' : 'none',
                        p: 1,
                        minHeight: '80px',
                        backgroundColor: dayClasses.length > 0 ? '#e3f2fd' : 'white',
                        cursor: dayClasses.length > 0 ? 'pointer' : 'default',
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: dayClasses.length > 0 ? '#bbdefb' : '#f5f5f5',
                          transform: dayClasses.length > 0 ? 'scale(1.01)' : 'none',
                          boxShadow: dayClasses.length > 0 ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                        },
                      }}
                      onClick={() => {
                        if (dayClasses.length > 0) {
                          const cls = dayClasses[0];
                          if (cls.resource.status === 'ongoing' && cls.resource.meetingLink) {
                            window.open(cls.resource.meetingLink, '_blank');
                          } else {
                            toast.info(`${cls.title} at ${timeSlot}`);
                          }
                        }
                      }}
                    >
                      {dayClasses.map((cls) => (
                        <Box key={cls.id} sx={{ mb: 1 }}>
                          <Typography variant="body2" fontWeight="bold" noWrap>
                            {cls.title.length > 25 ? cls.title.substring(0, 22) + '...' : cls.title}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" display="block">
                            {(() => {
                              const userTimezone = timezoneUtils.getUserTimezone(user);
                              const startTime = cls.start.toLocaleTimeString('en-US', {
                                timeZone: userTimezone,
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                              });
                              const endTime = cls.end.toLocaleTimeString('en-US', {
                                timeZone: userTimezone,
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                              });
                              return `${startTime} - ${endTime}`;
                            })()}
                          </Typography>
                          <Chip 
                            label={cls.resource.status} 
                            size="small" 
                            color={cls.resource.status === 'ongoing' ? 'success' : 'primary'}
                            sx={{ mt: 0.5, fontSize: '0.7rem', height: '20px' }}
                          />
                          {cls.resource.status === 'ongoing' && cls.resource.meetingLink && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<VideoCall />}
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(cls.resource.meetingLink, '_blank');
                              }}
                              sx={{ mt: 0.5, fontSize: '0.7rem', minWidth: 'unset', px: 1 }}
                            >
                              Join
                            </Button>
                          )}
                        </Box>
                      ))}
                    </Box>
                  );
                })}
              </React.Fragment>
            ))}
          </Box>
        </Box>

        {/* Summary Section */}
        {uniqueTimeSlots.length > 0 && (
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary">
              📚 Total Classes This Week: {classes.filter(cls => {
                const classDate = format(cls.start, 'yyyy-MM-dd');
                return weekDays.some(day => day.date === classDate);
              }).length} classes
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Timetable
      </Typography>

      <Box mb={2}>
        <Button
          variant={viewMode === 'calendar' ? 'contained' : 'outlined'}
          onClick={() => setViewMode('calendar')}
          sx={{ mr: 1 }}
        >
          Calendar View
        </Button>
        <Button
          variant={viewMode === 'grid' ? 'contained' : 'outlined'}
          onClick={() => setViewMode('grid')}
          sx={{ mr: 1 }}
        >
          Grid View
        </Button>
        <Button
          variant={viewMode === 'list' ? 'contained' : 'outlined'}
          onClick={() => setViewMode('list')}
        >
          List View
        </Button>
      </Box>

      {viewMode === 'calendar' ? (
        <Paper sx={{ p: 2, height: 600 }}>
          <Calendar
            localizer={localizer}
            events={classes}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            eventPropGetter={eventStyleGetter}
            components={{
              event: EventComponent,
            }}
            onSelectEvent={(event) => {
              if (event.resource.status === 'ongoing' && event.resource.meetingLink) {
                window.open(event.resource.meetingLink, '_blank');
              } else {
                toast.info(`Class: ${event.title}`);
              }
            }}
          />
        </Paper>
      ) : viewMode === 'grid' ? (
        renderGridView()
      ) : (
        renderListView()
      )}

      <Alert severity="info" sx={{ mt: 2 }}>
        All times are displayed in your local timezone. If you need to adjust for a different timezone, please contact support.
      </Alert>
    </Container>
  );
};

export default StudentTimetable;