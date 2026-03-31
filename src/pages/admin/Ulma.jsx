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
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Rating,
  List,
  ListItem,
  ListItemText, 
} from '@mui/material';
import {
  Search,
  FilterList,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Cancel,
  Pending,
  MoreVert,
  Refresh,
  Download,
  School,
  Person,
  LocationOn,
  Language,
  Work,
  Schedule,
  ExpandMore,
  Email,
  Phone,
  Star,
  Chat,
  Block,
  PersonAdd,
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const AdminUlma = () => {
  const [ulmaList, setUlmaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    expertise: '',
    country: '',
    approvalStatus: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [selectedUlma, setSelectedUlma] = useState(null);
  const [ulmaDialogOpen, setUlmaDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editingWorkingHours, setEditingWorkingHours] = useState(false);
  const [workingHoursForm, setWorkingHoursForm] = useState({ startTime: '', endTime: '' });
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    active: 0,
    inactive: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUlma();
    fetchStats();
  }, [pagination.page, filters, activeTab]);

  const fetchUlma = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        search: searchTerm,
        status: activeTab === 1 ? 'approved' : activeTab === 2 ? 'pending' : '',
      };

      const { data } = await axios.get('/api/admin/ulma', { params });
      setUlmaList(data.ulma);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching ulma:', error);
      toast.error('Failed to load ulma');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/api/admin/dashboard/stats');
      setStats({
        total: data.stats?.totalUlma || 0,
        approved: data.stats?.approvedUlma || 0,
        pending: data.pendingUlma?.length || 0,
        active: data.stats?.activeUlma || 0,
        inactive: 0, // You would calculate this from API
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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
    fetchUlma();
  };

  const handleViewUlma = (ulma) => {
    setSelectedUlma(ulma);
    setEditingWorkingHours(false);
    setUlmaDialogOpen(true);
  };

  const handleApproveUlma = async (ulmaId) => {
    try {
      await axios.put(`/api/admin/ulma/${ulmaId}/approve`);
      toast.success('Ulma approved successfully');
      fetchUlma();
      fetchStats();
      setApprovalDialogOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve ulma');
    }
  };

  const handleRejectUlma = async (ulmaId) => {
    try {
      await axios.put(`/api/admin/ulma/${ulmaId}/reject`, { 
        reason: 'Does not meet requirements' 
      });
      toast.success('Ulma rejected');
      fetchUlma();
      fetchStats();
      setApprovalDialogOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject ulma');
    }
  };

  const handleToggleActive = async (ulmaId, currentStatus) => {
    try {
      await axios.put(`/api/admin/users/${ulmaId}/toggle-active`);
      toast.success(`Ulma ${currentStatus ? 'deactivated' : 'activated'}`);
      fetchUlma();
    } catch (error) {
      toast.error('Failed to update ulma status');
    }
  };

  const handleDeleteUlma = async (ulmaId) => {
    if (!window.confirm('Are you sure you want to delete this ulma? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/ulma/${ulmaId}`);
      toast.success('Ulma deleted successfully');
      fetchUlma();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete ulma');
    }
  };

  const handleEditWorkingHours = () => {
    setWorkingHoursForm({
      startTime: selectedUlma?.workingHours?.startTime || '09:00',
      endTime: selectedUlma?.workingHours?.endTime || '17:00',
    });
    setEditingWorkingHours(true);
  };

  const handleUpdateWorkingHours = async () => {
    try {
      await axios.put(`/api/admin/ulma/${selectedUlma._id}/working-hours`, {
        workingHours: workingHoursForm,
      });
      toast.success('Working hours updated successfully');
      setEditingWorkingHours(false);
      fetchUlma();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update working hours');
    }
  };

  const UlmaRow = ({ ulma }) => (
    <TableRow>
      <TableCell>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={ulma.user?.profileImage}>
            {ulma.user?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {ulma.user?.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {ulma.user?.email}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Box display="flex" flexWrap="wrap" gap={0.5}>
          {ulma.expertise?.slice(0, 2).map((exp, idx) => (
            <Chip key={idx} label={exp} size="small" />
          ))}
          {ulma.expertise?.length > 2 && (
            <Chip label={`+${ulma.expertise.length - 2}`} size="small" />
          )}
        </Box>
      </TableCell>
      <TableCell>
        {ulma.user?.country}
      </TableCell>
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          <Rating value={ulma.rating?.average || 0} size="small" readOnly />
          <Typography variant="caption">
            ({ulma.rating?.totalReviews || 0})
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          label={ulma.isApproved ? 'Approved' : 'Pending'}
          size="small"
          color={ulma.isApproved ? 'success' : 'warning'}
          variant="outlined"
        />
      </TableCell>
      <TableCell>
        <Chip
          label={ulma.user?.isActive ? 'Active' : 'Inactive'}
          size="small"
          color={ulma.user?.isActive ? 'success' : 'error'}
        />
      </TableCell>
      <TableCell>
        <Box display="flex" gap={1}>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => handleViewUlma(ulma)}>
              <Visibility />
            </IconButton>
          </Tooltip>
          
          {!ulma.isApproved && (
            <>
              <Tooltip title="Approve">
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => {
                    setSelectedUlma(ulma);
                    setApprovalDialogOpen(true);
                  }}
                >
                  <CheckCircle />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRejectUlma(ulma._id)}
                >
                  <Cancel />
                </IconButton>
              </Tooltip>
            </>
          )}
          
          <Tooltip title="Toggle Active">
            <Switch
              size="small"
              checked={ulma.user?.isActive}
              onChange={() => handleToggleActive(ulma.user?._id, ulma.user?.isActive)}
            />
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );

  const renderUlmaDetails = () => {
    if (!selectedUlma) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar sx={{ width: 100, height: 100 }}>
              {selectedUlma.user?.name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h5" gutterBottom>
                {selectedUlma.user?.name}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                {selectedUlma.user?.email}
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Chip
                  icon={<School />}
                  label={`${selectedUlma.experience || 0} years experience`}
                  size="small"
                />
                <Chip
                  icon={<LocationOn />}
                  label={selectedUlma.user?.country}
                  size="small"
                />
                <Chip
                  icon={<Language />}
                  label={selectedUlma.user?.languages?.join(', ')}
                  size="small"
                />
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Contact Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Email fontSize="small" color="action" />
                  <Typography variant="body2">{selectedUlma.user?.email}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2">{selectedUlma.user?.phone}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2">
                    {selectedUlma.user?.country} • {selectedUlma.user?.timezone}
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
                Teaching Information
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Rating
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Rating value={selectedUlma.rating?.average || 0} size="small" readOnly />
                    <Typography variant="body2">
                      ({selectedUlma.rating?.totalReviews || 0})
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Max Students/Day
                  </Typography>
                  <Typography variant="body1">
                    {selectedUlma.maxStudentsPerDay || 20}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedUlma.isApproved ? 'Approved' : 'Pending'}
                    size="small"
                    color={selectedUlma.isApproved ? 'success' : 'warning'}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1">
                  Working Hours
                </Typography>
                {!editingWorkingHours && (
                  <Button size="small" color="primary" onClick={handleEditWorkingHours}>
                    Edit
                  </Button>
                )}
              </Box>
              
              {!editingWorkingHours ? (
                <Box sx={{ mt: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Schedule fontSize="small" color="action" />
                    <Typography variant="body2">
                      {selectedUlma.workingHours?.startTime || '09:00'} - {selectedUlma.workingHours?.endTime || '17:00'}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    Time zone: {selectedUlma.user?.timezone || 'UTC'}
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Start Time"
                      value={workingHoursForm.startTime}
                      onChange={(e) => setWorkingHoursForm({ ...workingHoursForm, startTime: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="End Time"
                      value={workingHoursForm.endTime}
                      onChange={(e) => setWorkingHoursForm({ ...workingHoursForm, endTime: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={handleUpdateWorkingHours}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setEditingWorkingHours(false)}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Expertise
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {selectedUlma.expertise?.map((exp, idx) => (
                  <Chip key={idx} label={exp} color="primary" />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {selectedUlma.qualifications && selectedUlma.qualifications.length > 0 && (
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Qualifications
                </Typography>
                <List dense>
                  {selectedUlma.qualifications.map((qual, idx) => (
                    <ListItem key={idx}>
                      <ListItemText
                        primary={qual.degree}
                        secondary={`${qual.institution} - ${qual.year}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {selectedUlma.bio && (
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Bio
                </Typography>
                <Typography variant="body2">
                  {selectedUlma.bio}
                </Typography>
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
              Ulma Management
            </Typography>
            <Typography color="textSecondary">
              Manage and approve Quran teachers
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchUlma}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
            >
              Export Report
            </Button>
          </Box>
        </Box>

        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ mb: 3 }}>
          <Tab label="All Ulma" />
          <Tab label="Approved" />
          <Tab label="Pending Approval" />
          <Tab label="Active" />
          <Tab label="Inactive" />
        </Tabs>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Person color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4">{stats.total}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Ulma
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4">{stats.approved}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Approved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Pending color="warning" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4">{stats.pending}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Pending
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <PersonAdd color="info" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4">{stats.active}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Active
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Block color="error" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4">{stats.inactive}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Inactive
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by name, email or expertise..."
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
                <InputLabel>Expertise</InputLabel>
                <Select
                  value={filters.expertise}
                  label="Expertise"
                  onChange={(e) => handleFilterChange('expertise', e.target.value)}
                >
                  <MenuItem value="">All Expertise</MenuItem>
                  <MenuItem value="nazra">Nazra</MenuItem>
                  <MenuItem value="hifz">Hifz</MenuItem>
                  <MenuItem value="tajweed">Tajweed</MenuItem>
                  <MenuItem value="tafseer">Tafseer</MenuItem>
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
              <FormControl fullWidth size="small">
                <InputLabel>Approval Status</InputLabel>
                <Select
                  value={filters.approvalStatus}
                  label="Approval Status"
                  onChange={(e) => handleFilterChange('approvalStatus', e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
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

        {/* Ulma Table */}
        {loading ? (
          <LinearProgress />
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ulma</TableCell>
                    <TableCell>Expertise</TableCell>
                    <TableCell>Country</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Approval</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ulmaList.map((ulma) => (
                    <UlmaRow key={ulma._id} ulma={ulma} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {ulmaList.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No ulma found matching your criteria.
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
          </>
        )}
      </Paper>

      {/* Ulma Details Dialog */}
      <Dialog
        open={ulmaDialogOpen}
        onClose={() => setUlmaDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Ulma Details</DialogTitle>
        <DialogContent dividers>
          {renderUlmaDetails()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUlmaDialogOpen(false)}>Close</Button>
          {!selectedUlma?.isApproved && (
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                handleApproveUlma(selectedUlma._id);
                setUlmaDialogOpen(false);
              }}
            >
              Approve Ulma
            </Button>
          )}
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              handleDeleteUlma(selectedUlma._id);
              setUlmaDialogOpen(false);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Confirmation Dialog */}
      <Dialog open={approvalDialogOpen} onClose={() => setApprovalDialogOpen(false)}>
        <DialogTitle>Approve Ulma</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Are you sure you want to approve this ulma?
          </Alert>
          <Typography variant="body2" color="textSecondary">
            Once approved, the ulma will be able to:
            <br />• Accept student enrollments
            <br />• Conduct live classes
            <br />• Receive payments
            <br />• Access the teaching dashboard
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleApproveUlma(selectedUlma?._id)}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUlma;