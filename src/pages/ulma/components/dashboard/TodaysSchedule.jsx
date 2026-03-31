import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const TodaysSchedule = ({ todaysClasses, onViewAll, onStartClass }) => {
  const navigate = useNavigate();

  const getStatusChip = (status) => {
    switch (status) {
      case 'scheduled':
        return <Chip label="Scheduled" size="small" color="primary" />;
      case 'ongoing':
        return <Chip label="Ongoing" size="small" color="warning" />;
      case 'completed':
        return <Chip label="Completed" size="small" color="success" />;
      case 'cancelled':
        return <Chip label="Cancelled" size="small" color="error" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 3 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Today's Schedule</Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={onViewAll}
        >
          View All
        </Button>
      </Box>

      {todaysClasses.length === 0 ? (
        <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
          No classes scheduled for today
        </Typography>
      ) : (
        <List>
          {todaysClasses
            .sort((a, b) => new Date(a.utcStart) - new Date(b.utcStart))
            .map((classItem, index) => (
            <React.Fragment key={classItem._id}>
              <ListItem
                secondaryAction={
                  <Box display="flex" alignItems="center" gap={1}>
                    {getStatusChip(classItem.status)}
                    {classItem.status === 'scheduled' && classItem.meetingLink && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => onStartClass(classItem._id)}
                      >
                        Start
                      </Button>
                    )}
                    {classItem.status === 'ongoing' && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => navigate(`/ulma/live-class/${classItem._id}`)}
                      >
                        Join
                      </Button>
                    )}
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Avatar>
                    {classItem.student?.user?.name?.charAt(0) || 'S'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1">
                        {classItem.student?.user?.name || 'Student'}
                      </Typography>
                      <Chip
                        label={classItem.course?.name || 'General'}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="textPrimary">
                        {classItem.topic || 'Quran Class'} • {format(new Date(classItem.utcStart), 'h:mm a')} - {format(new Date(classItem.utcEnd), 'h:mm a')}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2" color="textSecondary">
                        {format(new Date(classItem.date), 'MMM dd, yyyy')} • {classItem.notes || 'No notes'}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              {index < todaysClasses.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default TodaysSchedule;