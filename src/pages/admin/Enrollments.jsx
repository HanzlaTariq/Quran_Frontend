// pages/admin/Enrollments.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Autocomplete,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Payment as PaymentIcon,
  CalendarToday as CalendarIcon,

} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import adminService from '../../services/admin';
import timezoneUtils from '../../utils/timezoneUtils';

const AdminEnrollments = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalEnrollments, setTotalEnrollments] = useState(0);

  // Form data for new enrollment
  const [formData, setFormData] = useState({
    studentId: '',
    ulmaId: '',
    course: '',
    monthlyFee: '',
    schedule: {
      days: [],
      startTime: '',
      endTime: ''
    }
  });

  // Dropdown data
  const [students, setStudents] = useState([]);
  const [ulmas, setUlmas] = useState([]);
  const [courses, setCourses] = useState([]);

  const weekDays = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  // Fetch enrollments
  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
      };
      const response = await adminService.getEnrollments(params);
      setEnrollments(response.enrollments || []);
      setTotalEnrollments(response.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  };

  // Fetch dropdown data
  const fetchDropdownData = async () => {
    try {
      const [studentsRes, ulmasRes, coursesRes] = await Promise.all([
        adminService.getAllStudents(),
        adminService.getAllUlmas(),
        adminService.getAllCourses(),
      ]);
      setStudents(studentsRes.users || []);
      setUlmas(ulmasRes.ulma || []);
      setCourses(coursesRes || []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      toast.error('Failed to fetch dropdown data');
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const handleAddEnrollment = () => {
    setFormData({
      studentId: '',
      studentName: '',
      ulmaId: '',
      course: '',
      monthlyFee: '',
      schedule: {
        days: [],
        startTime: '',
        endTime: ''
      }
    });
    setOpenDialog(true);
  };

  const handleViewDetails = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedEnrollment(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      studentId: '',
      ulmaId: '',
      course: '',
      monthlyFee: '',
      schedule: {
        days: [],
        startTime: '',
        endTime: ''
      }
    });
  };

  const handleFormChange = (field, value) => {
    if (field.startsWith('schedule.')) {
      const scheduleField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          [scheduleField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleDayChange = (day) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: prev.schedule.days.includes(day)
          ? prev.schedule.days.filter(d => d !== day)
          : [...prev.schedule.days, day]
      }
    }));
  };

  const handleCreateEnrollment = async () => {
    try {
      if (!formData.studentId || !formData.ulmaId || !formData.course || !formData.schedule.days.length) {
        toast.error('Please fill all required fields');
        return;
      }

      await adminService.createEnrollment(formData);
      toast.success('Enrollment created successfully!');
      handleCloseDialog();
      fetchEnrollments();
    } catch (error) {
      console.error('Error creating enrollment:', error);
      toast.error(error.response?.data?.message || 'Failed to create enrollment');
    }
  };

  const handleApproveEnrollment = async (enrollmentId) => {
    try {
      await adminService.approveEnrollment(enrollmentId);
      toast.success('Enrollment approved successfully!');
      fetchEnrollments();
    } catch (error) {
      console.error('Error approving enrollment:', error);
      toast.error('Failed to approve enrollment');
    }
  };

  const handleRejectEnrollment = async (enrollmentId) => {
    try {
      await adminService.updateEnrollmentStatus(enrollmentId, { status: 'reject' });
      toast.success('Enrollment rejected successfully!');
      fetchEnrollments();
    } catch (error) {
      console.error('Error rejecting enrollment:', error);
      toast.error('Failed to reject enrollment');
    }
  };

  const handleDeleteEnrollment = async (enrollmentId) => {
    try {
      await adminService.deleteEnrollment(enrollmentId);
      toast.success('Enrollment deleted successfully!');
      fetchEnrollments();
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      toast.error('Failed to delete enrollment');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{
      p: { xs: 2, sm: 3 },
      minHeight: '100vh',
      bgcolor: 'grey.50'
    }}>
      <Box sx={{
        mb: 4,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2
      }}>
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 1
            }}
          >
            Student Enrollments
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage and track all student enrollments in the system
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleAddEnrollment}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontWeight: 'bold',
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          New Enrollment
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: 3,
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{
                p: 3,
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper'
              }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search students by name, course, or ulma..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'grey.50',
                      '&:hover': {
                        bgcolor: 'grey.100'
                      },
                      '&.Mui-focused': {
                        bgcolor: 'background.paper'
                      }
                    }
                  }}
                />
              </Box>

              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{
                      bgcolor: 'primary.main',
                      '& th': {
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.875rem'
                      }
                    }}>
                      <TableCell>Student</TableCell>
                      <TableCell>Course</TableCell>
                      <TableCell>Ulma</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Enrollment Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Fee</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                          <CircularProgress size={40} />
                          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            Loading enrollments...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : enrollments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                          <Typography variant="h6" color="textSecondary">
                            No enrollments found
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Try adjusting your search criteria
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      enrollments.map((enrollment) => (
                        <TableRow
                          key={enrollment._id}
                          sx={{
                            '&:hover': {
                              bgcolor: 'action.hover',
                              cursor: 'pointer'
                            },
                            transition: 'background-color 0.2s ease-in-out'
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: 'primary.main',
                                  fontSize: '0.875rem'
                                }}
                              >
                                {(enrollment.student?.user?.name || 'N').charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {enrollment.student?.user?.name || 'N/A'}
                                </Typography>
                                <Typography variant="caption" color="textSecondary" sx={{ display: { xs: 'none', lg: 'block' } }}>
                                  {enrollment.student?.user?.email || ''}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {enrollment.course?.name || enrollment.course}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {enrollment.ulma?.user?.name || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                            <Typography variant="body2">
                              {new Date(enrollment.createdAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={enrollment.status}
                              color={getStatusColor(enrollment.status)}
                              size="small"
                              sx={{
                                fontWeight: 'medium',
                                textTransform: 'capitalize'
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                            <Typography variant="body2" fontWeight="medium" color="success.main">
                              $ {enrollment.monthlyFee}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleViewDetails(enrollment)}
                                  sx={{
                                    '&:hover': {
                                      bgcolor: 'primary.light',
                                      color: 'white'
                                    }
                                  }}
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              {enrollment.status === 'pending' && (
                                <>
                                  <Tooltip title="Approve">
                                    <IconButton
                                      size="small"
                                      color="success"
                                      onClick={() => handleApproveEnrollment(enrollment._id)}
                                      sx={{
                                        '&:hover': {
                                          bgcolor: 'success.light',
                                          color: 'white'
                                        }
                                      }}
                                    >
                                      <ApproveIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleRejectEnrollment(enrollment._id)}
                                      sx={{
                                        '&:hover': {
                                          bgcolor: 'error.light',
                                          color: 'white'
                                        }
                                      }}
                                    >
                                      <RejectIcon />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteEnrollment(enrollment._id)}
                                  sx={{
                                    '&:hover': {
                                      bgcolor: 'error.light',
                                      color: 'white'
                                        }
                                      }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{
                    p: 2,
                    borderTop: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper'
                  }}>
                    <TablePagination
                      component="div"
                      count={totalEnrollments}
                      page={page}
                      onPageChange={handleChangePage}
                      rowsPerPage={rowsPerPage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      rowsPerPageOptions={[5, 10, 25, 50]}
                      sx={{
                        '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

      {/* Enrollment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedEnrollment ? 'Edit Enrollment' : 'New Enrollment'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Autocomplete
              fullWidth
              options={students}
              getOptionLabel={(option) => option.name || ''}
              value={students.find(student => student._id === formData.studentId) || null}
              onChange={(event, newValue) => {
                handleFormChange('studentId', newValue ? newValue._id : '');
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Student"
                  required
                  placeholder="Type to search students..."
                />
              )}
              noOptionsText="No students found"
            />

            <FormControl fullWidth required>
              <InputLabel>Select Course</InputLabel>
              <Select
                value={formData.course}
                onChange={(e) => handleFormChange('course', e.target.value)}
                label="Select Course"
              >
                {courses.map((course) => (
                  <MenuItem key={course._id} value={course._id}>
                    {course.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Autocomplete
              fullWidth
              options={ulmas}
              getOptionLabel={(option) => option.user?.name || ''}
              value={ulmas.find(ulma => ulma._id === formData.ulmaId) || null}
              onChange={(event, newValue) => {
                handleFormChange('ulmaId', newValue ? newValue._id : '');
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Ulma"
                  required
                  placeholder="Type to search ulmas..."
                />
              )}
              noOptionsText="No ulmas found"
            />

            <TextField
              fullWidth
              label="Monthly Fee"
              type="number"
              value={formData.monthlyFee}
              onChange={(e) => handleFormChange('monthlyFee', e.target.value)}
              required
            />

            <Typography variant="h6" sx={{ mt: 2 }}>Schedule</Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {weekDays.map((day) => (
                <FormControlLabel
                  key={day.value}
                  control={
                    <Checkbox
                      checked={formData.schedule.days.includes(day.value)}
                      onChange={() => handleDayChange(day.value)}
                    />
                  }
                  label={day.label}
                />
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={formData.schedule.startTime}
                onChange={(e) => handleFormChange('schedule.startTime', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={formData.schedule.endTime}
                onChange={(e) => handleFormChange('schedule.endTime', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateEnrollment}
            disabled={!formData.studentId || !formData.ulmaId || !formData.course || !formData.schedule.days.length}
          >
            Create Enrollment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enrollment Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={handleCloseDetailsDialog}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <PersonIcon />
          Enrollment Details
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedEnrollment && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Student Information */}
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <PersonIcon color="primary" />
                    <Typography variant="h6" color="primary">Student Information</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Name</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedEnrollment.student?.user?.name || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Email</Typography>
                      <Typography variant="body1">
                        {selectedEnrollment.student?.user?.email || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Phone</Typography>
                      <Typography variant="body1">
                        {selectedEnrollment.student?.user?.phone || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Age</Typography>
                      <Typography variant="body1">
                        {selectedEnrollment.student?.age || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Ulma Information */}
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <SchoolIcon color="secondary" />
                    <Typography variant="h6" color="secondary">Ulma Information</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Name</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedEnrollment.ulma?.user?.name || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Email</Typography>
                      <Typography variant="body1">
                        {selectedEnrollment.ulma?.user?.email || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Phone</Typography>
                      <Typography variant="body1">
                        {selectedEnrollment.ulma?.user?.phone || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Experience</Typography>
                      <Typography variant="body1">
                        {selectedEnrollment.ulma?.experience ? `${selectedEnrollment.ulma.experience} years` : 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Course Information */}
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <SchoolIcon color="success" />
                    <Typography variant="h6" sx={{ color: 'success.main' }}>Course Information</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Course Name</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {(() => {
                          // First try to get name from populated course object
                          if (selectedEnrollment.course?.name) {
                            return selectedEnrollment.course.name;
                          }

                          // If course is an object but name is missing, try to find it in courses array
                          if (selectedEnrollment.course && typeof selectedEnrollment.course === 'object') {
                            const courseFromList = courses.find(c => c._id === selectedEnrollment.course._id);
                            if (courseFromList?.name) {
                              return courseFromList.name;
                            }
                          }

                          // If course is a string ID, look it up in courses array
                          if (selectedEnrollment.course && typeof selectedEnrollment.course === 'string') {
                            const courseFromList = courses.find(c => c._id === selectedEnrollment.course);
                            if (courseFromList?.name) {
                              return courseFromList.name;
                            }
                          }

                          return 'N/A';
                        })()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Duration</Typography>
                      <Typography variant="body1">
                        {(() => {
                          // First try to get duration from populated course object
                          if (selectedEnrollment.course?.duration) {
                            return `${selectedEnrollment.course.duration} months`;
                          }

                          // If course is an object but duration is missing, try to find it in courses array
                          if (selectedEnrollment.course && typeof selectedEnrollment.course === 'object') {
                            const courseFromList = courses.find(c => c._id === selectedEnrollment.course._id);
                            if (courseFromList?.duration) {
                              return `${courseFromList.duration} months`;
                            }
                          }

                          // If course is a string ID, look it up in courses array
                          if (selectedEnrollment.course && typeof selectedEnrollment.course === 'string') {
                            const courseFromList = courses.find(c => c._id === selectedEnrollment.course);
                            if (courseFromList?.duration) {
                              return `${courseFromList.duration} months`;
                            }
                          }

                          // If not available, try to calculate from schedule
                          const displayTimes = timezoneUtils.getScheduleDisplayTimes(
                            selectedEnrollment.schedule,
                            timezoneUtils.getUserTimezone(selectedEnrollment.student?.user)
                          );

                          if (displayTimes?.duration) {
                            return `${displayTimes.duration} minutes per class`;
                          }

                          return 'N/A';
                        })()}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Schedule Information */}
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <ScheduleIcon color="info" />
                    <Typography variant="h6" sx={{ color: 'info.main' }}>Schedule Information</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Days</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {selectedEnrollment.schedule?.days?.map((day) => (
                          <Chip
                            key={day}
                            label={day.charAt(0).toUpperCase() + day.slice(1)}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )) || 'N/A'}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Time</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {(() => {
                          // Get student's local time
                          const studentDisplayTimes = timezoneUtils.getScheduleDisplayTimes(
                            selectedEnrollment.schedule,
                            timezoneUtils.getUserTimezone(selectedEnrollment.student?.user)
                          );

                          // Get teacher's local time
                          const teacherDisplayTimes = timezoneUtils.getScheduleDisplayTimes(
                            selectedEnrollment.schedule,
                            timezoneUtils.getUserTimezone(selectedEnrollment.ulma?.user)
                          );

                          return (
                            <>
                              {studentDisplayTimes && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" sx={{ minWidth: 60, color: 'primary.main', fontWeight: 'medium' }}>
                                    Student:
                                  </Typography>
                                  <Typography variant="body2">
                                    {studentDisplayTimes.startTime12} - {studentDisplayTimes.endTime12}
                                  </Typography>
                                </Box>
                              )}
                              {teacherDisplayTimes && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" sx={{ minWidth: 60, color: 'secondary.main', fontWeight: 'medium' }}>
                                    Teacher:
                                  </Typography>
                                  <Typography variant="body2">
                                    {teacherDisplayTimes.startTime12} - {teacherDisplayTimes.endTime12}
                                  </Typography>
                                </Box>
                              )}
                              {(!studentDisplayTimes && !teacherDisplayTimes) && (
                                <Typography variant="body2">N/A</Typography>
                              )}
                            </>
                          );
                        })()}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <PaymentIcon color="warning" />
                    <Typography variant="h6" sx={{ color: 'warning.main' }}>Payment Information</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Monthly Fee</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        $ {selectedEnrollment.monthlyFee || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Billing Status</Typography>
                      <Chip
                        label={selectedEnrollment.billing?.feeStatus || 'N/A'}
                        color={selectedEnrollment.billing?.feeStatus === 'paid' ? 'success' : 'warning'}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Enrollment Status */}
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <CalendarIcon color="error" />
                    <Typography variant="h6" sx={{ color: 'error.main' }}>Enrollment Status</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Status</Typography>
                      <Chip
                        label={selectedEnrollment.status}
                        color={getStatusColor(selectedEnrollment.status)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Enrollment Date</Typography>
                      <Typography variant="body1">
                        {new Date(selectedEnrollment.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Grid>
                    {selectedEnrollment.processedAt && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">Processed Date</Typography>
                        <Typography variant="body1">
                          {new Date(selectedEnrollment.processedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseDetailsDialog} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminEnrollments;