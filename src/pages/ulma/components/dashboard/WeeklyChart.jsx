import React from 'react';
import { Paper, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const WeeklyChart = ({ weeklyStats }) => {
  const data = weeklyStats && weeklyStats.length > 0 ? weeklyStats : null;

  if (!data) {
    return (
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 3 }, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          No data available for this week
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 3 }, height: 300, minHeight: 300 }}>
      <Typography variant="h6" gutterBottom>
        Weekly Performance
      </Typography>
      <ResponsiveContainer width="100%" height="80%" minHeight={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip formatter={(value) => [`${value}`, value > 100 ? 'Earnings ($)' : 'Classes']} />
          <Legend />
          <Bar yAxisId="left" dataKey="classes" fill="#8884d8" name="Classes" />
          <Bar yAxisId="right" dataKey="earnings" fill="#82ca9d" name="Earnings ($)" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default WeeklyChart;