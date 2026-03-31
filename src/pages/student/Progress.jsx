import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Avatar,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  TrendingUp,
  Schedule,
  CheckCircle,
  Book,
  Star,
  Assessment,
  Download,
  Share,
} from '@mui/icons-material';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const Progress = () => {
  const [progressData, setProgressData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const [profileRes, classesRes] = await Promise.all([
        axios.get('/api/auth/profile'),
        axios.get('/api/students/classes?limit=20'),
      ]);

      const student = profileRes.data.studentProfile;
      const classes = classesRes.data;

      // Process attendance data
      const monthlyAttendance = processAttendanceData(classes);
      
      setProgressData(student);
      setAttendanceData(monthlyAttendance);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAttendanceData = (classes) => {
    const monthlyData = {};
    
    classes.forEach(classItem => {
      const month = new Date(classItem.date).toLocaleString('default', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { present: 0, total: 0 };
      }
      monthlyData[month].total++;
      if (classItem.attendance) {
        monthlyData[month].present++;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      attendance: (data.present / data.total) * 100,
    }));
  };

  const radarData = [
    { subject: 'Recitation', score: progressData?.progress?.recitationScore || 75, fullMark: 100 },
    { subject: 'Memorization', score: progressData?.progress?.memorizationScore || 65, fullMark: 100 },
    { subject: 'Tajweed', score: progressData?.progress?.tajweedScore || 80, fullMark: 100 },
    { subject: 'Understanding', score: progressData?.progress?.understandingScore || 70, fullMark: 100 },
    { subject: 'Fluency', score: progressData?.progress?.fluencyScore || 85, fullMark: 100 },
  ];

  const recentClasses = [
    { date: '2024-01-15', topic: 'Surah Al-Fatiha', status: 'completed', score: 95 },
    { date: '2024-01-10', topic: 'Tajweed Rules', status: 'completed', score: 88 },
    { date: '2024-01-05', topic: 'Para 1 Revision', status: 'completed', score: 92 },
    { date: '2024-01-02', topic: 'Surah Al-Baqarah', status: 'completed', score: 85 },
  ];

  if (loading) {
    return (
      <Container>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" gutterBottom>
              Learning Progress
            </Typography>
            <Typography color="textSecondary">
              Track your Quran learning journey
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button variant="outlined" startIcon={<Download />}>
              Download Report
            </Button>
            <Button variant="contained" startIcon={<Share />}>
              Share Progress
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <Book />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    Para {progressData?.progress?.currentPara || 1}
                  </Typography>
                  <Typography color="textSecondary">Current Para</Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(progressData?.progress?.currentPara || 1) * 3.33}
                sx={{ mt: 2, height: 8, borderRadius: 5 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'success.light' }}>
                  <Schedule />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {progressData?.progress?.attendancePercentage || 0}%
                  </Typography>
                  <Typography color="textSecondary">Attendance</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'warning.light' }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {progressData?.progress?.ayatCompleted || 0}
                  </Typography>
                  <Typography color="textSecondary">Ayat Completed</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'info.light' }}>
                  <Star />
                </Avatar>
                <Box>
                  <Typography variant="h4">4.8</Typography>
                  <Typography color="textSecondary">Avg. Score</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Progress Chart */}
          <Paper sx={{ p: 3, mb: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Attendance Trend
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>

          {/* Skills Radar */}
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Skills Assessment
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar
                  name="Your Score"
                  dataKey="score"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Recent Performance */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Classes
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Topic</TableCell>
                    <TableCell align="right">Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentClasses.map((classItem, index) => (
                    <TableRow key={index}>
                      <TableCell>{classItem.date}</TableCell>
                      <TableCell>{classItem.topic}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${classItem.score}%`}
                          size="small"
                          color={
                            classItem.score >= 90
                              ? 'success'
                              : classItem.score >= 70
                              ? 'warning'
                              : 'error'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button fullWidth sx={{ mt: 2 }}>
              View All Classes
            </Button>
          </Paper>

          {/* Milestones */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Milestones
            </Typography>
            <Box sx={{ mt: 2 }}>
              {[
                { label: 'Completed Surah Al-Fatiha', completed: true },
                { label: 'Memorized First Juz', completed: true },
                { label: 'Perfect Tajweed Test', completed: true },
                { label: 'Complete 50 Classes', completed: false },
                { label: 'Memorize 5 Surahs', completed: false },
              ].map((milestone, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    py: 1,
                    borderBottom: index < 4 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <CheckCircle
                    sx={{
                      mr: 2,
                      color: milestone.completed ? 'success.main' : 'grey.400',
                    }}
                  />
                  <Typography
                    sx={{
                      color: milestone.completed ? 'text.primary' : 'text.secondary',
                      textDecoration: milestone.completed ? 'none' : 'line-through',
                    }}
                  >
                    {milestone.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Teacher Remarks */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Teacher's Remarks
            </Typography>
            <Card variant="outlined" sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Last updated: Jan 15, 2024
                </Typography>
                <Typography paragraph>
                  "Excellent progress in Tajweed rules. Focus on memorization consistency. 
                  Recitation has improved significantly."
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="caption" color="textSecondary">
                    - Sheikh Ahmed
                  </Typography>
                  <Button size="small">View All</Button>
                </Box>
              </CardContent>
            </Card>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Progress;