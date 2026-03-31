import React from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Badge,
  Chip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle,
  Pending,
  Message,
  Assignment,
  Payment,
  PersonAdd,
  Class,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

// Component name change kiya
const NotificationsPanel = ({ notifications }) => {
  const sampleNotifications = [
    {
      id: 1,
      title: 'New student enrollment',
      description: 'Ahmed Khan has enrolled in your Hifz course',
      time: '2 hours ago',
      icon: <PersonAdd />,
      color: 'success',
      type: 'enrollment',
      read: false,
    },
    {
      id: 2,
      title: 'Class starting soon',
      description: 'Your class with Fatima starts in 30 minutes',
      time: 'Today at 2:30 PM',
      icon: <Class />,
      color: 'warning',
      type: 'reminder',
      read: false,
    },
    {
      id: 1,
      title: 'New student enrollment',
      description: 'Ahmed Khan has enrolled in your Hifz course',
      time: '2 hours ago',
      icon: <PersonAdd />,
      color: 'success',
      type: 'enrollment',
      read: false,
    },
    {
      id: 2,
      title: 'Class starting soon',
      description: 'Your class with Fatima starts in 30 minutes',
      time: 'Today at 2:30 PM',
      icon: <Class />,
      color: 'warning',
      type: 'reminder',
      read: false,
    },
    {
      id: 3,
      title: 'New message',
      description: 'You have a new message from student Ali',
      time: 'Yesterday',
      icon: <Message />,
      color: 'info',
      type: 'message',
      read: true,
    },
    {
      id: 4,
      title: 'Assignment submitted',
      description: 'Student submitted assignment for Tajweed lesson',
      time: '2 days ago',
      icon: <Assignment />,
      color: 'primary',
      type: 'assignment',
      read: true,
    },
    {
      id: 5,
      title: 'Payment received',
      description: 'Monthly earnings deposited to your account',
      time: '3 days ago',
      icon: <Payment />,
      color: 'success',
      type: 'payment',
      read: true,
    },
  ];

  const data = (notifications && notifications.length > 0) ? notifications : [];

  const unreadCount = data.filter(n => !n.read).length;

  const getIconColor = (color) => {
    return `${color}.light`;
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 3 } }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Notifications</Typography>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </Box>
      
      {data.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="body2" color="textSecondary">
            No notifications yet
          </Typography>
        </Box>
      ) : (
        <List dense>
          {data.slice(0, 4).map((notification) => (
          <ListItem
            key={notification.id}
            sx={{
              mb: 1,
              borderRadius: 1,
              bgcolor: notification.read ? 'transparent' : 'action.selected',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemAvatar>
              <Avatar 
                sx={{ 
                  bgcolor: getIconColor(notification.color),
                  color: `${notification.color}.dark`,
                  width: 32,
                  height: 32,
                }}
              >
                {notification.icon}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" fontWeight="medium">
                    {notification.title}
                  </Typography>
                  {!notification.read && (
                    <Chip
                      label="New"
                      size="small"
                      color="error"
                      sx={{ height: 16 }}
                    />
                  )}
                </Box>
              }
              secondary={
                <>
                  <Typography variant="caption" display="block">
                    {notification.description}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {notification.time}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
      )}
      
      <Button 
        fullWidth 
        sx={{ mt: 2 }}
        variant="outlined"
        onClick={() => window.location.href = '/ulma/notifications'}
      >
        View All Notifications
      </Button>
    </Paper>
  );
};

// Export name change kiya
export default NotificationsPanel;