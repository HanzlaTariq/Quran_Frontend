// src/components/ScheduleDisplay.jsx
import React from 'react';
import { Box, Typography, Chip, Paper } from '@mui/material';
import { AccessTime, Schedule, Info } from '@mui/icons-material';
import timezoneUtils from '../utils/timezoneUtils';

const { getScheduleDisplayTimes, formatTime12, getUserTimezone } = timezoneUtils;

const ScheduleDisplay = ({ enrollment, viewer, variant = 'compact' }) => {
  const viewerTimezone = getUserTimezone(viewer);
  const displayTimes = getScheduleDisplayTimes(enrollment.schedule, viewerTimezone);
  
  if (!displayTimes) return null;
  
  const daysMap = {
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
    sat: 'Saturday'
  };
  
  const dayNames = enrollment.schedule.days.map(day => daysMap[day] || day);
  
  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Chip 
          icon={<AccessTime />} 
          label={`${displayTimes.startTime12} - ${displayTimes.endTime12}`}
          size="small"
        />
        <Chip 
          icon={<Schedule />} 
          label={dayNames.join(', ')}
          size="small"
        />
      </Box>
    );
  }
  
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccessTime fontSize="small" color="primary" />
        Schedule
      </Typography>
      
      <Box sx={{ mt: 1 }}>
        <Typography variant="body2">
          <strong>Days:</strong> {dayNames.join(', ')}
        </Typography>
        <Typography variant="body2">
          <strong>Time:</strong> {displayTimes.startTime12} - {displayTimes.endTime12}
        </Typography>
        <Typography variant="body2">
          <strong>Duration:</strong> {displayTimes.duration} minutes per class
        </Typography>
        {enrollment.schedule.studentTimezone && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            <Info fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
            Student's local time: {formatTime12(enrollment.schedule.originalStartTime)} - {formatTime12(enrollment.schedule.originalEndTime)}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default ScheduleDisplay;