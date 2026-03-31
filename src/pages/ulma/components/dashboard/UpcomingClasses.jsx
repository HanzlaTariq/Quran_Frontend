import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Chip,
  Box,
} from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
import { format, isTomorrow } from 'date-fns';

const UpcomingClasses = ({ upcomingClasses = [], onViewAll }) => {
  const getBorderColor = (classDate) => {
    const date = new Date(classDate);
    if (isTomorrow(date)) return 'warning.main';
    if (date.getDay() === 0 || date.getDay() === 6) return 'info.main'; // Weekend
    return 'primary.light';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'confirmed': return 'info';
      case 'ongoing': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 3 } }}>
      <Typography variant="h6" gutterBottom>
        Upcoming Classes
      </Typography>
      <List dense>
        {upcomingClasses.map((classItem) => (
          <ListItem 
            key={classItem._id}
            sx={{
              borderLeft: 3,
              borderColor: getBorderColor(classItem.date),
              mb: 1,
              borderRadius: '0 8px 8px 0',
              bgcolor: 'background.paper',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemAvatar>
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: getBorderColor(classItem.date)
                }}
              >
                <CalendarToday fontSize="small" />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight="medium">
                  {classItem.student?.user?.name || 'Student'}
                </Typography>
              }
              secondary={
                <>
                  <Typography variant="caption" display="block">
                    {format(new Date(classItem.date), 'EEE, MMM d')} • {classItem.startTime}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {/* Always show course name if object, fallback otherwise */}
                    {typeof classItem.course === 'object' && classItem.course !== null ? classItem.course.name : (classItem.course || 'General Class')}
                  </Typography>
                </>
              }
            />
            <Chip
              label={classItem.status || 'scheduled'}
              size="small"
              color={getStatusColor(classItem.status)}
              sx={{ ml: 1 }}
            />
          </ListItem>
        ))}
      </List>
      
      {upcomingClasses.length === 0 ? (
        <Typography color="textSecondary" align="center" sx={{ py: 2 }}>
          No upcoming classes scheduled
        </Typography>
      ) : (
        <Button 
          fullWidth 
          sx={{ mt: 2 }} 
          onClick={onViewAll}
          variant="outlined"
        >
          View Full Schedule
        </Button>
      )}
    </Paper>
  );
};

export default UpcomingClasses;