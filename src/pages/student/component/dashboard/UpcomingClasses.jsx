import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Box, 
  Button, 
  Chip, 
  Avatar,
  Divider,
  alpha,
  useTheme,
  Tooltip,
  Fade,
  Grow
} from '@mui/material';
import { 
  Videocam, 
  Schedule, 
  AccessTime, 
  School, 
  Person,
  ArrowForward,
  ExpandMore,
  CalendarToday,
  NotificationsActive,
  Pending,
  Lock
} from '@mui/icons-material';
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

const UpcomingClasses = ({ classes, onJoinClass, onViewSchedule, userTimezone = 'America/New_York' }) => {
  const theme = useTheme();
  const [showAll, setShowAll] = useState(false);

  const getClassStartDateTime = (cls) => {
    if (!cls) return null;

    if (cls.utcStart) {
      const utcDate = new Date(cls.utcStart);
      if (!Number.isNaN(utcDate.getTime())) return utcDate;
    }

    const datePart = cls.date ? String(cls.date).split('T')[0] : null;

    if (datePart && cls.startTime) {
      const localDateTime = new Date(`${datePart}T${cls.startTime}`);
      if (!Number.isNaN(localDateTime.getTime())) return localDateTime;
    }

    if (datePart) {
      const localDate = new Date(`${datePart}T00:00:00`);
      if (!Number.isNaN(localDate.getTime())) return localDate;
    }

    return null;
  };

  // Sort classes by date and time (ascending - soonest first)
  const sortedClasses = [...(classes || [])]
    .filter((cls) => {
      const classStart = getClassStartDateTime(cls);
      if (!classStart) return false;

      // Keep class visible until 30 minutes after start time.
      const now = new Date();
      return (classStart.getTime() - now.getTime()) / (1000 * 60) >= -30;
    })
    .sort((a, b) => {
      const datetimeA = getClassStartDateTime(a);
      const datetimeB = getClassStartDateTime(b);

      if (!datetimeA && !datetimeB) return 0;
      if (!datetimeA) return 1;
      if (!datetimeB) return -1;

      return datetimeA - datetimeB;
    });

  // Get relative date label
  const getRelativeDate = (classDateTime) => {
    if (!classDateTime) return { label: 'Date TBD', color: 'primary' };
    const classDate = classDateTime;
    if (isToday(classDate)) return { label: 'Today', color: 'success' };
    if (isTomorrow(classDate)) return { label: 'Tomorrow', color: 'info' };
    const daysDiff = differenceInDays(classDate, new Date());
    if (daysDiff <= 7) return { label: `In ${daysDiff} days`, color: 'warning' };
    return { label: format(classDate, 'MMM d'), color: 'primary' };
  };

  // Get time status
  const getTimeStatus = (cls) => {
    const classDateTime = getClassStartDateTime(cls);
    if (!classDateTime) return null;
    
    const now = new Date();
    const diffMinutes = (classDateTime - now) / (1000 * 60);
    
    if (diffMinutes < -30) return null; // Class ended more than 30 mins ago
    if (diffMinutes < 0) return { label: 'Class in progress', color: 'success' };
    if (diffMinutes <= 15) return { label: 'Starting soon', color: 'warning' };
    if (diffMinutes <= 60) return { label: `In ${Math.floor(diffMinutes)} min`, color: 'info' };
    return null;
  };

  // Class can be joined when teacher has started it.
  const isJoinable = (cls) => {
    return cls?.status === 'ongoing';
  };

  // Format time display
  const getTimeDisplay = (cls) => {
    if (cls.utcStart) {
      return formatInTimeZone(new Date(cls.utcStart), userTimezone, 'h:mm a');
    }
    if (cls.startTime) {
      return cls.startTime;
    }
    return 'Time TBD';
  };

  // Get formatted date
  const getFormattedDate = (cls) => {
    const classStartDate = getClassStartDateTime(cls);
    if (!classStartDate) return 'Date TBD';
    return formatInTimeZone(classStartDate, userTimezone, 'MMM d, yyyy');
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.98)})`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.08)}`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          opacity: 0.6,
        }
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar 
            sx={{ 
              width: 36, 
              height: 36, 
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
            }}
          >
            <Schedule />
          </Avatar>
          <Typography variant="h6" fontWeight="bold">
            Upcoming Classes
          </Typography>
        </Box>
        <Button 
          size="small" 
          onClick={() => setShowAll(!showAll)}
          endIcon={showAll ? <ExpandMore /> : <ArrowForward />}
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 600,
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              transform: 'translateX(4px)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          {showAll ? 'View Less' : 'View All'}
        </Button>
      </Box>

      <Divider sx={{ mb: 2, bgcolor: alpha(theme.palette.divider, 0.5) }} />

      {/* Classes List */}
      {sortedClasses?.length > 0 ? (
        <List sx={{ py: 0 }}>
          {sortedClasses.slice(0, showAll ? sortedClasses.length : 2).map((cls, index) => {
            const courseName = typeof cls.course === 'object' && cls.course !== null ? cls.course.name : cls.course;
            const classStartDateTime = getClassStartDateTime(cls);
            const relativeDate = getRelativeDate(classStartDateTime);
            const timeStatus = getTimeStatus(cls);
            const joinable = isJoinable(cls);
            const isOngoing = timeStatus?.label === 'Class in progress';
            const isStartingSoon = timeStatus?.label === 'Starting soon';

            return (
              <Grow key={cls._id} in timeout={300 * (index + 1)}>
                <ListItem
                  sx={{
                    border: `1px solid ${alpha(
                      isOngoing ? theme.palette.success.main : 
                      isStartingSoon ? theme.palette.warning.main : 
                      cls?.status === 'scheduled' ? theme.palette.info.main :
                      theme.palette.divider, 
                      0.2
                    )}`,
                    borderRadius: 2,
                    mb: 1.5,
                    bgcolor: isOngoing 
                      ? alpha(theme.palette.success.main, 0.05)
                      : isStartingSoon
                      ? alpha(theme.palette.warning.main, 0.03)
                      : 'transparent',
                    transition: 'all 0.2s ease',
                    p: { xs: 1.5, sm: 2 },
                    '&:hover': {
                      transform: 'translateX(4px)',
                      borderColor: alpha(
                        isOngoing ? theme.palette.success.main : 
                        isStartingSoon ? theme.palette.warning.main : 
                        cls?.status === 'scheduled' ? theme.palette.info.main :
                        theme.palette.primary.main, 
                        0.4
                      ),
                      boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`,
                    },
                  }}
                >
                  {/* Index Number Badge */}
                  <Box 
                    sx={{ 
                      mr: 2, 
                      minWidth: 36,
                      textAlign: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        borderRadius: 2,
                        p: 0.5,
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 700,
                          color: theme.palette.primary.main,
                          fontSize: '0.9rem',
                        }}
                      >
                        {index + 1}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Date Badge */}
                  <Box 
                    sx={{ 
                      mr: 2, 
                      minWidth: 60,
                      textAlign: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: alpha(theme.palette[relativeDate.color].main, 0.12),
                        borderRadius: 2,
                        p: 1,
                        border: `1px solid ${alpha(theme.palette[relativeDate.color].main, 0.2)}`,
                      }}
                    >
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: `${relativeDate.color}.main`,
                          fontWeight: 600,
                          display: 'block',
                          fontSize: '0.7rem',
                        }}
                      >
                        {relativeDate.label}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700,
                          lineHeight: 1,
                          fontSize: '1.1rem',
                          color: theme.palette[relativeDate.color].main,
                        }}
                      >
                        {classStartDateTime ? format(classStartDateTime, 'd') : '--'}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.65rem',
                        }}
                      >
                        {classStartDateTime ? format(classStartDateTime, 'MMM') : 'TBD'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Class Details */}
                  <ListItemText
                    sx={{ flex: 1 }}
                    primary={
                      <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={0.5}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            color: isOngoing ? theme.palette.success.main : 'text.primary',
                          }}
                        >
                          {courseName}
                        </Typography>
                        {isOngoing && (
                          <Chip
                            size="small"
                            label="LIVE NOW"
                            icon={<Videocam sx={{ fontSize: 14 }} />}
                            color="success"
                            sx={{
                              height: 24,
                              animation: 'pulse 2s infinite',
                              fontWeight: 600,
                              '@keyframes pulse': {
                                '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                                '50%': { opacity: 0.8, transform: 'scale(1.02)' },
                              },
                            }}
                          />
                        )}
                        {isStartingSoon && !isOngoing && (
                          <Chip
                            size="small"
                            label="Starting Soon"
                            icon={<NotificationsActive sx={{ fontSize: 14 }} />}
                            color="warning"
                            sx={{
                              height: 24,
                              fontWeight: 600,
                            }}
                          />
                        )}
                        {!joinable && (
                          <Chip
                            size="small"
                            label="Waiting For Teacher"
                            icon={<Lock sx={{ fontSize: 12 }} />}
                            variant="outlined"
                            sx={{
                              height: 22,
                              fontSize: '0.65rem',
                              borderColor: alpha(theme.palette.grey[500], 0.35),
                              color: 'text.secondary',
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap" mb={0.5}>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                              {getFormattedDate(cls)} • {getTimeDisplay(cls)}
                              {cls.endTime && ` - ${cls.endTime}`}
                            </Typography>
                          </Box>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Person sx={{ fontSize: 12, color: 'text.secondary' }} />
                          <Typography variant="caption" color="textSecondary">
                            Teacher: {cls.ulma?.user?.name || 'TBA'}
                          </Typography>
                        </Box>
                        {cls.topic && (
                          <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                            <School sx={{ fontSize: 12, color: 'text.secondary' }} />
                            <Typography variant="caption" color="textSecondary">
                              Topic: {cls.topic}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  />

                  {/* Join/Start Class Button */}
                  {joinable ? (
                    <Tooltip title="Join live class">
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<Videocam />}
                        onClick={() => onJoinClass(cls._id)}
                        sx={{
                          borderRadius: 2,
                          px: { xs: 1.5, sm: 2 },
                          py: { xs: 0.75, sm: 1 },
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          fontWeight: 600,
                          background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                          boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.3)}`,
                          whiteSpace: 'nowrap',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.4)}`,
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        Join Now
                      </Button>
                    </Tooltip>
                  ) : cls?.status === 'scheduled' ? (
                    <Tooltip title="Class not started yet">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Pending />}
                        disabled
                        sx={{
                          borderRadius: 2,
                          px: { xs: 1.5, sm: 2 },
                          py: { xs: 0.75, sm: 1 },
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          whiteSpace: 'nowrap',
                          opacity: 0.6,
                        }}
                      >
                        Starts Soon
                      </Button>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Teacher has not started this class yet">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Lock />}
                        disabled
                        sx={{
                          borderRadius: 2,
                          px: { xs: 1.5, sm: 2 },
                          py: { xs: 0.75, sm: 1 },
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          whiteSpace: 'nowrap',
                          opacity: 0.5,
                        }}
                      >
                        Waiting
                      </Button>
                    </Tooltip>
                  )}
                </ListItem>
              </Grow>
            );
          })}
        </List>
      ) : (
        <Box 
          sx={{ 
            py: { xs: 4, sm: 6 }, 
            textAlign: 'center',
            color: 'text.secondary',
          }}
        >
          <Avatar 
            sx={{ 
              width: 60, 
              height: 60, 
              mx: 'auto', 
              mb: 2,
              bgcolor: alpha(theme.palette.grey[500], 0.08),
              color: theme.palette.grey[400],
            }}
          >
            <VideocamOff sx={{ fontSize: 30 }} />
          </Avatar>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            No upcoming classes
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Your scheduled classes will appear here
          </Typography>
        </Box>
      )}

      {/* Decorative Element */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          width: 80,
          height: 80,
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.03)} 0%, transparent 70%)`,
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
    </Paper>
  );
};

export default UpcomingClasses;