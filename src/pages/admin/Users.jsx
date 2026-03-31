import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Collapse,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Search,
  FilterList,
  Delete,
  Visibility,
  Block,
  CheckCircle,
  Person,
  School,
  AdminPanelSettings,
  Refresh,
  Download,
  Mail,
  Phone,
  LocationOn,
  CalendarToday,
  Language,
  Security,
  ExpandMore,
  ExpandLess,
  VerifiedUser,
  Star,
  AttachMoney,
  Schedule,
  Group,
  Public,
  Email,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const Users = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    country: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedRows, setExpandedRows] = useState({});
  const [courses, setCourses] = useState([]);
  // Fetch all courses for mapping course ID to name
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axios.get('/api/admin/courses');
        setCourses(data);
      } catch (error) {
        // Optionally show error
      }
    };
    fetchCourses();
  }, []);

  // Helper function to check if user is currently online
  const isUserOnline = (lastLogin) => {
    if (!lastLogin) return false;
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    return new Date(lastLogin) > thirtyMinutesAgo;
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters, activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        search: searchTerm,
      };

      const { data } = await axios.get('/api/admin/users', { params });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = useCallback(() => {
    fetchUsers();
  }, [searchTerm, filters]);

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await axios.put(`/api/admin/users/${userId}/toggle-active`);
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  const toggleRowExpand = (userId) => {
    setExpandedRows(prev => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (activeTab === 1) return user.role === 'student';
      if (activeTab === 2) return user.role === 'ulma';
      if (activeTab === 3) return user.role === 'admin';
      return true;
    });
  }, [users, activeTab]);

  const UserRow = ({ user, index }) => {
    const isExpanded = expandedRows[user._id];

    return (
      <>
        <motion.tr
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ 
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            transition: { duration: 0.2 }
          }}
        >
          <TableCell>
            <Box display="flex" alignItems="center" gap={2}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Avatar
                  sx={{
                    bgcolor: user.role === 'admin' 
                      ? theme.palette.error.main 
                      : user.role === 'ulma' 
                      ? theme.palette.primary.main 
                      : theme.palette.success.main,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {user.name?.charAt(0)}
                </Avatar>
              </motion.div>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {user.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {user.email}
                </Typography>
              </Box>
            </Box>
          </TableCell>
          <TableCell>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Chip
                icon={user.role === 'admin' ? <AdminPanelSettings /> : 
                       user.role === 'ulma' ? <School /> : <Person />}
                label={user.role}
                size="small"
                color={user.role === 'admin' ? 'error' : 
                       user.role === 'ulma' ? 'primary' : 'default'}
                sx={{ transition: 'all 0.3s ease' }}
              />
            </motion.div>
          </TableCell>
          <TableCell>
            <Box display="flex" flexDirection="column" gap={0.5}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                animate={{ 
                  scale: user.isActive ? [1, 1.05, 1] : 1 
                }}
                transition={{ 
                  duration: 2,
                  repeat: user.isActive ? Infinity : 0,
                  repeatType: "reverse" 
                }}
              >
                <Chip
                  label={user.isActive ? 'Active' : 'Inactive'}
                  size="small"
                  color={user.isActive ? 'success' : 'error'}
                  variant="outlined"
                />
              </motion.div>
              <Box display="flex" alignItems="center" gap={0.5}>
                <motion.div
                  animate={user.lastLogin && isUserOnline(user.lastLogin) ? 
                    { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : {}}
                  transition={{ 
                    duration: 1.5, 
                    repeat: user.lastLogin && isUserOnline(user.lastLogin) ? Infinity : 0,
                    repeatType: "reverse" 
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: user.lastLogin && isUserOnline(user.lastLogin) ? 'success.main' : 'grey.400',
                      boxShadow: user.lastLogin && isUserOnline(user.lastLogin) ? 
                        '0 0 8px rgba(76, 175, 80, 0.6)' : 'none',
                    }}
                  />
                </motion.div>
                <Typography variant="caption" color="textSecondary">
                  {user.lastLogin && isUserOnline(user.lastLogin) ? 'Online' : 'Offline'}
                </Typography>
              </Box>
            </Box>
          </TableCell>
          <TableCell>
            <Typography variant="body2">
              {user.country || 'N/A'}
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant="body2">
              {format(new Date(user.createdAt), 'MMM d, yyyy')}
            </Typography>
          </TableCell>
          <TableCell>
            <Box display="flex" gap={1}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton 
                  size="small" 
                  onClick={() => handleViewUser(user)}
                  sx={{ 
                    color: theme.palette.info.main,
                    '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.1) }
                  }}
                >
                  <Visibility />
                </IconButton>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton
                  size="small"
                  color={user.isActive ? 'warning' : 'success'}
                  onClick={() => handleToggleActive(user._id, user.isActive)}
                  sx={{ 
                    '&:hover': { bgcolor: alpha(
                      user.isActive ? theme.palette.warning.main : theme.palette.success.main, 
                      0.1
                    )}
                  }}
                >
                  {user.isActive ? <Block /> : <CheckCircle />}
                </IconButton>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteUser(user._id)}
                  sx={{ 
                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                  }}
                >
                  <Delete />
                </IconButton>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton
                  size="small"
                  onClick={() => toggleRowExpand(user._id)}
                >
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </motion.div>
            </Box>
          </TableCell>
        </motion.tr>
        
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Box sx={{ margin: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02), borderRadius: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        <Mail fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Contact
                      </Typography>
                      <Typography variant="body2">{user.email}</Typography>
                      {user.phone && (
                        <Typography variant="body2">
                          <Phone fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          {user.phone}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        <CalendarToday fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Last Login
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2">
                          {user.lastLogin ? format(new Date(user.lastLogin), 'PPpp') : 'Never'}
                        </Typography>
                        {user.lastLogin && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <motion.div
                              animate={isUserOnline(user.lastLogin) ? 
                                { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : {}}
                              transition={{ 
                                duration: 1.5, 
                                repeat: isUserOnline(user.lastLogin) ? Infinity : 0,
                                repeatType: "reverse" 
                              }}
                            >
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: isUserOnline(user.lastLogin) ? 'success.main' : 'grey.400',
                                  boxShadow: isUserOnline(user.lastLogin) ? 
                                    '0 0 8px rgba(76, 175, 80, 0.6)' : 'none',
                                }}
                              />
                            </motion.div>
                            <Chip
                              label={isUserOnline(user.lastLogin) ? 'Online' : 'Offline'}
                              size="small"
                              color={isUserOnline(user.lastLogin) ? 'success' : 'default'}
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: '20px' }}
                            />
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </motion.div>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  };

  const StatCard = ({ value, label, color, icon: Icon, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <Card 
        sx={{ 
          height: '100%',
          bgcolor: alpha(theme.palette[color].main, 0.05),
          border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: alpha(theme.palette[color].main, 0.1),
            borderColor: theme.palette[color].main,
          }
        }}
      >
        <CardContent sx={{ textAlign: 'center' }}>
          <motion.div
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          >
            <Icon sx={{ fontSize: 40, color: `${color}.main`, mb: 1 }} />
          </motion.div>
          <Typography variant="h4" color={`${color}.main`} fontWeight="bold">
            {value}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {label}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  const DetailCard = ({ title, icon: Icon, children, color = 'primary' }) => (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        sx={{ 
          height: '100%',
          bgcolor: alpha(theme.palette[color].main, 0.03),
          border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Icon sx={{ color: `${color}.main` }} />
            <Typography variant="subtitle1" fontWeight="bold" color={`${color}.main`}>
              {title}
            </Typography>
          </Box>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );

  // Helper to get course name by ID
  const getCourseNameById = (id) => {
    const course = courses.find((c) => c._id === id);
    return course ? course.name : id;
  };

  const renderUserDetails = () => {
    if (!selectedUser) return null;

    const userColor = selectedUser.role === 'admin' 
      ? 'error' 
      : selectedUser.role === 'ulma' 
      ? 'primary' 
      : 'success';

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Grid container spacing={3}>
          {/* User Profile Header */}
          <Grid item xs={12}>
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card 
                sx={{ 
                  bgcolor: alpha(theme.palette[userColor].main, 0.05),
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  border: `2px solid ${alpha(theme.palette[userColor].main, 0.2)}`,
                }}
              >
                <Box 
                  sx={{ 
                    height: 120,
                    bgcolor: alpha(theme.palette[userColor].main, 0.1),
                    position: 'relative',
                  }}
                />
                
                <CardContent sx={{ pt: 2, px: 3 }}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={8}>
                      <Box display="flex" alignItems="center" gap={3}>
                        <motion.div
                          animate={{ 
                            scale: [1, 1.05, 1],
                            rotate: [0, 5, 0]
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 100,
                              height: 100,
                              border: `4px solid ${theme.palette.background.paper}`,
                              bgcolor: theme.palette[userColor].main,
                              fontSize: 40,
                              boxShadow: theme.shadows[4],
                            }}
                          >
                            {selectedUser.name?.charAt(0).toUpperCase()}
                          </Avatar>
                        </motion.div>
                        
                        <Box>
                          <Typography variant="h5" fontWeight="bold">
                            {selectedUser.name}
                          </Typography>
                          <Typography variant="body1" color="textSecondary" gutterBottom>
                            {selectedUser.email}
                          </Typography>
                          
                          <Box display="flex" gap={2} mt={1} flexWrap="wrap">
                            <motion.div whileHover={{ scale: 1.05 }}>
                              <Chip
                                icon={selectedUser.role === 'admin' 
                                  ? <AdminPanelSettings /> 
                                  : selectedUser.role === 'ulma' 
                                  ? <School /> 
                                  : <Person />}
                                label={selectedUser.role.toUpperCase()}
                                color={userColor}
                                sx={{ fontWeight: 'bold' }}
                              />
                            </motion.div>
                            
                            <motion.div whileHover={{ scale: 1.05 }}>
                              <Chip
                                icon={selectedUser.isActive ? <CheckCircle /> : <Block />}
                                label={selectedUser.isActive ? 'ACTIVE' : 'INACTIVE'}
                                color={selectedUser.isActive ? 'success' : 'error'}
                                variant="outlined"
                              />
                            </motion.div>
                            
                            {selectedUser.isVerified && (
                              <motion.div whileHover={{ scale: 1.05 }}>
                                <Chip
                                  icon={<VerifiedUser />}
                                  label="VERIFIED"
                                  color="success"
                                  variant="outlined"
                                />
                              </motion.div>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Box display="flex" justifyContent="flex-end" gap={2}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="contained"
                            startIcon={<Email />}
                            sx={{ borderRadius: 2 }}
                          >
                            Send Email
                          </Button>
                        </motion.div>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={6}>
            <DetailCard title="Contact Information" icon={Mail} color="info">
              <Box sx={{ mt: 2 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Mail fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{selectedUser.email}</Typography>
                  </Box>
                </Box>
                
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Phone fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">
                      {selectedUser.phone || 'Not provided'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" alignItems="center" gap={2}>
                  <LocationOn fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Location
                    </Typography>
                    <Typography variant="body1">
                      {selectedUser.country || 'Unknown'} • {selectedUser.timezone || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </DetailCard>
          </Grid>

          {/* Account Information */}
          <Grid item xs={12} md={6}>
            <DetailCard title="Account Information" icon={Security} color="warning">
              <Box sx={{ mt: 2 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <CalendarToday fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Joined Date
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(selectedUser.createdAt), 'MMMM d, yyyy')}
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Schedule fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Last Login
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1">
                        {selectedUser.lastLogin 
                          ? format(new Date(selectedUser.lastLogin), 'PPpp')
                          : 'Never logged in'}
                      </Typography>
                      {selectedUser.lastLogin && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <motion.div
                            animate={isUserOnline(selectedUser.lastLogin) ? 
                              { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : {}}
                            transition={{ 
                              duration: 1.5, 
                              repeat: isUserOnline(selectedUser.lastLogin) ? Infinity : 0,
                              repeatType: "reverse" 
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: isUserOnline(selectedUser.lastLogin) ? 'success.main' : 'grey.400',
                                boxShadow: isUserOnline(selectedUser.lastLogin) ? 
                                  '0 0 8px rgba(76, 175, 80, 0.6)' : 'none',
                              }}
                            />
                          </motion.div>
                          <Chip
                            label={isUserOnline(selectedUser.lastLogin) ? 'Online' : 'Offline'}
                            size="small"
                            color={isUserOnline(selectedUser.lastLogin) ? 'success' : 'default'}
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: '20px' }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
                
                <Box display="flex" alignItems="center" gap={2}>
                  <Language fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Languages
                    </Typography>
                    <Typography variant="body1">
                      {selectedUser.languages?.join(', ') || 'Not specified'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </DetailCard>
          </Grid>

          {/* Role Specific Details */}
          {selectedUser.role === 'student' && selectedUser.studentDetails && (
            <Grid item xs={12}>
              <DetailCard title="Student Details" icon={School} color="success">
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={3}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Current Course
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedUser.studentDetails.currentCourse
                          ? getCourseNameById(selectedUser.studentDetails.currentCourse)
                          : 'Not enrolled'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Enrollment Date
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedUser.studentDetails.enrollmentDate
                          ? format(new Date(selectedUser.studentDetails.enrollmentDate), 'MMM d, yyyy')
                          : 'Not enrolled'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Subscription Status
                      </Typography>
                      <Box mt={0.5}>
                        <motion.div whileHover={{ scale: 1.05 }}>
                          <Chip
                            label={selectedUser.studentDetails.subscription?.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            color={selectedUser.studentDetails.subscription?.isActive ? 'success' : 'error'}
                            icon={selectedUser.studentDetails.subscription?.isActive ? <CheckCircle /> : <Block />}
                          />
                        </motion.div>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Monthly Fee
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <AttachMoney fontSize="small" color="success" />
                        <Typography variant="body1" fontWeight="bold">
                          ${selectedUser.studentDetails.subscription?.monthlyFee || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </DetailCard>
            </Grid>
          )}

          {selectedUser.role === 'ulma' && selectedUser.ulmaDetails && (
            <Grid item xs={12}>
              <DetailCard title="Ulma Details" icon={Group} color="primary">
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={3}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Approval Status
                      </Typography>
                      <Box mt={0.5}>
                        <motion.div whileHover={{ scale: 1.05 }}>
                          <Chip
                            label={selectedUser.ulmaDetails.isApproved ? 'Approved' : 'Pending'}
                            size="small"
                            color={selectedUser.ulmaDetails.isApproved ? 'success' : 'warning'}
                            icon={selectedUser.ulmaDetails.isApproved ? <CheckCircle /> : <Schedule />}
                          />
                        </motion.div>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Experience
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedUser.ulmaDetails.experience || 0} years
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Rating
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Star fontSize="small" color="warning" />
                        <Typography variant="body1" fontWeight="bold">
                          {selectedUser.ulmaDetails.rating?.average?.toFixed(1) || 0}/5
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ({selectedUser.ulmaDetails.rating?.count || 0} reviews)
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Students Count
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedUser.ulmaDetails.studentsCount || 0}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  {/* Expertise */}
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                        Expertise
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {selectedUser.ulmaDetails.expertise?.map((exp, idx) => (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <Chip 
                              label={exp} 
                              size="small" 
                              variant="outlined"
                              sx={{ borderColor: 'primary.main' }}
                            />
                          </motion.div>
                        )) || 'No expertise specified'}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </DetailCard>
            </Grid>
          )}

          {/* Additional Information */}
          <Grid item xs={12}>
            <DetailCard title="Additional Information" icon={Public} color="secondary">
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Account Notes
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedUser.notes || 'No notes available'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    IP Address
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedUser.lastIp || 'Not recorded'}
                  </Typography>
                </Grid>
              </Grid>
            </DetailCard>
          </Grid>
        </Grid>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 4,
              bgcolor: 'background.paper',
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <motion.div
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Typography variant="h4" gutterBottom fontWeight="bold">
                  👥 User Management
                </Typography>
                <Typography color="textSecondary">
                  Manage all platform users with ease
                </Typography>
              </motion.div>
              
              <Box display="flex" gap={2}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<Refresh />} 
                    onClick={fetchUsers}
                    sx={{ borderRadius: 2 }}
                  >
                    Refresh
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="contained" 
                    startIcon={<Download />}
                    sx={{ borderRadius: 2 }}
                  >
                    Export
                  </Button>
                </motion.div>
              </Box>
            </Box>

            {/* Stats Section */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {[
                { value: pagination.total, label: 'Total Users', color: 'primary', icon: Person },
                { value: users.filter(u => u.isActive).length, label: 'Active', color: 'success', icon: CheckCircle },
                { value: users.filter(u => u.role === 'student').length, label: 'Students', color: 'info', icon: School },
                { value: users.filter(u => u.role === 'ulma').length, label: 'Ulma', color: 'secondary', icon: Group },
              ].map((stat, index) => (
                <Grid item xs={6} md={3} key={stat.label}>
                  <StatCard {...stat} index={index} />
                </Grid>
              ))}
            </Grid>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, val) => setActiveTab(val)}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="All Users" />
                <Tab label="Students" />
                <Tab label="Ulma" />
                <Tab label="Admins" />
              </Tabs>
            </Box>

            {/* Search & Filter Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Paper 
                sx={{ 
                  p: 3, 
                  mb: 3,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <motion.div whileHover={{ scale: 1.005 }}>
                      <TextField
                        fullWidth
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        InputProps={{
                          startAdornment: (
                            <motion.div
                              animate={{ rotate: searchTerm ? 360 : 0 }}
                              transition={{ duration: 0.5 }}
                            >
                              <Search sx={{ mr: 1, color: 'action.active' }} />
                            </motion.div>
                          ),
                          sx: { borderRadius: 2 }
                        }}
                      />
                    </motion.div>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={filters.role}
                        label="Role"
                        onChange={(e) => handleFilterChange('role', e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="">All Roles</MenuItem>
                        <MenuItem value="student">Student</MenuItem>
                        <MenuItem value="ulma">Ulma</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
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
                        sx={{ borderRadius: 2 }}
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
                      sx={{ borderRadius: 2 }}
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<FilterList />}
                        onClick={handleSearch}
                        sx={{ 
                          height: 40,
                          borderRadius: 2,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        }}
                      >
                        Apply
                      </Button>
                    </motion.div>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>

            {/* Users Table */}
            <AnimatePresence>
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LinearProgress 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    }} 
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <TableContainer 
                    component={Paper} 
                    elevation={0}
                    sx={{ 
                      borderRadius: 3,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      overflow: 'hidden',
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                          {['User', 'Role', 'Status', 'Country', 'Joined', 'Actions'].map((header, index) => (
                            <TableCell key={header}>
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                              >
                                <Typography variant="subtitle2" fontWeight="bold">
                                  {header}
                                </Typography>
                              </motion.div>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <AnimatePresence>
                          {filteredUsers.map((user, index) => (
                            <UserRow key={user._id} user={user} index={index} />
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {filteredUsers.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Alert 
                        severity="info" 
                        sx={{ 
                          mt: 2, 
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                        }}
                      >
                        No users found matching your criteria.
                      </Alert>
                    </motion.div>
                  )}

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <Box display="flex" justifyContent="center" mt={3}>
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Pagination
                          count={pagination.pages}
                          page={pagination.page}
                          onChange={(e, page) => setPagination(prev => ({ ...prev, page }))}
                          color="primary"
                          sx={{
                            '& .MuiPaginationItem-root': {
                              borderRadius: 2,
                              '&.Mui-selected': {
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                              }
                            }
                          }}
                        />
                      </motion.div>
                    </Box>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Paper>
        </motion.div>

        {/* User Details Dialog */}
        <Dialog
          open={userDialogOpen}
          onClose={() => setUserDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <DialogTitle 
              sx={{ 
                bgcolor: selectedUser 
                  ? selectedUser.role === 'admin'
                    ? 'error.main'
                    : selectedUser.role === 'ulma'
                    ? 'primary.main'
                    : 'success.main'
                  : 'primary.main',
                color: 'white',
                py: 2,
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" fontWeight="bold">
                  👤 User Details
                </Typography>
                <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
                  <IconButton 
                    edge="end" 
                    color="inherit" 
                    onClick={() => setUserDialogOpen(false)}
                    size="small"
                  >
                  </IconButton>
                </motion.div>
              </Box>
            </DialogTitle>
            
            <DialogContent dividers sx={{ p: 3, overflow: 'auto', flex: 1, minHeight: 0 }}>
              {renderUserDetails()}
            </DialogContent>
            
            <DialogActions sx={{ p: 2, bgcolor: 'background.default' }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => setUserDialogOpen(false)}
                  sx={{ borderRadius: 2 }}
                >
                  Close
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => {
                    handleToggleActive(selectedUser?._id, selectedUser?.isActive);
                    setUserDialogOpen(false);
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  {selectedUser?.isActive ? 'Deactivate User' : 'Activate User'}
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    handleDeleteUser(selectedUser?._id);
                    setUserDialogOpen(false);
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  Delete User
                </Button>
              </motion.div>
            </DialogActions>
          </motion.div>
        </Dialog>
      </Container>
    </motion.div>
  );
};

export default Users;