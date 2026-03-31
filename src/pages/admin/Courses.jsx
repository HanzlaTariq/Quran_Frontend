import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
  Switch,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  alpha,
  useTheme,
  Avatar,
  Stack,
  Divider,
  Badge,
  Skeleton,
  useMediaQuery,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  School,
  AttachMoney,
  Schedule,
  ExpandMore,
  CheckCircle,
  Cancel,
  MenuBook,
  AccessTime,
  MoreVert,
  Bookmark,
  Numbers,
  MilitaryTech,
  Star,
  TrendingUp,
  CalendarToday,
  Category,
  Visibility,
  Close,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Courses = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 6,
    monthlyFee: 50,
    curriculum: [{ week: 1, topic: '', description: '', paraCovered: 1, surahCovered: ['Al-Fatiha'] }],
    requirements: [],
    isActive: true,
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    // Immediate loading state
    setLoading(true);
    
    // Small delay to show loading state (remove in production)
    const timer = setTimeout(() => {
      fetchCourses();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await axios.get('/api/admin/courses');
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (course = null) => {
    if (course) {
      setFormData(course);
      setEditing(true);
      setSelectedCourse(course);
    } else {
      setFormData({
        name: '',
        description: '',
        duration: 6,
        monthlyFee: 50,
        curriculum: [{ week: 1, topic: '', description: '', paraCovered: 1, surahCovered: ['Al-Fatiha'] }],
        requirements: [],
        isActive: true,
      });
      setEditing(false);
      setSelectedCourse(null);
    }
    setDialogOpen(true);
  };

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setViewDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCourse(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCurriculumChange = (index, field, value) => {
    const newCurriculum = [...formData.curriculum];
    newCurriculum[index][field] = value;
    setFormData(prev => ({
      ...prev,
      curriculum: newCurriculum,
    }));
  };

  const addCurriculumItem = () => {
    setFormData(prev => ({
      ...prev,
      curriculum: [
        ...prev.curriculum,
        {
          week: prev.curriculum.length + 1,
          topic: '',
          description: '',
          paraCovered: 1,
          surahCovered: ['Al-Fatiha'],
        },
      ],
    }));
  };

  const removeCurriculumItem = (index) => {
    if (formData.curriculum.length > 1) {
      const newCurriculum = formData.curriculum.filter((_, i) => i !== index);
      newCurriculum.forEach((item, i) => {
        item.week = i + 1;
      });
      setFormData(prev => ({
        ...prev,
        curriculum: newCurriculum,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await axios.put(`/api/admin/courses/${selectedCourse._id}`, formData);
        toast.success('Course updated successfully');
      } else {
        await axios.post('/api/admin/courses', formData);
        toast.success('Course created successfully');
      }
      handleCloseDialog();
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save course');
    }
  };

  const handleToggleActive = async (courseId, currentStatus) => {
    try {
      await axios.patch(`/api/admin/courses/${courseId}/toggle-status`, {
        isActive: !currentStatus,
      });
      toast.success(`Course ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchCourses();
    } catch (error) {
      toast.error('Failed to update course status');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/admin/courses/${selectedCourse._id}`);
      toast.success('Course deleted successfully');
      setDeleteDialogOpen(false);
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete course');
    }
  };

  const getCourseColor = (courseName) => {
    const colors = {
      'Nazra': '#4361ee',
      'Hifz': '#7209b7',
      'Tajweed': '#f72585',
      'Tafseer': '#4cc9f0',
      'Arabic': '#3a86ff',
    };
    return colors[courseName] || '#4361ee';
  };

  const getCourseIcon = (courseName) => {
    const icons = {
      'Nazra': <MenuBook />,
      'Hifz': <Bookmark />,
      'Tajweed': <MilitaryTech />,
      'Tafseer': <Star />,
      'Arabic': <School />,
    };
    return icons[courseName] || <School />;
  };

  // Loading Skeletons
  const LoadingSkeleton = () => (
    <>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
          <Card sx={{ borderRadius: 3, p: 2 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <Skeleton variant="circular" width={45} height={45} />
              <Box flex={1}>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="40%" height={16} />
              </Box>
            </Box>
            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Skeleton variant="rounded" height={56} sx={{ borderRadius: 2 }} />
              </Grid>
              <Grid item xs={6}>
                <Skeleton variant="rounded" height={56} sx={{ borderRadius: 2 }} />
              </Grid>
            </Grid>
            <Skeleton variant="text" width="100%" height={40} sx={{ mb: 2 }} />
            <Box display="flex" gap={1} mb={2}>
              <Skeleton variant="rounded" width="50%" height={32} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rounded" width="50%" height={32} sx={{ borderRadius: 2 }} />
            </Box>
            <Skeleton variant="text" width="100%" height={40} />
          </Card>
        </Grid>
      ))}
    </>
  );

  const CourseCard = ({ course }) => {
    const courseColor = getCourseColor(course.name);
    
    return (
      <Card 
        sx={{ 
          position: 'relative',
          borderRadius: 3,
          background: theme.palette.background.paper,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease',
          border: `1px solid ${alpha(courseColor, 0.1)}`,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            boxShadow: `0 8px 20px ${alpha(courseColor, 0.15)}`,
            borderColor: alpha(courseColor, 0.3),
          },
        }}
      >
        {/* Status Badge */}
        <Badge
          color={course.isActive ? 'success' : 'error'}
          variant="dot"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 2,
            '& .MuiBadge-badge': {
              width: 12,
              height: 12,
              borderRadius: '50%',
              boxShadow: '0 0 0 2px white',
            }
          }}
        />

        {/* Color Accent Line */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${courseColor}, ${alpha(courseColor, 0.3)})`,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        />

        <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" gap={1.5} mb={2}>
            <Avatar
              sx={{
                width: 45,
                height: 45,
                bgcolor: alpha(courseColor, 0.1),
                color: courseColor,
              }}
            >
              {getCourseIcon(course.name)}
            </Avatar>
            <Box flex={1}>
              <Typography variant="subtitle1" fontWeight={600} lineHeight={1.2}>
                {course.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ID: #{course._id?.slice(-6) || 'NEW'}
              </Typography>
            </Box>
          </Box>

          {/* Quick Stats */}
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Box 
                sx={{ 
                  p: 1, 
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <AccessTime sx={{ fontSize: 16, color: 'text.secondary', mb: 0.5 }} />
                <Typography variant="caption" display="block" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {course.duration}m
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box 
                sx={{ 
                  p: 1, 
                  bgcolor: alpha(theme.palette.success.main, 0.04),
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <AttachMoney sx={{ fontSize: 16, color: 'text.secondary', mb: 0.5 }} />
                <Typography variant="caption" display="block" color="text.secondary">
                  Fee
                </Typography>
                <Typography variant="body2" fontWeight={600} color="success.main">
                  ${course.monthlyFee}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Description */}
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              height: 40,
            }}
          >
            {course.description || 'No description provided'}
          </Typography>

          {/* Curriculum Preview */}
          <Box sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
              <Numbers sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {course.curriculum?.length || 0} Weeks
              </Typography>
            </Box>
            <Box display="flex" gap={0.5} flexWrap="wrap">
              {course.curriculum?.slice(0, 2).map((item, idx) => (
                <Chip
                  key={idx}
                  label={`Week ${item.week}`}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    height: 22,
                    '& .MuiChip-label': { px: 1, fontSize: '0.625rem' }
                  }}
                />
              ))}
              {(course.curriculum?.length || 0) > 2 && (
                <Chip
                  label={`+${course.curriculum.length - 2}`}
                  size="small"
                  sx={{ 
                    height: 22,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '& .MuiChip-label': { px: 1, fontSize: '0.625rem' }
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box display="flex" gap={1}>
            <Button
              fullWidth
              size="small"
              variant="outlined"
              startIcon={<Visibility />}
              onClick={() => handleViewCourse(course)}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                borderColor: alpha(courseColor, 0.3),
                color: courseColor,
                '&:hover': {
                  borderColor: courseColor,
                  bgcolor: alpha(courseColor, 0.04),
                }
              }}
            >
              View
            </Button>
            <Button
              fullWidth
              size="small"
              variant="contained"
              startIcon={<Edit />}
              onClick={() => handleOpenDialog(course)}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                bgcolor: courseColor,
                '&:hover': {
                  bgcolor: alpha(courseColor, 0.9),
                }
              }}
            >
              Edit
            </Button>
          </Box>

          {/* Footer */}
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            mt={1.5}
            pt={1.5}
            sx={{ borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}
          >
            <Box display="flex" alignItems="center" gap={0.5}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: course.isActive ? 'success.main' : 'error.main',
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {course.isActive ? 'Active' : 'Inactive'}
              </Typography>
            </Box>
            <Tooltip title={course.isActive ? 'Deactivate Course' : 'Activate Course'}>
              <Switch
                size="small"
                checked={course.isActive}
                onChange={() => handleToggleActive(course._id, course.isActive)}
                color="success"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: 'success.main',
                  }
                }}
              />
            </Tooltip>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card 
      sx={{ 
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={700} color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.2),
              color: color,
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          mb: 3, 
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.dark, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between"
          flexDirection={{ xs: 'column', sm: 'row' }}
          gap={2}
        >
          <Box display="flex" alignItems="center" gap={2} width={{ xs: '100%', sm: 'auto' }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
              }}
            >
              <School />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700} fontSize={{ xs: '1.25rem', sm: '1.5rem' }}>
                Course Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create and manage your Quran courses
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            fullWidth={isMobile}
            sx={{
              borderRadius: 2,
              px: { xs: 2, sm: 3 },
              py: 1,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            }}
          >
            New Course
          </Button>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <StatCard
              title="Total Courses"
              value={courses.length}
              icon={<Category />}
              color={theme.palette.primary.main}
              subtitle="All courses"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StatCard
              title="Active Courses"
              value={courses.filter(c => c.isActive).length}
              icon={<CheckCircle />}
              color={theme.palette.success.main}
              subtitle={`${courses.filter(c => !c.isActive).length} inactive`}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Courses Grid */}
      <Grid container spacing={2}>
        {loading ? (
          <LoadingSkeleton />
        ) : courses.length === 0 ? (
          <Grid item xs={12}>
            <Paper 
              sx={{ 
                p: { xs: 4, sm: 6 }, 
                borderRadius: 3,
                textAlign: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <School sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Courses Found
              </Typography>
              <Typography color="text.secondary" paragraph>
                Get started by creating your first course
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                fullWidth={isMobile}
              >
                Create Course
              </Button>
            </Paper>
          </Grid>
        ) : (
          courses.map((course) => (
            <Grid item key={course._id} xs={12} sm={6} md={4} lg={3}>
              <CourseCard course={course} />
            </Grid>
          ))
        )}
      </Grid>

      {/* View Course Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: { 
            borderRadius: { xs: 0, sm: 3 },
            m: { xs: 0, sm: 2 },
          }
        }}
      >
        {selectedCourse && (
          <>
            <DialogTitle sx={{ 
              bgcolor: alpha(getCourseColor(selectedCourse.name), 0.1),
              borderBottom: `1px solid ${alpha(getCourseColor(selectedCourse.name), 0.2)}`,
              position: 'relative',
            }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  sx={{
                    bgcolor: getCourseColor(selectedCourse.name),
                    color: 'white',
                  }}
                >
                  {getCourseIcon(selectedCourse.name)}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={600}>
                    {selectedCourse.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Course Details
                  </Typography>
                </Box>
                {isMobile && (
                  <IconButton onClick={() => setViewDialogOpen(false)}>
                    <Close />
                  </IconButton>
                )}
              </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ py: 3 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2">
                    {selectedCourse.description || 'No description provided'}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Duration
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarToday sx={{ fontSize: 20, color: 'primary.main' }} />
                        <Typography variant="h6">
                          {selectedCourse.duration} months
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Monthly Fee
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <AttachMoney sx={{ fontSize: 20, color: 'success.main' }} />
                        <Typography variant="h6" color="success.main">
                          ${selectedCourse.monthlyFee}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Curriculum ({selectedCourse.curriculum?.length || 0} weeks)
                  </Typography>
                  <Stack spacing={1}>
                    {selectedCourse.curriculum?.map((item, idx) => (
                      <Paper
                        key={idx}
                        variant="outlined"
                        sx={{ 
                          p: 1.5, 
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.02),
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={`Week ${item.week}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Typography variant="body2" fontWeight={500}>
                            {item.topic || 'Untitled'}
                          </Typography>
                        </Box>
                        {item.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {item.description}
                          </Typography>
                        )}
                      </Paper>
                    ))}
                  </Stack>
                </Box>

                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                  <Chip
                    icon={selectedCourse.isActive ? <CheckCircle /> : <Cancel />}
                    label={selectedCourse.isActive ? 'Active' : 'Inactive'}
                    color={selectedCourse.isActive ? 'success' : 'error'}
                    variant="outlined"
                  />
                  <Chip
                    label={`${selectedCourse.curriculum?.length || 0} Weeks`}
                    variant="outlined"
                  />
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
              <Button 
                onClick={() => setViewDialogOpen(false)}
                fullWidth={isMobile}
                sx={{ order: { xs: 2, sm: 1 } }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => {
                  setViewDialogOpen(false);
                  handleOpenDialog(selectedCourse);
                }}
                fullWidth={isMobile}
                sx={{ order: { xs: 1, sm: 2 } }}
              >
                Edit Course
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add/Edit Course Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: { 
            borderRadius: { xs: 0, sm: 3 },
            m: { xs: 0, sm: 2 },
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: theme.palette.primary.main,
          color: 'white',
          borderTopLeftRadius: { xs: 0, sm: 12 },
          borderTopRightRadius: { xs: 0, sm: 12 },
          position: 'relative',
        }}>
          <Box display="flex" alignItems="center" gap={2}>
            <School />
            <Typography variant="h6">
              {editing ? 'Edit Course' : 'Create New Course'}
            </Typography>
            {isMobile && (
              <IconButton 
                onClick={handleCloseDialog}
                sx={{ ml: 'auto', color: 'white' }}
              >
                <Close />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                <InputLabel>Course Name</InputLabel>
                <Select
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  label="Course Name"
                  required
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="Nazra">Nazra (Quran Reading)</MenuItem>
                  <MenuItem value="Hifz">Hifz (Memorization)</MenuItem>
                  <MenuItem value="Tajweed">Tajweed (Pronunciation)</MenuItem>
                  <MenuItem value="Tafseer">Tafseer (Interpretation)</MenuItem>
                  <MenuItem value="Arabic">Arabic Language</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="duration"
                label="Duration (months)"
                type="number"
                value={formData.duration}
                onChange={handleInputChange}
                required
                size={isMobile ? 'small' : 'medium'}
                sx={{ borderRadius: 2 }}
                InputProps={{
                  startAdornment: <CalendarToday sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="description"
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                required
                size={isMobile ? 'small' : 'medium'}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="monthlyFee"
                label="Monthly Fee ($)"
                type="number"
                value={formData.monthlyFee}
                onChange={handleInputChange}
                required
                size={isMobile ? 'small' : 'medium'}
                sx={{ borderRadius: 2 }}
                InputProps={{
                  startAdornment: <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" height="100%" gap={1}>
                <Switch
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  color="success"
                  size={isMobile ? 'small' : 'medium'}
                />
                <Typography variant="body2">Active Course</Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                <MenuBook color="primary" />
                Curriculum
              </Typography>
              {formData.curriculum.map((item, index) => (
                <Accordion 
                  key={index} 
                  defaultExpanded={index === 0}
                  sx={{ 
                    borderRadius: 2, 
                    mb: 1,
                    '&:before': { display: 'none' },
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                      <Chip 
                        label={`Week ${item.week}`} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                      <Typography variant="body2" fontWeight={500}>
                        {item.topic || 'New Week'}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Topic"
                          value={item.topic}
                          onChange={(e) => handleCurriculumChange(index, 'topic', e.target.value)}
                          size="small"
                          sx={{ borderRadius: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          multiline
                          rows={2}
                          value={item.description}
                          onChange={(e) => handleCurriculumChange(index, 'description', e.target.value)}
                          size="small"
                          sx={{ borderRadius: 2 }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Para Covered"
                          type="number"
                          value={item.paraCovered}
                          onChange={(e) => handleCurriculumChange(index, 'paraCovered', parseInt(e.target.value))}
                          size="small"
                          inputProps={{ min: 1, max: 30 }}
                          sx={{ borderRadius: 2 }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Surah Covered"
                          value={item.surahCovered?.join(', ')}
                          onChange={(e) => handleCurriculumChange(index, 'surahCovered', e.target.value.split(',').map(s => s.trim()))}
                          size="small"
                          placeholder="Al-Fatiha, Al-Baqarah"
                          sx={{ borderRadius: 2 }}
                        />
                      </Grid>
                      {formData.curriculum.length > 1 && (
                        <Grid item xs={12}>
                          <Button
                            color="error"
                            startIcon={<Delete />}
                            onClick={() => removeCurriculumItem(index)}
                            size="small"
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                            fullWidth={isMobile}
                          >
                            Remove Week
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
              <Button
                startIcon={<Add />}
                onClick={addCurriculumItem}
                sx={{ mt: 2, borderRadius: 2 }}
                variant="outlined"
                fullWidth
                size={isMobile ? 'small' : 'medium'}
              >
                Add Week
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
          <Button 
            onClick={handleCloseDialog}
            fullWidth={isMobile}
            sx={{ order: { xs: 2, sm: 1 } }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            fullWidth={isMobile}
            sx={{ 
              borderRadius: 2,
              px: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              order: { xs: 1, sm: 2 }
            }}
          >
            {editing ? 'Update Course' : 'Create Course'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        fullScreen={isMobile}
        PaperProps={{
          sx: { 
            borderRadius: { xs: 0, sm: 3 },
            m: { xs: 0, sm: 2 },
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: alpha(theme.palette.error.main, 0.1),
          color: theme.palette.error.main,
          position: 'relative',
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Delete />
            <Typography variant="h6">Delete Course</Typography>
            {isMobile && (
              <IconButton 
                onClick={() => setDeleteDialogOpen(false)}
                sx={{ ml: 'auto' }}
              >
                <Close />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              borderRadius: 2,
            }}
          >
            Are you sure you want to delete "{selectedCourse?.name}"?
          </Alert>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. All course data will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            fullWidth={isMobile}
            sx={{ order: { xs: 2, sm: 1 } }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleDelete}
            fullWidth={isMobile}
            sx={{ 
              borderRadius: 2,
              px: 3,
              order: { xs: 1, sm: 2 }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Courses;