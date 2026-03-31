import React from 'react';
import { Grid, Paper, Typography, Box, LinearProgress, Card, Button } from '@mui/material';
import { MenuBook, MoreVert } from '@mui/icons-material';
import ProgressChart from '../../../../components/Progress/ProgressChart';

const ProgressSection = ({ stats, onViewProgress }) => {
  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          <MenuBook sx={{ mr: 1, verticalAlign: 'middle' }} />
          Learning Progress
        </Typography>
        <Button 
          variant="text" 
          onClick={onViewProgress}
          endIcon={<MoreVert />}
        >
          View Details
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
              Quran Completion
            </Typography>
            <LinearProgress
              variant="determinate"
              value={stats.progressPercentage || 0}
              sx={{ 
                height: 10, 
                borderRadius: 5, 
                mb: 1,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'success.main'
                }
              }}
            />
            <Typography variant="body2" color="textSecondary">
              {stats.currentPara || 1} of 30 Paras ({stats.progressPercentage || 0}%)
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
              Current Focus
            </Typography>
            <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="body1" gutterBottom>
                <strong>Surah:</strong> {stats.currentSurah || 'Al-Fatiha'}
              </Typography>
              <Typography variant="body1">
                <strong>Ayat Completed:</strong> {stats.ayatCompleted || 0}
              </Typography>
            </Card>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ height: '100%' }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
              Weekly Progress
            </Typography>
            <ProgressChart 
              data={[
                { day: 'Mon', value: 65 },
                { day: 'Tue', value: 70 },
                { day: 'Wed', value: 85 },
                { day: 'Thu', value: 80 },
                { day: 'Fri', value: 90 },
                { day: 'Sat', value: 75 },
                { day: 'Sun', value: 60 }
              ]}
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ProgressSection;