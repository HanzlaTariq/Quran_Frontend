import React from 'react';
import { Grid, Paper, Typography, Box, Button } from '@mui/material';
import { Assignment } from '@mui/icons-material';
import AssignmentCard from '../../../../components/Assignment/AssignmentCard';

const PendingAssignments = ({ assignments, onViewAll }) => {
  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
          Pending Assignments
        </Typography>
        <Button variant="text" onClick={onViewAll}>
          View All
        </Button>
      </Box>
      
      <Grid container spacing={2}>
        {assignments.slice(0, 2).map((assignment) => (
          <Grid item xs={12} key={assignment._id}>
            <AssignmentCard assignment={assignment} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default PendingAssignments;