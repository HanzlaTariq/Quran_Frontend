import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Search,
  FilterList,
  Edit,
  Visibility,
  Message,
  TrendingUp,
  Schedule,
  Book,
  People,
  LocationOn,
  Phone,
  Email,
  MoreVert,
  Refresh,
  Add,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const UlmaStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    course: '',
    status: '',
    country: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, [pagination.page, filters, activeTab]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        search: searchTerm,
      };

      const { data } = await axios.get('/api/ulma/students', { params });
      setStudents(data.students);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = () => {
    fetchStudents();
  };

  const handleViewStudent = async (student) => {
    try {
      const { data } = await axios.get(`/api/ulma/students/${student._id}`);
      setSelectedStudent(data);
      setStudentDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load student details');
    }
  };

  const handleUpdateProgress = (student) => {
    setSelectedStudent(student);
    setProgressDialogOpen(true);
  };

  const handleSendMessage = (studentId) => {
    navigate(`/ulma/messages/${studentId}`);
  };

  const handleScheduleClass = (studentId) => {
    navigate(`/ulma/schedule/create?student=${studentId}`);
  };

  const StudentRow = ({ student }) => (
    <TableRow>
      <TableCell>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={student.user?.profileImage}>
            {student.user?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {student.user?.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {student.user?.email}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          label={student.courses?.join(', ') || student.currentCourse?.name || student.currentCourse}
          size="small"
          color="primary"
          variant="outlined"
        />
      </TableCell>
      <TableCell>
        <Box display="flex" alignItems="center">
          <Box sx={{ flexGrow: 1, mr: 1 }}>
            <LinearProgress
              variant="determinate"
              value={(student.progress?.currentPara || 1) * 3.33}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
          <Typography variant="caption">
            Para {student.progress?.currentPara || 1}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          label={`${student.progress?.attendanceRate?.toFixed(0) || 0}%`}
          size="small"
          color={
            student.progress?.attendanceRate >= 90
              ? 'success'
              : student.progress?.attendanceRate >= 70
              ? 'warning'
              : 'error'
          }
        />
      </TableCell>
      <TableCell>
        {format(new Date(student.enrollmentDate), 'MMM d, yyyy')}
      </TableCell>
      <TableCell>
        <Box display="flex" gap={1}>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => handleViewStudent(student)}>
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title="Send Message">
            <IconButton size="small" onClick={() => handleSendMessage(student._id)}>
              <Message />
            </IconButton>
          </Tooltip>
          <Tooltip title="Schedule Class">
            <IconButton size="small" onClick={() => handleScheduleClass(student._id)}>
              <Schedule />
            </IconButton>
          </Tooltip>
          <Tooltip title="Update Progress">
            <IconButton size="small" onClick={() => handleUpdateProgress(student)}>
              <TrendingUp />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );

  const renderStudentDetails = () => {
    if (!selectedStudent) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar sx={{ width: 80, height: 80 }}>
              {selectedStudent.student?.user?.name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedStudent.student?.user?.name}</Typography>
              <Typography color="textSecondary">{selectedStudent.student?.user?.email}</Typography>
              <Box display="flex" gap={2} mt={1}>
                <Chip
                  label={selectedStudent.student?.courses?.join(', ') || selectedStudent.student?.currentCourse?.name || selectedStudent.student?.currentCourse}
                  color="primary"
                  size="small"
                />
                <Chip
                  label={selectedStudent.student?.subscription?.isActive ? 'Active' : 'Inactive'}
                  color={selectedStudent.student?.subscription?.isActive ? 'success' : 'error'}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Contact Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Email fontSize="small" color="action" />
                  <Typography variant="body2">{selectedStudent.student?.user?.email}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2">{selectedStudent.student?.user?.phone}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2">
                    {selectedStudent.student?.user?.country} • {selectedStudent.student?.user?.timezone}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Learning Statistics
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Total Classes
                  </Typography>
                  <Typography variant="h6">
                    {selectedStudent.statistics?.totalClasses || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Attendance
                  </Typography>
                  <Typography variant="h6" color={
                    selectedStudent.statistics?.attendanceRate >= 90
                      ? 'success.main'
                      : selectedStudent.statistics?.attendanceRate >= 70
                      ? 'warning.main'
                      : 'error.main'
                  }>
                    {selectedStudent.statistics?.attendanceRate?.toFixed(1) || 0}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Current Para
                  </Typography>
                  <Typography variant="h6">
                    {selectedStudent.student?.progress?.currentPara || 1}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Enrolled Since
                  </Typography>
                  <Typography variant="body2">
                    {format(new Date(selectedStudent.student?.enrollmentDate), 'MMM d, yyyy')}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Progress */}
        {selectedStudent.recentProgress && selectedStudent.recentProgress.length > 0 && (
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Recent Progress Updates
                </Typography>
                <List dense>
                  {selectedStudent.recentProgress.slice(0, 5).map((progress, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">
                              {progress.remarks}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {format(new Date(progress.date), 'MMM d')}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption">
                            Para {progress.paraCompleted} • {progress.surahCompleted}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Recent Classes */}
        {selectedStudent.classes && selectedStudent.classes.length > 0 && (
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Recent Classes
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Topic</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Attendance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedStudent.classes.slice(0, 5).map((classItem) => (
                        <TableRow key={classItem._id}>
                          <TableCell>
                            {format(new Date(classItem.date), 'MMM d')}
                          </TableCell>
                          <TableCell>
                            {classItem.startTime} - {classItem.endTime}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {classItem.topic}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={classItem.status}
                              size="small"
                              color={
                                classItem.status === 'completed'
                                  ? 'success'
                                  : classItem.status === 'ongoing'
                                  ? 'warning'
                                  : 'primary'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {classItem.attendance ? (
                              <CheckCircle color="success" fontSize="small" />
                            ) : (
                              <Cancel color="error" fontSize="small" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              My Students
            </Typography>
            <Typography color="textSecondary">
              Manage and monitor your students' progress
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={fetchStudents}>
              Refresh
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/ulma/schedule/create')}>
              Schedule Class
            </Button>
          </Box>
        </Box>

        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ mb: 3 }}>
          <Tab label="All Students" />
          <Tab label="Active" />
          <Tab label="Needs Attention" />
        </Tabs>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Course</InputLabel>
                <Select
                  value={filters.course}
                  label="Course"
                  onChange={(e) => handleFilterChange('course', e.target.value)}
                >
                  <MenuItem value="">All Courses</MenuItem>
                  <MenuItem value="nazra">Nazra</MenuItem>
                  <MenuItem value="hifz">Hifz</MenuItem>
                  <MenuItem value="tajweed">Tajweed</MenuItem>
                  <MenuItem value="tafseer">Tafseer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Country"
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<FilterList />}
                onClick={handleSearch}
              >
                Filter
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Students Table */}
        {loading ? (
          <LinearProgress />
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Attendance</TableCell>
                    <TableCell>Enrolled</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => (
                    <StudentRow key={student._id} student={student} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {students.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No students found matching your criteria.
              </Alert>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={pagination.pages}
                  page={pagination.page}
                  onChange={(e, page) => setPagination(prev => ({ ...prev, page }))}
                  color="primary"
                />
              </Box>
            )}

            {/* Stats */}
            <Grid container spacing={2} sx={{ mt: 3 }}>
              <Grid item xs={6} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <People color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5">{pagination.total}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Students
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <TrendingUp color="success" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5">
                      {students.filter(s => s.progress?.attendanceRate >= 90).length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Good Attendance
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Book color="warning" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5">
                      {students.reduce((sum, s) => sum + (s.progress?.currentPara || 1), 0)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Paras Covered
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Schedule color="info" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5">
                      {students.reduce((sum, s) => sum + (s.progress?.totalClasses || 0), 0)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Classes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Paper>

      {/* Student Details Dialog */}
      <Dialog
        open={studentDialogOpen}
        onClose={() => setStudentDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Student Details</DialogTitle>
        <DialogContent dividers>
          {renderStudentDetails()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStudentDialogOpen(false)}>Close</Button>
          <Button
            variant="outlined"
            onClick={() => handleSendMessage(selectedStudent?.student?._id)}
          >
            Send Message
          </Button>
          <Button
            variant="contained"
            onClick={() => handleScheduleClass(selectedStudent?.student?._id)}
          >
            Schedule Class
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Progress Dialog */}
      <Dialog open={progressDialogOpen} onClose={() => setProgressDialogOpen(false)}>
        <DialogTitle>Update Student Progress</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, minWidth: 400 }}>
            <TextField
              fullWidth
              label="Current Para"
              type="number"
              margin="normal"
              inputProps={{ min: 1, max: 30 }}
            />
            <TextField
              fullWidth
              label="Current Surah"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Ayat Completed"
              type="number"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Remarks"
              multiline
              rows={3}
              margin="normal"
              placeholder="Add progress notes..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProgressDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">
            Update Progress
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UlmaStudents;