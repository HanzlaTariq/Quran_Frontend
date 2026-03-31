// pages/admin/Reports.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  BarChart as BarChartIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { useSystemSettings } from '../../context/SystemSettingsContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminReports = () => {
  const { settings, formatCurrency } = useSystemSettings();
  const currency = settings?.payment?.currency || 'USD';
  const [reportType, setReportType] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: '2024-12-31',
  });

  // Bar Chart Data
  const barChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Students',
        data: [12, 19, 8, 15, 12, 17],
        backgroundColor: '#1a4d2e',
      },
      {
        label: `Revenue (${currency})`,
        data: [50000, 75000, 60000, 90000, 80000, 95000],
        backgroundColor: '#d4af37',
        yAxisID: 'y1',
      },
    ],
  };

  // Pie Chart Data
  const pieChartData = {
    labels: ['Active', 'Completed', 'Pending', 'Cancelled'],
    datasets: [
      {
        data: [45, 25, 15, 15],
        backgroundColor: [
          '#1a4d2e',
          '#4a7856',
          '#d4af37',
          '#d32f2f',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Students',
        },
      },
      y1: {
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: `Revenue (${currency})`,
        },
      },
    },
  };

  // Sample report data
  const reports = [
    {
      id: 1,
      title: 'Monthly Revenue Report',
      type: 'financial',
      generated: '2024-01-15',
      downloads: 45,
    },
    // Add more reports
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Reports & Analytics
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  label="Report Type"
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value="monthly">Monthly Report</MenuItem>
                  <MenuItem value="quarterly">Quarterly Report</MenuItem>
                  <MenuItem value="yearly">Yearly Report</MenuItem>
                  <MenuItem value="custom">Custom Report</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                fullWidth
                sx={{ height: '56px' }}
              >
                Generate Report
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary">Total Students</Typography>
                  <Typography variant="h4">156</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MoneyIcon sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary">Monthly Revenue</Typography>
                  <Typography variant="h4">{formatCurrency(85000)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BarChartIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary">Active Classes</Typography>
                  <Typography variant="h4">24</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary">Attendance Rate</Typography>
                  <Typography variant="h4">92%</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Enrollment & Revenue Trend
              </Typography>
              <Bar data={barChartData} options={chartOptions} height={80} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Course Status Distribution
              </Typography>
              <Pie data={pieChartData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reports History */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Generated Reports
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Generated Date</TableCell>
                  <TableCell>Downloads</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.title}</TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>{report.generated}</TableCell>
                    <TableCell>{report.downloads}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        variant="outlined"
                      >
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminReports;