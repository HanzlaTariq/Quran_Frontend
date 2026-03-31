import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  IconButton,
  Chip,
  Divider,
  LinearProgress,
  Alert,
  Tab,
  Tabs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Edit,
  Save,
  CameraAlt,
  School,
  Work,
  Language,
  LocationOn,
  Schedule,
  MonetizationOn,
  Star,
  Add,
  Delete,
  Upload,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const UlmaProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({});
  const [newQualification, setNewQualification] = useState({
    degree: '',
    institution: '',
    year: '',
  });
  const [newCertificate, setNewCertificate] = useState({
    name: '',
    file: null,
  });
  const [availability, setAvailability] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get('/api/ulma/profile');
      setProfile(data);
      setFormData({
        bio: data.bio || '',
        hourlyRate: data.hourlyRate || 0,
        experience: data.experience || 0,
        maxStudentsPerDay: data.maxStudentsPerDay || 20,
        expertise: data.expertise || [],
      });
      setAvailability(data.availability || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      await axios.put('/api/ulma/profile', {
        ...formData,
        availability,
      });
      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleAddQualification = () => {
    if (!newQualification.degree || !newQualification.institution || !newQualification.year) {
      toast.error('Please fill all qualification fields');
      return;
    }

    setProfile(prev => ({
      ...prev,
      qualifications: [...(prev.qualifications || []), newQualification],
    }));

    setNewQualification({ degree: '', institution: '', year: '' });
    toast.success('Qualification added');
  };

  const handleRemoveQualification = (index) => {
    setProfile(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index),
    }));
  };

  const handleAddExpertise = (expertise) => {
    if (!formData.expertise.includes(expertise)) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, expertise],
      }));
    }
  };

  const handleRemoveExpertise = (expertise) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter(e => e !== expertise),
    }));
  };

  const handleAddAvailability = () => {
    setAvailability(prev => [
      ...prev,
      { day: 'monday', startTime: '09:00', endTime: '10:00', maxStudents: 5 },
    ]);
  };

  const handleUpdateAvailability = (index, field, value) => {
    const newAvailability = [...availability];
    newAvailability[index][field] = value;
    setAvailability(newAvailability);
  };

  const handleRemoveAvailability = (index) => {
    setAvailability(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'profile') {
      const formData = new FormData();
      formData.append('profileImage', file);

      try {
        await axios.put('/api/ulma/profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Profile picture updated');
        fetchProfile();
      } catch (error) {
        toast.error('Failed to upload profile picture');
      }
    }
  };

  if (loading) {
    return (
      <Container>
        <LinearProgress />
      </Container>
    );
  }

  const expertiseOptions = ['nazra', 'hifz', 'tajweed', 'tafseer'];
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        {/* Profile Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
          <Box display="flex" alignItems="center" gap={3}>
            <Box position="relative">
              <Avatar
                sx={{ width: 120, height: 120 }}
                src={profile?.user?.profileImage}
              >
                {profile?.user?.name?.charAt(0)}
              </Avatar>
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
                component="label"
              >
                <CameraAlt />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'profile')}
                />
              </IconButton>
            </Box>
            <Box>
              <Typography variant="h4" gutterBottom>
                {profile?.user?.name}
              </Typography>
              <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                <Chip
                  icon={<School />}
                  label="Ulma"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<Star />}
                  label={`${profile?.rating?.average?.toFixed(1) || 0.0} (${profile?.rating?.totalReviews || 0} reviews)`}
                  color="warning"
                />
                <Chip
                  icon={<Work />}
                  label={`${profile?.experience || 0} years experience`}
                />
              </Box>
            </Box>
          </Box>
          <Box>
            {editing ? (
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            ) : (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </Box>

        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ mb: 3 }}>
          <Tab label="Basic Info" />
          <Tab label="Qualifications" />
          <Tab label="Availability" />
          <Tab label="Teaching Settings" />
        </Tabs>

        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Personal Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Name"
                        value={profile?.user?.name}
                        disabled
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={profile?.user?.email}
                        disabled
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={profile?.user?.phone}
                        disabled={!editing}
                        name="phone"
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          user: { ...prev.user, phone: e.target.value }
                        }))}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationOn color="action" />
                        <Typography variant="body2">
                          {profile?.user?.country} • {profile?.user?.timezone}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Language color="action" />
                        <Typography variant="body2">
                          Languages: {profile?.user?.languages?.join(', ')}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Bio
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    value={formData.bio}
                    onChange={handleInputChange}
                    name="bio"
                    disabled={!editing}
                    placeholder="Tell students about your teaching style, experience, and approach..."
                    variant="outlined"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Expertise
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Select your areas of expertise:
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {expertiseOptions.map((exp) => (
                        <Chip
                          key={exp}
                          label={exp.charAt(0).toUpperCase() + exp.slice(1)}
                          onClick={editing ? () => handleAddExpertise(exp) : undefined}
                          onDelete={
                            editing && formData.expertise.includes(exp)
                              ? () => handleRemoveExpertise(exp)
                              : undefined
                          }
                          color={formData.expertise.includes(exp) ? 'primary' : 'default'}
                          variant={formData.expertise.includes(exp) ? 'filled' : 'outlined'}
                          disabled={!editing}
                        />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">Qualifications</Typography>
                    {editing && (
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={handleAddQualification}
                      >
                        Add Qualification
                      </Button>
                    )}
                  </Box>

                  {editing && (
                    <Paper sx={{ p: 2, mb: 3 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Degree"
                            value={newQualification.degree}
                            onChange={(e) => setNewQualification(prev => ({
                              ...prev,
                              degree: e.target.value,
                            }))}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Institution"
                            value={newQualification.institution}
                            onChange={(e) => setNewQualification(prev => ({
                              ...prev,
                              institution: e.target.value,
                            }))}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Year"
                            type="number"
                            value={newQualification.year}
                            onChange={(e) => setNewQualification(prev => ({
                              ...prev,
                              year: e.target.value,
                            }))}
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  )}

                  <List>
                    {profile?.qualifications?.map((qual, index) => (
                      <ListItem
                        key={index}
                        secondaryAction={
                          editing && (
                            <IconButton
                              edge="end"
                              onClick={() => handleRemoveQualification(index)}
                            >
                              <Delete />
                            </IconButton>
                          )
                        }
                      >
                        <ListItemText
                          primary={qual.degree}
                          secondary={`${qual.institution} (${qual.year})`}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {(!profile?.qualifications || profile.qualifications.length === 0) && (
                    <Alert severity="info">
                      No qualifications added yet. Add your qualifications to build trust with students.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Certificates
                  </Typography>
                  {editing ? (
                    <Box sx={{ mb: 3 }}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<Upload />}
                      >
                        Upload Certificate
                        <input
                          type="file"
                          hidden
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </Button>
                    </Box>
                  ) : null}

                  <Alert severity="info">
                    Certificates help verify your qualifications and build student trust.
                    Upload scanned copies of your certifications.
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">Teaching Availability</Typography>
                    {editing && (
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={handleAddAvailability}
                      >
                        Add Time Slot
                      </Button>
                    )}
                  </Box>

                  {editing && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      Set your available time slots. Students will be able to book classes during these times.
                    </Alert>
                  )}

                  <Grid container spacing={2}>
                    {availability.map((slot, index) => (
                      <Grid item xs={12} key={index}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={3}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Day</InputLabel>
                                <Select
                                  value={slot.day}
                                  label="Day"
                                  onChange={(e) => handleUpdateAvailability(index, 'day', e.target.value)}
                                  disabled={!editing}
                                >
                                  {daysOfWeek.map((day) => (
                                    <MenuItem key={day} value={day}>
                                      {day.charAt(0).toUpperCase() + day.slice(1)}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={6} md={2}>
                              <TextField
                                fullWidth
                                label="Start Time"
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => handleUpdateAvailability(index, 'startTime', e.target.value)}
                                disabled={!editing}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                              />
                            </Grid>
                            <Grid item xs={6} md={2}>
                              <TextField
                                fullWidth
                                label="End Time"
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => handleUpdateAvailability(index, 'endTime', e.target.value)}
                                disabled={!editing}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                              />
                            </Grid>
                            <Grid item xs={6} md={2}>
                              <TextField
                                fullWidth
                                label="Max Students"
                                type="number"
                                value={slot.maxStudents}
                                onChange={(e) => handleUpdateAvailability(index, 'maxStudents', e.target.value)}
                                disabled={!editing}
                                size="small"
                                inputProps={{ min: 1, max: 10 }}
                              />
                            </Grid>
                            <Grid item xs={6} md={3}>
                              <Chip
                                label={`${slot.startTime} - ${slot.endTime}`}
                                icon={<Schedule />}
                                variant="outlined"
                              />
                            </Grid>
                            {editing && (
                              <Grid item xs={12} md={2}>
                                <IconButton
                                  color="error"
                                  onClick={() => handleRemoveAvailability(index)}
                                >
                                  <Delete />
                                </IconButton>
                              </Grid>
                            )}
                          </Grid>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>

                  {availability.length === 0 && (
                    <Alert severity="warning">
                      No availability set. Add your available time slots to start receiving class bookings.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Daily Limits
                  </Typography>
                  <TextField
                    fullWidth
                    label="Maximum Students Per Day"
                    type="number"
                    value={formData.maxStudentsPerDay}
                    onChange={handleInputChange}
                    name="maxStudentsPerDay"
                    disabled={!editing}
                    margin="normal"
                    helperText="Maximum number of students you can teach in a day"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Teaching Settings
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Hourly Rate ($)"
                    type="number"
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    name="hourlyRate"
                    disabled={!editing}
                    margin="normal"
                    InputProps={{
                      startAdornment: <MonetizationOn color="action" sx={{ mr: 1 }} />,
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Years of Experience"
                    type="number"
                    value={formData.experience}
                    onChange={handleInputChange}
                    name="experience"
                    disabled={!editing}
                    margin="normal"
                  />

                  <FormControlLabel
                    control={<Switch checked={true} disabled={!editing} />}
                    label="Accept New Students"
                    sx={{ mt: 2 }}
                  />

                  <FormControlLabel
                    control={<Switch checked={true} disabled={!editing} />}
                    label="Send Class Reminders"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Statistics
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Total Students"
                        secondary={profile?.statistics?.totalStudents || 0}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Classes Conducted"
                        secondary={profile?.statistics?.totalClasses || 0}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Upcoming Classes"
                        secondary={profile?.statistics?.upcomingClasses || 0}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Average Rating"
                        secondary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Star color="warning" />
                            {profile?.rating?.average?.toFixed(1) || 0.0}
                            <Typography variant="caption" color="textSecondary">
                              ({profile?.rating?.totalReviews || 0} reviews)
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {editing && (
          <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <Button
              variant="outlined"
              onClick={() => {
                setEditing(false);
                fetchProfile();
              }}
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSave}>
              Save Changes
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default UlmaProfile;