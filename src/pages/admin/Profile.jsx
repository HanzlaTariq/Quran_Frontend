// pages/admin/Profile.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  TextField,
  Button,
  Divider,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  CameraAlt as CameraIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

const AdminProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Admin User',
    email: 'admin@quranacademy.com',
    phone: '+92 300 1234567',
    role: 'Super Admin',
    joinDate: '2023-01-15',
    lastLogin: '2024-01-20 10:30 AM',
  });

  const handleSave = () => {
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Left Column - Profile Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: 40,
                    bgcolor: 'primary.main',
                    mb: 2,
                  }}
                >
                  AU
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                    bgcolor: 'background.paper',
                  }}
                  size="small"
                >
                  <CameraIcon fontSize="small" />
                </IconButton>
              </Box>

              <Typography variant="h5">{profileData.name}</Typography>
              <Typography color="text.secondary" gutterBottom>
                {profileData.role}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Member since {profileData.joinDate}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Login
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {profileData.lastLogin}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Email
                </Typography>
                <Typography variant="body2">
                  {profileData.email}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Phone
                </Typography>
                <Typography variant="body2">
                  {profileData.phone}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LockIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Change Password</Typography>
              </Box>
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                margin="normal"
                size="small"
              />
              <TextField
                fullWidth
                type="password"
                label="New Password"
                margin="normal"
                size="small"
              />
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                margin="normal"
                size="small"
              />
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => toast.success('Password updated!')}
              >
                Update Password
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Edit Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Personal Information</Typography>
                <Button
                  startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                  variant="contained"
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </Box>

              {isEditing && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  You are in edit mode. Make your changes and click Save.
                </Alert>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Role"
                    value={profileData.role}
                    disabled
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    multiline
                    rows={4}
                    placeholder="Tell us about yourself..."
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
              </Grid>

              {isEditing && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom>
                    Notification Settings
                  </Typography>
                  <Grid container spacing={2}>
                    {/* Add notification checkboxes here */}
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              {/* Add activity log list here */}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminProfile;