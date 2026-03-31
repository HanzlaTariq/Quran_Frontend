import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Chip,
  Divider,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Upload,
  Save,
  Cancel,
  Verified,
  School,
  Work,
  Language,
  AccessTime,
  Public,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [newQualification, setNewQualification] = useState({ degree: '', institution: '', year: '' });
  const [newExpertise, setNewExpertise] = useState('');
  const [workingHours, setWorkingHours] = useState({ startTime: '09:00', endTime: '17:00' });
  const [quranSettingsForm, setQuranSettingsForm] = useState({
    translation: {
      language: 'en',
      translator: 'Sahih International',
      enabled: true,
    },
    tafseer: {
      enabled: false,
      tafseerName: 'Ibn Kathir',
    },
    font: {
      arabicSize: 22,
      translationSize: 16,
      fontFamily: 'Uthmani',
    },
    audio: {
      reciter: 'Abdul Basit',
      autoPlay: false,
    },
    readingMode: {
      showArabic: true,
      showAyahNumber: true,
    },
  });

  const countryToTimezone = {
    Pakistan: 'Asia/Karachi',
    UAE: 'Asia/Dubai',
    UK: 'Europe/London',
    USA: 'America/New_York',
    Bangladesh: 'Asia/Dhaka',
    India: 'Asia/Kolkata',
    Egypt: 'Africa/Cairo',
    SaudiArabia: 'Asia/Riyadh',
    England: 'Europe/London',
  };

  const countries = [
    { value: 'Pakistan', label: 'Pakistan' },
    { value: 'UAE', label: 'UAE' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'USA', label: 'United States' },
    { value: 'Bangladesh', label: 'Bangladesh' },
    { value: 'India', label: 'India' },
    { value: 'Egypt', label: 'Egypt' },
    { value: 'SaudiArabia', label: 'Saudi Arabia' },
    { value: 'England', label: 'England' },
  ];

  const translators = [
    'Sahih International',
    'Yusuf Ali',
    'Pickthall',
    'Muhsin Khan',
  ];

  const tafseerNames = ['Ibn Kathir', 'Al-Jalalayn', 'Al-Qurtubi'];

  const reciters = [
    'Abdul Basit',
    'Mishary Alafasy',
    'Saad Al-Ghamdi',
    'Saud Al-Shuraim',
    'Abdur Rahman As-Sudais',
    'Maher Al-Muaiqly',
  ];

  const fontFamilies = ['Uthmani', 'Me Quran', 'Indopak', 'Nastaleeq'];

  useEffect(() => {
    fetchProfile();
    if (user?._id) {
      fetchQuranSettings();
    }
  }, []);

  const handleCountryChange = (e) => {
    const country = e.target.value;
    const tz = countryToTimezone[country] || formData.user?.timezone;
    setFormData({
      ...formData,
      user: {
        ...formData.user,
        country,
        timezone: tz,
      },
    });
  };

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/ulma/profile');
      setProfile(response.data);
      setFormData(response.data);
      setWorkingHours(response.data.workingHours || { startTime: '09:00', endTime: '17:00' });
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load profile');
      setLoading(false);
    }
  };

  const fetchQuranSettings = async () => {
    try {
      const response = await axios.get(`/api/quran/settings/${user._id}`);
      if (response.data) {
        setQuranSettingsForm((prev) => ({
          ...prev,
          ...response.data,
          translation: { ...prev.translation, ...response.data.translation },
          tafseer: { ...prev.tafseer, ...response.data.tafseer },
          font: { ...prev.font, ...response.data.font },
          audio: { ...prev.audio, ...response.data.audio },
          readingMode: { ...prev.readingMode, ...response.data.readingMode },
        }));
      }
    } catch (error) {
      toast.error('Failed to load Quran settings');
    }
  };

  const handleQuranSettingsChange = (section, field, value) => {
    setQuranSettingsForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSaveQuranSettings = async () => {
    try {
      await axios.put(`/api/quran/settings/${user._id}`, quranSettingsForm);
      toast.success('Quran settings updated successfully');
    } catch (error) {
      toast.error('Failed to update Quran settings');
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        user: {
          phone: formData.user?.phone,
          timezone: formData.user?.timezone,
          country: formData.user?.country,
          languages: formData.user?.languages,
        },
        bio: formData.bio,
        experience: formData.experience,
        expertise: formData.expertise,
        qualifications: formData.qualifications,
        workingHours,
      };

      const response = await axios.put('/api/ulma/profile', payload);

      setProfile(response.data.ulma);
      setFormData(response.data.ulma);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };



  const handleAddQualification = () => {
    if (newQualification.degree && newQualification.institution && newQualification.year) {
      const updatedQualifications = [...(formData.qualifications || []), newQualification];
      setFormData({ ...formData, qualifications: updatedQualifications });
      setNewQualification({ degree: '', institution: '', year: '' });
    }
  };

  const handleAddExpertise = () => {
    if (newExpertise && !formData.expertise?.includes(newExpertise)) {
      const updatedExpertise = [...(formData.expertise || []), newExpertise];
      setFormData({ ...formData, expertise: updatedExpertise });
      setNewExpertise('');
    }
  };

  const handleRemoveQualification = (index) => {
    const updatedQualifications = formData.qualifications.filter((_, i) => i !== index);
    setFormData({ ...formData, qualifications: updatedQualifications });
  };

  const handleRemoveExpertise = (expertise) => {
    const updatedExpertise = formData.expertise.filter(e => e !== expertise);
    setFormData({ ...formData, expertise: updatedExpertise });
  };

  const handleProfileImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profileImage', file);

      try {
        const response = await axios.post('/api/ulma/upload-profile-image', formData);
        setProfile({ ...profile, profileImage: response.data.imageUrl });
        toast.success('Profile image updated');
      } catch (error) {
        toast.error('Failed to upload image');
      }
    }
  };

  if (loading) {
    return <Container>Loading...</Container>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Profile Settings</Typography>
          <Box>
            {isEditing ? (
              <>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  sx={{ mr: 2 }}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(profile);
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Left Column - Personal Info */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box position="relative" display="inline-block">
                  <Avatar
                    src={profile?.profileImage}
                    sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                  />
                  {isEditing && (
                    <IconButton
                      component="label"
                      sx={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Upload />
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleProfileImageUpload}
                      />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="h5" gutterBottom>
                  Sheikh {user?.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {profile?.role || 'Ulama'}
                </Typography>
                <Chip
                  icon={<Verified />}
                  label="Verified Teacher"
                  color="success"
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <AccessTime sx={{ mr: 1 }} />
                  Working Hours
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Start Time"
                      type="time"
                      value={workingHours.startTime}
                      onChange={(e) => setWorkingHours({ ...workingHours, startTime: e.target.value })}
                      disabled={!isEditing}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="End Time"
                      type="time"
                      value={workingHours.endTime}
                      onChange={(e) => setWorkingHours({ ...workingHours, endTime: e.target.value })}
                      disabled={!isEditing}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Public sx={{ mr: 1 }} />
                  Timezone & Language
                </Typography>
                <TextField
                  fullWidth
                  label="Country"
                  value={formData?.user?.country || ''}
                  onChange={handleCountryChange}
                  disabled={!isEditing}
                  select
                  sx={{ mb: 2 }}
                >
                  {countries.map((c) => (
                    <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  label="Timezone"
                  value={formData?.user?.timezone || 'Asia/Karachi'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      user: {
                        ...formData.user,
                        timezone: e.target.value,
                      },
                    })
                  }

                  disabled={!isEditing}
                  select
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="Asia/Karachi">Pakistan Time (PKT)</MenuItem>
                  <MenuItem value="Asia/Dubai">UAE Time (GST)</MenuItem>
                  <MenuItem value="Europe/London">UK Time (GMT)</MenuItem>
                  <MenuItem value="America/New_York">US Eastern Time (EST)</MenuItem>
                  <MenuItem value="Asia/Dhaka">Bangladesh Time (BST)</MenuItem>
                  <MenuItem value="Asia/Kolkata">India Time (IST)</MenuItem>
                  <MenuItem value="Africa/Cairo">Egypt Time (EET)</MenuItem>
                  <MenuItem value="Asia/Riyadh">Saudi Arabia Time (AST)</MenuItem>
                  <MenuItem value="Europe/London">England Time (GMT)</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Languages"
                  value={(formData?.user?.languages || []).join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      user: {
                        ...formData.user,
                        languages: e.target.value.split(', '),
                      },
                    })
                  }

                  disabled={!isEditing}
                  placeholder="English, Urdu, Arabic"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Detailed Info */}
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={user?.email}
                      disabled
                      InputProps={{
                        startAdornment: <InputAdornment position="start">📧</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={formData.user?.phone || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          user: {
                            ...formData.user,
                            phone: e.target.value,
                          },
                        })
                      }
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">📱</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      multiline
                      rows={4}
                      value={formData.bio || ''}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Tell students about yourself, your teaching style, and experience..."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Qualifications */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" gutterBottom>
                    <School sx={{ mr: 1 }} />
                    Qualifications
                  </Typography>
                  {isEditing && (
                    <Button startIcon={<Add />} onClick={handleAddQualification}>
                      Add
                    </Button>
                  )}
                </Box>

                {isEditing && (
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Degree"
                        value={newQualification.degree}
                        onChange={(e) => setNewQualification({ ...newQualification, degree: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Institution"
                        value={newQualification.institution}
                        onChange={(e) => setNewQualification({ ...newQualification, institution: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Year"
                        type="number"
                        value={newQualification.year}
                        onChange={(e) => setNewQualification({ ...newQualification, year: e.target.value })}
                      />
                    </Grid>
                  </Grid>
                )}

                <List>
                  {(formData.qualifications || []).map((qual, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={qual.degree}
                        secondary={`${qual.institution} • ${qual.year}`}
                      />
                      {isEditing && (
                        <ListItemSecondaryAction>
                          <IconButton onClick={() => handleRemoveQualification(index)}>
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* Expertise */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" gutterBottom>
                    <Work sx={{ mr: 1 }} />
                    Expertise Areas
                  </Typography>
                  {isEditing && (
                    <Button startIcon={<Add />} onClick={handleAddExpertise}>
                      Add
                    </Button>
                  )}
                </Box>

                {isEditing && (
                  <Box display="flex" gap={2} mb={2}>
                    <TextField
                      fullWidth
                      label="Add Expertise"
                      value={newExpertise}
                      onChange={(e) => setNewExpertise(e.target.value)}
                      select
                    >
                      <MenuItem value="nazra">Nazra Quran</MenuItem>
                      <MenuItem value="hifz">Hifz</MenuItem>
                      <MenuItem value="tajweed">Tajweed</MenuItem>
                      <MenuItem value="tafseer">Tafseer</MenuItem>
                      <MenuItem value="fiqh">Fiqh</MenuItem>
                      <MenuItem value="arabic">Arabic Language</MenuItem>
                    </TextField>
                  </Box>
                )}

                <Box display="flex" flexWrap="wrap" gap={1}>
                  {(formData.expertise || []).map((exp, index) => (
                    <Chip
                      key={index}
                      label={exp.charAt(0).toUpperCase() + exp.slice(1)}
                      onDelete={isEditing ? () => handleRemoveExpertise(exp) : undefined}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Teaching Experience
                </Typography>
                <TextField
                  fullWidth
                  label="Years of Experience"
                  type="number"
                  value={formData.experience || 0}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  disabled={!isEditing}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">years</InputAdornment>,
                  }}
                />
              </CardContent>
            </Card>

            {/* Quran Settings */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quran Preferences
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(quranSettingsForm.translation?.enabled)}
                          onChange={(e) => handleQuranSettingsChange('translation', 'enabled', e.target.checked)}
                        />
                      }
                      label="Show Translation"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Translation Language</InputLabel>
                      <Select
                        value={quranSettingsForm.translation?.language || 'en'}
                        label="Translation Language"
                        onChange={(e) => handleQuranSettingsChange('translation', 'language', e.target.value)}
                      >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="ur">Urdu</MenuItem>
                        <MenuItem value="fr">French</MenuItem>
                        <MenuItem value="tr">Turkish</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Translator</InputLabel>
                      <Select
                        value={quranSettingsForm.translation?.translator || 'Sahih International'}
                        label="Translator"
                        onChange={(e) => handleQuranSettingsChange('translation', 'translator', e.target.value)}
                      >
                        {translators.map((translator) => (
                          <MenuItem key={translator} value={translator}>{translator}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(quranSettingsForm.tafseer?.enabled)}
                          onChange={(e) => handleQuranSettingsChange('tafseer', 'enabled', e.target.checked)}
                        />
                      }
                      label="Enable Tafseer"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Tafseer</InputLabel>
                      <Select
                        value={quranSettingsForm.tafseer?.tafseerName || 'Ibn Kathir'}
                        label="Tafseer"
                        onChange={(e) => handleQuranSettingsChange('tafseer', 'tafseerName', e.target.value)}
                      >
                        {tafseerNames.map((tafseer) => (
                          <MenuItem key={tafseer} value={tafseer}>{tafseer}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Arabic Font Size"
                      value={quranSettingsForm.font?.arabicSize || 22}
                      onChange={(e) => handleQuranSettingsChange('font', 'arabicSize', Number(e.target.value))}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Translation Font Size"
                      value={quranSettingsForm.font?.translationSize || 16}
                      onChange={(e) => handleQuranSettingsChange('font', 'translationSize', Number(e.target.value))}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Font Family</InputLabel>
                      <Select
                        value={quranSettingsForm.font?.fontFamily || 'Uthmani'}
                        label="Font Family"
                        onChange={(e) => handleQuranSettingsChange('font', 'fontFamily', e.target.value)}
                      >
                        {fontFamilies.map((font) => (
                          <MenuItem key={font} value={font}>{font}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Reciter</InputLabel>
                      <Select
                        value={quranSettingsForm.audio?.reciter || 'Abdul Basit'}
                        label="Reciter"
                        onChange={(e) => handleQuranSettingsChange('audio', 'reciter', e.target.value)}
                      >
                        {reciters.map((reciter) => (
                          <MenuItem key={reciter} value={reciter}>{reciter}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(quranSettingsForm.audio?.autoPlay)}
                          onChange={(e) => handleQuranSettingsChange('audio', 'autoPlay', e.target.checked)}
                        />
                      }
                      label="Auto Play"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={quranSettingsForm.readingMode?.showArabic !== false}
                          onChange={(e) => handleQuranSettingsChange('readingMode', 'showArabic', e.target.checked)}
                        />
                      }
                      label="Show Arabic"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(quranSettingsForm.readingMode?.showAyahNumber)}
                          onChange={(e) => handleQuranSettingsChange('readingMode', 'showAyahNumber', e.target.checked)}
                        />
                      }
                      label="Show Ayah Number"
                    />
                  </Grid>
                </Grid>

                <Box mt={2} display="flex" justifyContent="flex-end">
                  <Button variant="contained" startIcon={<Save />} onClick={handleSaveQuranSettings}>
                    Save Quran Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Settings;