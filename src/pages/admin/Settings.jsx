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
  TextField,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  Alert,
  LinearProgress,
  Tab,
  Tabs,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  Slider,
} from '@mui/material';
import {
  Save,
  Refresh,
  Security,
  Payment,
  Notifications,
  School,
  Settings as SettingsIcon,
  Language,
  Schedule,
  People,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useSystemSettings } from '../../context/SystemSettingsContext';

const Settings = () => {
  const { syncFromAdminSave, refreshSettings } = useSystemSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Quran Academy',
      siteUrl: 'https://quranacademy.com',
      contactEmail: 'support@quranacademy.com',
      contactPhone: '+923001234567',
      timezone: 'Asia/Karachi',
      defaultLanguage: 'english',
      maintenanceMode: false,
    },
    payment: {
      currency: 'USD',
      paymentMethods: ['card', 'bank', 'easypaisa', 'jazzcash'],
      taxRate: 0,
      lateFee: 10,
      gracePeriod: 7,
      autoRenewal: true,
    },
    classes: {
      defaultDuration: 60,
      maxStudentsPerUlma: 20,
      cancellationWindow: 24,
      rescheduleLimit: 2,
      recordingRetention: 30,
      classBufferTime: 15,
    },
    notifications: {
      classReminder: true,
      paymentReminder: true,
      announcementEmail: true,
      smsNotifications: false,
      pushNotifications: true,
      emailNotifications: true,
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordExpiry: 90,
      twoFactorAuth: false,
      ipWhitelist: [],
      forceLogout: false,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get('/api/admin/settings');
      setSettings(data);
      syncFromAdminSave(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await axios.put('/api/admin/settings', settings);
      const savedSettings = data?.data || settings;
      setSettings(savedSettings);
      syncFromAdminSave(savedSettings);
      await refreshSettings();
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      fetchSettings();
    }
  };

  const handleSettingChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleArrayChange = (category, field, value, index) => {
    const newArray = [...settings[category][field]];
    newArray[index] = value;
    handleSettingChange(category, field, newArray);
  };

  const addPaymentMethod = () => {
    const newMethods = [...settings.payment.paymentMethods, ''];
    handleSettingChange('payment', 'paymentMethods', newMethods);
  };

  const removePaymentMethod = (index) => {
    const newMethods = settings.payment.paymentMethods.filter((_, i) => i !== index);
    handleSettingChange('payment', 'paymentMethods', newMethods);
  };

  const renderGeneralSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Site Name"
          value={settings.general.siteName}
          onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Site URL"
          value={settings.general.siteUrl}
          onChange={(e) => handleSettingChange('general', 'siteUrl', e.target.value)}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Contact Email"
          value={settings.general.contactEmail}
          onChange={(e) => handleSettingChange('general', 'contactEmail', e.target.value)}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Contact Phone"
          value={settings.general.contactPhone}
          onChange={(e) => handleSettingChange('general', 'contactPhone', e.target.value)}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Timezone</InputLabel>
          <Select
            value={settings.general.timezone}
            label="Timezone"
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
          >
            <MenuItem value="Asia/Karachi">Asia/Karachi (Pakistan)</MenuItem>
            <MenuItem value="Asia/Riyadh">Asia/Riyadh (Saudi Arabia)</MenuItem>
            <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
            <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Default Language</InputLabel>
          <Select
            value={settings.general.defaultLanguage}
            label="Default Language"
            onChange={(e) => handleSettingChange('general', 'defaultLanguage', e.target.value)}
          >
            <MenuItem value="english">English</MenuItem>
            <MenuItem value="urdu">Urdu</MenuItem>
            <MenuItem value="arabic">Arabic</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={settings.general.maintenanceMode}
                onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
              />
            }
            label="Maintenance Mode"
          />
        </FormGroup>
      </Grid>
    </Grid>
  );

  const renderPaymentSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Currency</InputLabel>
          <Select
            value={settings.payment.currency}
            label="Currency"
            onChange={(e) => handleSettingChange('payment', 'currency', e.target.value)}
          >
            <MenuItem value="USD">USD ($)</MenuItem>
            <MenuItem value="PKR">PKR (₨)</MenuItem>
            <MenuItem value="EUR">EUR (€)</MenuItem>
            <MenuItem value="GBP">GBP (£)</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Tax Rate (%)"
          type="number"
          value={settings.payment.taxRate}
          onChange={(e) => handleSettingChange('payment', 'taxRate', parseFloat(e.target.value))}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Late Fee ($)"
          type="number"
          value={settings.payment.lateFee}
          onChange={(e) => handleSettingChange('payment', 'lateFee', parseFloat(e.target.value))}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Grace Period (days)"
          type="number"
          value={settings.payment.gracePeriod}
          onChange={(e) => handleSettingChange('payment', 'gracePeriod', parseInt(e.target.value))}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Payment Methods
        </Typography>
        {settings.payment.paymentMethods.map((method, index) => (
          <Box key={index} display="flex" gap={2} alignItems="center" mb={2}>
            <TextField
              fullWidth
              label={`Method ${index + 1}`}
              value={method}
              onChange={(e) => handleArrayChange('payment', 'paymentMethods', e.target.value, index)}
            />
            <Button
              color="error"
              onClick={() => removePaymentMethod(index)}
              disabled={settings.payment.paymentMethods.length <= 1}
            >
              Remove
            </Button>
          </Box>
        ))}
        <Button onClick={addPaymentMethod}>Add Payment Method</Button>
      </Grid>
      <Grid item xs={12}>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={settings.payment.autoRenewal}
                onChange={(e) => handleSettingChange('payment', 'autoRenewal', e.target.checked)}
              />
            }
            label="Enable Auto-Renewal"
          />
        </FormGroup>
      </Grid>
    </Grid>
  );

  const renderClassSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Default Class Duration (minutes)"
          type="number"
          value={settings.classes.defaultDuration}
          onChange={(e) => handleSettingChange('classes', 'defaultDuration', parseInt(e.target.value))}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Max Students per Ulma"
          type="number"
          value={settings.classes.maxStudentsPerUlma}
          onChange={(e) => handleSettingChange('classes', 'maxStudentsPerUlma', parseInt(e.target.value))}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Cancellation Window (hours)"
          type="number"
          value={settings.classes.cancellationWindow}
          onChange={(e) => handleSettingChange('classes', 'cancellationWindow', parseInt(e.target.value))}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Reschedule Limit (per month)"
          type="number"
          value={settings.classes.rescheduleLimit}
          onChange={(e) => handleSettingChange('classes', 'rescheduleLimit', parseInt(e.target.value))}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Recording Retention (days)"
          type="number"
          value={settings.classes.recordingRetention}
          onChange={(e) => handleSettingChange('classes', 'recordingRetention', parseInt(e.target.value))}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Class Buffer Time (minutes)"
          type="number"
          value={settings.classes.classBufferTime}
          onChange={(e) => handleSettingChange('classes', 'classBufferTime', parseInt(e.target.value))}
          margin="normal"
        />
      </Grid>
    </Grid>
  );

  const renderNotificationSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Notification Settings
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifications.classReminder}
                onChange={(e) => handleSettingChange('notifications', 'classReminder', e.target.checked)}
              />
            }
            label="Class Reminders"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifications.paymentReminder}
                onChange={(e) => handleSettingChange('notifications', 'paymentReminder', e.target.checked)}
              />
            }
            label="Payment Reminders"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifications.announcementEmail}
                onChange={(e) => handleSettingChange('notifications', 'announcementEmail', e.target.checked)}
              />
            }
            label="Announcement Emails"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifications.smsNotifications}
                onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
              />
            }
            label="SMS Notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifications.pushNotifications}
                onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
              />
            }
            label="Push Notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifications.emailNotifications}
                onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
              />
            }
            label="Email Notifications"
          />
        </FormGroup>
      </Grid>
    </Grid>
  );

  const renderSecuritySettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Session Timeout (minutes)"
          type="number"
          value={settings.security.sessionTimeout}
          onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Max Login Attempts"
          type="number"
          value={settings.security.maxLoginAttempts}
          onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Password Expiry (days)"
          type="number"
          value={settings.security.passwordExpiry}
          onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={settings.security.twoFactorAuth}
                onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
              />
            }
            label="Two-Factor Authentication"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.security.forceLogout}
                onChange={(e) => handleSettingChange('security', 'forceLogout', e.target.checked)}
              />
            }
            label="Force Logout on Settings Change"
          />
        </FormGroup>
      </Grid>
    </Grid>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderGeneralSettings();
      case 1:
        return renderPaymentSettings();
      case 2:
        return renderClassSettings();
      case 3:
        return renderNotificationSettings();
      case 4:
        return renderSecuritySettings();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              System Settings
            </Typography>
            <Typography color="textSecondary">
              Configure your platform settings
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>

        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ mb: 3 }}>
          <Tab icon={<SettingsIcon />} label="General" />
          <Tab icon={<Payment />} label="Payment" />
          <Tab icon={<School />} label="Classes" />
          <Tab icon={<Notifications />} label="Notifications" />
          <Tab icon={<Security />} label="Security" />
        </Tabs>

        <Divider sx={{ mb: 3 }} />

        {renderTabContent()}

        {saving && <LinearProgress sx={{ mt: 3 }} />}

        <Alert severity="info" sx={{ mt: 3 }}>
          <strong>Note:</strong> Some settings may require a system restart to take effect.
        </Alert>
      </Paper>
    </Container>
  );
};

export default Settings;