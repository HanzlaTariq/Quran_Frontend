import React from 'react';
import { Container, Paper, Typography, Box, Button } from '@mui/material';

const Availability = () => {
  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Set Your Availability
        </Typography>
        <Typography color="textSecondary" paragraph>
          Set your available time slots for teaching. Students can book classes during these times.
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button variant="contained">
            Coming Soon
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Availability;