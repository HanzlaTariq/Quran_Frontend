import React from 'react';
import { Grid, Paper, Typography,Button } from '@mui/material';
import {
  Book,
  Assignment,
  Payment,
  History,
  Download,
  Event,
  
} from '@mui/icons-material';

const QuickActionButton = ({ icon, label, onClick, color = 'primary' }) => (
  <Grid item xs={12}>
    <Button
      fullWidth
      variant="outlined"
      startIcon={icon}
      onClick={onClick}
      sx={{ 
        justifyContent: 'flex-start',
        py: 1.5,
        borderColor: `${color}.main`,
        color: `${color}.main`,
        '&:hover': {
          borderColor: `${color}.dark`,
          bgcolor: `${color}.light`,
          opacity: 0.8
        }
      }}
    >
      {label}
    </Button>
  </Grid>
);

const QuickActions = ({
  onViewCourses,
  onViewAssignments,
  onPayFees,
  onViewAttendance,
  onDownloadMaterials,
  onScheduleClass,
  feeStatus
}) => {
  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={1}>
        <QuickActionButton
          icon={<Book />}
          label="My Courses"
          onClick={onViewCourses}
        />
        <QuickActionButton
          icon={<Assignment />}
          label="Assignments"
          onClick={onViewAssignments}
          color="warning"
        />
        <QuickActionButton
          icon={<Payment />}
          label="Pay Fees"
          onClick={onPayFees}
          color={feeStatus ? 'success' : 'error'}
        />
        <QuickActionButton
          icon={<History />}
          label="Attendance History"
          onClick={onViewAttendance}
        />
        <QuickActionButton
          icon={<Download />}
          label="Download Materials"
          onClick={onDownloadMaterials}
        />
        <QuickActionButton
          icon={<Event />}
          label="Schedule Class"
          onClick={onScheduleClass}
        />
      </Grid>
    </Paper>
  );
};

export default QuickActions;