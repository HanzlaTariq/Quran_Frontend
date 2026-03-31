import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  Chip,
  Grid
} from '@mui/material';
import { Person, Grade, Chat, School } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TeacherSection = ({ 
  activeEnrollment, 
  onViewProfile,
  onBrowseTeachers 
}) => {
  const navigate = useNavigate();
  if (!activeEnrollment?.ulma) {
    return (
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, textAlign: 'center' }}>
        <Avatar sx={{ width: 60, height: 60, mx: 'auto', mb: 2, bgcolor: 'primary.light' }}>
          <School />
        </Avatar>
        <Typography variant="h6" gutterBottom>
          No Teacher Assigned
        </Typography>
        <Typography color="textSecondary" paragraph>
          Browse available teachers and enroll in a course
        </Typography>
        <Button 
          variant="contained" 
          onClick={onBrowseTeachers}
          fullWidth
        >
          Browse Teachers
        </Button>
      </Paper>
    );
  }

  const teacher = activeEnrollment.ulma;

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Your Teacher
      </Typography>
      
      <Box display="flex" alignItems="center" mb={2}>
        <Avatar sx={{ width: 60, height: 60, mr: 2 }} src={teacher.user?.profileImage}>
          <Person />
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {teacher.user?.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {teacher.expertise?.slice(0, 2).join(', ')}
          </Typography>
          <Chip 
            label={`Rating: ${teacher.rating?.average || 'N/A'}`}
            size="small"
            icon={<Grade fontSize="small" />}
            sx={{ mt: 0.5 }}
          />
        </Box>
      </Box>

      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Chat />}
            onClick={() => navigate('/student/chat')}
          >
            Message
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onViewProfile}
          >
            View Profile
          </Button>
        </Grid>
      </Grid>

      {/* Remove the chat display since it's now on a separate page */}
    </Paper>
  );
};

export default TeacherSection;