import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Avatar,
  Box,
  Chip,
  Divider,
  alpha,
  useTheme,
  Badge,
  Fade,
  Grow,
  Container
} from '@mui/material';
import { 
  CheckCircle, 
  Notifications, 
  Event,
  Schedule,
  School,
  AssignmentTurnedIn,
  TrendingUp,
  ArrowForward,
  AccessTime,
  Star
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';

const RecentActivity = ({ recentClasses, notifications, onViewAll, onMarkRead }) => {
  const theme = useTheme();

  const activities = [
    ...(recentClasses?.map(cls => {
      if (!cls || !cls._id) return null;
      const courseName = typeof cls.course === 'object' && cls.course !== null ? cls.course.name : cls.course;
      return {
        id: cls._id,
        type: 'class',
        title: `Completed ${courseName}`,
        subtitle: 'Class session finished',
        time: cls.date,
        icon: <CheckCircle fontSize="small" />,
        color: 'success',
        bgColor: alpha(theme.palette.success.main, 0.12),
        gradient: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.15)}, ${alpha(theme.palette.success.main, 0.05)})`,
      };
    }).filter(Boolean) || []),
    ...(notifications?.map(notif => {
      if (!notif || !notif._id) return null;
      return {
        id: notif._id,
        type: 'notification',
        title: notif.title,
        description: notif.message,
        time: notif.createdAt,
        isRead: notif.isRead,
        icon: notif.isRead ? <Notifications fontSize="small" /> : <Star fontSize="small" />,
        color: notif.isRead ? 'grey' : 'primary',
        bgColor: notif.isRead ? alpha(theme.palette.grey[500], 0.08) : alpha(theme.palette.primary.main, 0.12),
        gradient: notif.isRead 
          ? `linear-gradient(135deg, ${alpha(theme.palette.grey[500], 0.05)}, ${alpha(theme.palette.grey[500], 0.02)})`
          : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.03)})`,
      };
    }).filter(Boolean) || [])
  ].filter(activity => activity && activity.id && activity.time).sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

  // Get time status
  const getTimeStatus = (time) => {
    if (!time) return { label: 'Unknown', color: 'grey' };
    
    const now = new Date();
    const activityDate = new Date(time);
    if (isNaN(activityDate.getTime())) return { label: 'Unknown', color: 'grey' };
    
    const diffHours = (now - activityDate) / (1000 * 60 * 60);
    
    if (diffHours < 1) return { label: 'Just now', color: 'success' };
    if (diffHours < 24) return { label: 'Today', color: 'info' };
    if (diffHours < 48) return { label: 'Yesterday', color: 'warning' };
    return { label: 'Earlier', color: 'grey' };
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ width: '100%' }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: { xs: 2, sm: 3 },
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.98)})`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          width: '100%',
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
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
            opacity: 0.6,
          }
        }}
      >
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar 
              sx={{ 
                width: { xs: 36, sm: 40 }, 
                height: { xs: 36, sm: 40 }, 
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
              }}
            >
              <Schedule />
            </Avatar>
            <Typography variant="h6" fontWeight="bold">
              Recent Activity
            </Typography>
          </Box>
          <Chip 
            label={`${activities.length} updates`}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: theme.palette.primary.main,
              fontWeight: 500,
            }}
          />
        </Box>

        <Divider sx={{ mb: 2, bgcolor: alpha(theme.palette.divider, 0.5) }} />

        {/* Activities List */}
        <List sx={{ py: 0 }}>
          {activities.length === 0 ? (
            <Box 
              sx={{ 
                py: { xs: 3, sm: 4 }, 
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
              <Avatar 
                sx={{ 
                  width: { xs: 50, sm: 60 }, 
                  height: { xs: 50, sm: 60 }, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: alpha(theme.palette.grey[500], 0.08),
                  color: theme.palette.grey[400],
                }}
              >
                <Notifications sx={{ fontSize: { xs: 24, sm: 30 } }} />
              </Avatar>
              <Typography variant="body2" color="textSecondary">
                No recent activities to show
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Your recent classes and notifications will appear here
              </Typography>
            </Box>
          ) : (
            activities.map((activity, index) => {
              const timeStatus = getTimeStatus(activity.time);
              
              return (
                <Grow key={activity.id} in timeout={300 * (index + 1)}>
                  <ListItem 
                    sx={{ 
                      px: { xs: 1, sm: 0 }, 
                      py: { xs: 1, sm: 1.5 },
                      cursor: activity.type === 'notification' && !activity.isRead ? 'pointer' : 'default',
                      transition: 'all 0.2s ease',
                      borderRadius: 2,
                      mb: 0.5,
                      '&:hover': {
                        bgcolor: activity.type === 'notification' && !activity.isRead 
                          ? alpha(theme.palette.primary.main, 0.04)
                          : alpha(theme.palette.action.hover, 0.5),
                        transform: 'translateX(4px)',
                      },
                    }}
                    onClick={() => {
                      if (activity.type === 'notification' && !activity.isRead) {
                        onMarkRead(activity.id);
                      }
                    }}
                  >
                    {/* Icon with Badge */}
                    <ListItemIcon sx={{ minWidth: { xs: 40, sm: 48 } }}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                        sx={{
                          '& .MuiBadge-badge': {
                            bgcolor: activity.type === 'notification' && !activity.isRead 
                              ? theme.palette.primary.main 
                              : 'transparent',
                            boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                          }
                        }}
                      >
                        <Avatar 
                          sx={{ 
                            width: { xs: 36, sm: 40 }, 
                            height: { xs: 36, sm: 40 }, 
                            background: activity.gradient,
                            bgcolor: activity.bgColor,
                            color: `${activity.color}.main`,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.05)',
                            }
                          }}
                        >
                          {activity.icon}
                        </Avatar>
                      </Badge>
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5} flexWrap="wrap" gap={1}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: activity.isRead ? 500 : 700,
                              color: activity.isRead ? 'text.primary' : theme.palette.primary.main,
                              fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            }}
                          >
                            {activity.title}
                          </Typography>
                          <Chip
                            label={timeStatus.label}
                            size="small"
                            sx={{
                              height: { xs: 18, sm: 20 },
                              fontSize: { xs: '0.55rem', sm: '0.6rem' },
                              bgcolor: timeStatus.color === 'grey' 
                                ? alpha(theme.palette.grey[500], 0.1) 
                                : alpha(theme.palette[timeStatus.color].main, 0.1),
                              color: timeStatus.color === 'grey' 
                                ? theme.palette.grey[500] 
                                : `${timeStatus.color}.main`,
                              fontWeight: 500,
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          {activity.description && (
                            <Typography 
                              variant="caption" 
                              color="textSecondary" 
                              display="block"
                              sx={{ mb: 0.5, fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
                            >
                              {activity.description}
                            </Typography>
                          )}
                          <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
                            <AccessTime sx={{ fontSize: { xs: 10, sm: 12 }, color: 'text.secondary' }} />
                            <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
                              {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                            </Typography>
                            {activity.type === 'class' && (
                              <>
                                <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.secondary' }} />
                                <School sx={{ fontSize: { xs: 10, sm: 12 }, color: 'text.secondary' }} />
                                <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
                                  Completed
                                </Typography>
                              </>
                            )}
                          </Box>
                        </Box>
                      }
                    />
                    
                    {/* Unread Indicator */}
                    {activity.type === 'notification' && !activity.isRead && (
                      <Box
                        sx={{
                          width: { xs: 6, sm: 8 },
                          height: { xs: 6, sm: 8 },
                          borderRadius: '50%',
                          bgcolor: theme.palette.primary.main,
                          animation: 'pulse 1.5s ease-in-out infinite',
                          '@keyframes pulse': {
                            '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                            '50%': { opacity: 0.5, transform: 'scale(1.2)' },
                          },
                        }}
                      />
                    )}
                  </ListItem>
                </Grow>
              );
            })
          )}
        </List>

        {/* View All Button */}
        {activities.length > 0 && (
          <Box mt={2}>
            <Divider sx={{ mb: 2, bgcolor: alpha(theme.palette.divider, 0.5) }} />
            <Button
              fullWidth
              variant="text"
              onClick={onViewAll}
              endIcon={<ArrowForward />}
              sx={{
                py: { xs: 1, sm: 1.2 },
                borderRadius: 2,
                color: theme.palette.primary.main,
                fontWeight: 600,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  transform: 'translateX(4px)',
                },
              }}
            >
              View All Activity
            </Button>
          </Box>
        )}

        {/* Decorative Elements */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            width: { xs: 80, sm: 100 },
            height: { xs: 80, sm: 100 },
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.03)} 0%, transparent 70%)`,
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
      </Paper>
    </Container>
  );
};

export default RecentActivity;