import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Download,
  Person,
  School,
  Assessment,
} from '@mui/icons-material';
import axios from 'axios';
import moment from 'moment';
import { toast } from 'react-toastify';

const MonthlyReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // 👇 attendance toggle state
  const [openAttendance, setOpenAttendance] = useState({});

  useEffect(() => {
    fetchMonthlyReport();
  }, [selectedMonth, selectedYear]);

  const fetchMonthlyReport = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/students/reports/monthly', {
        params: { month: selectedMonth, year: selectedYear },
      });
      if (res.data.success) {
        setReport(res.data.report);
      }
    } catch (err) {
      toast.error('Failed to fetch monthly report');
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (index) => {
    setOpenAttendance((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'late':
        return 'warning';
      case 'not_marked':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      case 'late':
        return 'Late';
      case 'not_marked':
        return 'Not Marked';
      default:
        return 'Not Marked';
    }
  };

  if (loading && !report) {
    return (
      <Container sx={{ mt: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!report) {
    return (
      <Container sx={{ mt: 6 }}>
        <Alert severity="info">No report available</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* HEADER */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4">Monthly Report</Typography>
        <Typography color="textSecondary">
          {report.period.monthName} {report.period.year}
        </Typography>
      </Paper>

      {/* STUDENT INFO */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" gap={2} mb={2}>
            <Person color="primary" />
            <Typography variant="h6">Student Info</Typography>
          </Box>
          <Typography><b>Name:</b> {report.student.name}</Typography>
          <Typography><b>Email:</b> {report.student.email}</Typography>
          <Typography><b>Total Courses:</b> {report.enrollments.length}</Typography>
        </CardContent>
      </Card>

      {/* COURSES */}
      {report.enrollments.map((enroll, idx) => (
        <Paper key={idx} sx={{ p: 3, mb: 4 }}>
          <Box mb={2}>
            <Typography variant="h5">📘 {enroll.course.name}</Typography>
            <Typography color="textSecondary">
              <School fontSize="small" /> Teacher: {enroll.teacher?.name || 'Not Assigned'}
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* STATS */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card><CardContent>
                <Typography variant="h4">{enroll.attendance.totalClasses}</Typography>
                <Typography>Total Classes</Typography>
              </CardContent></Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card><CardContent>
                <Typography variant="h4" color="success.main">
                  {enroll.attendance.present}
                </Typography>
                <Typography>Present</Typography>
              </CardContent></Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card><CardContent>
                <Typography variant="h4" color="error.main">
                  {enroll.attendance.absent}
                </Typography>
                <Typography>Absent</Typography>
              </CardContent></Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card><CardContent>
                <Typography variant="h4">
                  {enroll.attendance.attendancePercentage}%
                </Typography>
                <LinearProgress
                  value={enroll.attendance.attendancePercentage}
                  variant="determinate"
                />
              </CardContent></Card>
            </Grid>
          </Grid>

          {/* BUTTON */}
          <Box textAlign="right" mb={2}>
            <Button
              variant="outlined"
              startIcon={<Assessment />}
              onClick={() => toggleAttendance(idx)}
            >
              {openAttendance[idx] ? 'Hide Attendance' : 'View Attendance'}
            </Button>
          </Box>

          {/* ATTENDANCE TABLE */}
          {openAttendance[idx] && (
            <>
              <Typography variant="h6" gutterBottom>
                Daily Attendance
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Attendance</TableCell>
                      <TableCell>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {enroll.dailyAttendance?.length > 0 ? (
                      enroll.dailyAttendance.map((day, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            {moment(day.date).format('DD MMM YYYY')}
                          </TableCell>
                          <TableCell>
                            {day.startTime} - {day.endTime}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(day.attendance)}
                              color={getStatusColor(day.attendance)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{day.remarks || '-'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No attendance records
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Paper>
      ))}
    </Container>
  );
};

export default MonthlyReport;
