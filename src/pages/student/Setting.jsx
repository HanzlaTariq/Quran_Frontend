// src/pages/student/Setting.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Camera, 
  Save, 
  Lock, 
  Bell, 
  BookOpen, 
  Volume2, 
  Type, 
  Eye,
  Clock,
  Languages,
  CreditCard,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';
import axios from 'axios';

const Setting = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [quranSettings, setQuranSettings] = useState(null);
  
  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    timezone: '',
    languages: [],
    profileImage: ''
  });
  
  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Student Preferences State (matching your schema)
  const [preferences, setPreferences] = useState({
    cameraOnByDefault: false,
    language: 'english',
    notificationsEnabled: true
  });
  
  // Quran Settings State (matching your schema)
  const [quranSettingsForm, setQuranSettingsForm] = useState({
    translation: {
      language: 'en',
      translator: 'Sahih International',
      enabled: true
    },
    tafseer: {
      enabled: false,
      tafseerName: 'Ibn Kathir'
    },
    font: {
      arabicSize: 22,
      translationSize: 16,
      fontFamily: 'Uthmani'
    },
    audio: {
      reciter: 'Abdul Basit',
      autoPlay: false
    },
    readingMode: {
      mode: 'light',
      showArabic: true,
      showAyahNumber: true
    }
  });
  
  // Available options based on your data
  const timezones = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Asia/Dubai', 'Asia/Karachi', 'Asia/Kolkata',
    'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland'
  ];
  
  const countries = [
    'USA', 'UK', 'Canada', 'Australia', 'Pakistan', 'India', 'Bangladesh', 
    'Egypt', 'Saudi Arabia', 'UAE', 'Turkey', 'Indonesia', 'Malaysia'
  ];
  
  const languages = [
    'english', 'urdu', 'arabic', 'french', 'turkish', 'indonesian'
  ];
  
  const reciters = [
    'Abdul Basit', 'Mishary Alafasy', 'Saad Al-Ghamdi', 
    'Saud Al-Shuraim', 'Abdur Rahman As-Sudais', 'Maher Al-Muaiqly'
  ];
  
  const translators = [
    'Sahih International', 'Yusuf Ali', 'Pickthall', 'Muhsin Khan'
  ];
  
  const tafseerNames = [
    'Ibn Kathir', 'Al-Jalalayn', 'Al-Qurtubi'
  ];
  
  const fontFamilies = [
    'Uthmani', 'Me Quran', 'Indopak', 'Nastaleeq'
  ];
  
  useEffect(() => {
    if (user && user._id) {
      fetchUserData();
      fetchStudentData();
      fetchQuranSettings();
    }
  }, [user]);
  
  const fetchUserData = async () => {
    try {
      // Fetch user data from your API
      const response = await axios.get(`/api/auth/profile`);
      const userData = response.data;
      
      console.log('User Data:', userData); // Debug log
      
      setProfileForm({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        country: userData.country || '',
        timezone: userData.timezone || '',
        languages: userData.languages || [],
        profileImage: userData.profileImage || 'default.jpg'
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    }
  };
  
  const fetchStudentData = async () => {
    try {
      // Fetch student data using user ID
      const response = await axios.get(`/api/students/by-user/${user._id}`);
      const data = response.data;
      
      console.log('Student Data:', data); // Debug log
      setStudentData(data);
      
      // Set preferences from student data
      if (data.preferences) {
        setPreferences({
          cameraOnByDefault: data.preferences.cameraOnByDefault || false,
          language: data.preferences.language || 'english',
          notificationsEnabled: data.preferences.notificationsEnabled || true
        });
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      // Don't show error toast here as student might not exist yet
    }
  };
  
  const fetchQuranSettings = async () => {
    try {
      // Fetch Quran settings using user ID
      const response = await axios.get(`/api/quran/settings/${user._id}`);
      if (response.data) {
        console.log('Quran Settings:', response.data); // Debug log
        setQuranSettings(response.data);
        setQuranSettingsForm(prev => ({
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
      console.error('Error fetching Quran settings:', error);
      // Don't show error toast here as settings might not exist yet
    }
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLanguageChange = (lang) => {
    setProfileForm(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };
  
  const handlePreferenceChange = (e) => {
    const { name, type, checked, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleQuranSettingsChange = (section, field, value) => {
    setQuranSettingsForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };
  
  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.put(`/api/users/${user._id}`, {
        name: profileForm.name,
        phone: profileForm.phone,
        country: profileForm.country,
        timezone: profileForm.timezone,
        languages: profileForm.languages
      });
      
      updateUser(response.data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  const updatePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.put(`/api/users/${user._id}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };
  
  const updatePreferences = async (e) => {
    e.preventDefault();
    
    if (!studentData || !studentData._id) {
      toast.error('Student data not found');
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.put(`/api/students/${studentData._id}/preferences`, preferences);
      toast.success('Preferences updated successfully');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };
  
  const updateQuranSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Use user ID based endpoint - handles both create and update
      const response = await axios.put(`/api/quran/settings/${user._id}`, quranSettingsForm);
      setQuranSettings(response.data);
      setQuranSettingsForm(response.data);
      toast.success('Quran settings updated successfully');
    } catch (error) {
      console.error('Error updating Quran settings:', error);
      toast.error('Failed to update Quran settings');
    } finally {
      setLoading(false);
    }
  };
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('profileImage', file);
    
    setLoading(true);
    
    try {
      const response = await axios.post(`/api/users/${user._id}/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setProfileForm(prev => ({ ...prev, profileImage: response.data.profileImage }));
      updateUser({ ...user, profileImage: response.data.profileImage });
      toast.success('Profile image updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'preferences', label: 'Preferences', icon: Bell },
            { id: 'quran', label: 'Quran Settings', icon: BookOpen },
            { id: 'subscription', label: 'Subscription', icon: CreditCard }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm">
            <form onSubmit={updateProfile} className="p-6 space-y-6">
              {/* Profile Image */}
              <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
                    {profileForm.profileImage && profileForm.profileImage !== 'default.jpg' ? (
                      <img 
                        src={profileForm.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-100">
                        <User className="w-12 h-12 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1.5 cursor-pointer hover:bg-blue-700 transition">
                    <Camera className="w-4 h-4 text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
                  <p className="text-sm text-gray-500">Upload a new profile picture</p>
                </div>
              </div>
              
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      disabled
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="country"
                      value={profileForm.country}
                      onChange={handleProfileChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Country</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="timezone"
                      value={profileForm.timezone}
                      onChange={handleProfileChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Timezone</option>
                      {timezones.map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Languages
                  </label>
                  <div className="relative">
                    <Languages className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <div className="pl-10 border border-gray-300 rounded-lg p-2">
                      <div className="flex flex-wrap gap-2">
                        {languages.map(lang => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => handleLanguageChange(lang)}
                            className={`px-3 py-1 text-sm rounded-full transition capitalize ${
                              profileForm.languages.includes(lang)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-xl shadow-sm">
            <form onSubmit={updatePassword} className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Shield className="w-4 h-4" />
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Preferences */}
        {activeTab === 'preferences' && studentData && (
          <div className="bg-white rounded-xl shadow-sm">
            <form onSubmit={updatePreferences} className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Camera On By Default</p>
                      <p className="text-sm text-gray-500">Automatically enable camera when joining classes</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreferences(prev => ({ ...prev, cameraOnByDefault: !prev.cameraOnByDefault }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        preferences.cameraOnByDefault ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        preferences.cameraOnByDefault ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Notifications</p>
                      <p className="text-sm text-gray-500">Receive notifications for class reminders and updates</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreferences(prev => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        preferences.notificationsEnabled ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        preferences.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interface Language
                    </label>
                    <select
                      name="language"
                      value={preferences.language}
                      onChange={handlePreferenceChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="english">English</option>
                      <option value="urdu">Urdu</option>
                      <option value="arabic">Arabic</option>
                      <option value="french">French</option>
                      <option value="turkish">Turkish</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Quran Settings */}
        {activeTab === 'quran' && (
          <div className="bg-white rounded-xl shadow-sm">
            <form onSubmit={updateQuranSettings} className="p-6 space-y-6">
              {/* Translation Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Translation Settings
                </h3>
                <div className="mb-4 flex items-center justify-between rounded-lg bg-gray-50 p-4">
                  <div>
                    <p className="font-medium text-gray-900">Show Translation</p>
                    <p className="text-sm text-gray-500">Display translation text under each ayah</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuranSettingsChange('translation', 'enabled', !quranSettingsForm.translation.enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      quranSettingsForm.translation.enabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      quranSettingsForm.translation.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Translation Language
                    </label>
                    <select
                      value={quranSettingsForm.translation.language}
                      onChange={(e) => handleQuranSettingsChange('translation', 'language', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="ur">Urdu</option>
                      <option value="fr">French</option>
                      <option value="tr">Turkish</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Translator
                    </label>
                    <select
                      value={quranSettingsForm.translation.translator}
                      onChange={(e) => handleQuranSettingsChange('translation', 'translator', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {translators.map(translator => (
                        <option key={translator} value={translator}>{translator}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Tafseer Settings */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Tafseer Settings
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleQuranSettingsChange('tafseer', 'enabled', !quranSettingsForm.tafseer.enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      quranSettingsForm.tafseer.enabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      quranSettingsForm.tafseer.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                {quranSettingsForm.tafseer.enabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tafseer Book
                    </label>
                    <select
                      value={quranSettingsForm.tafseer.tafseerName}
                      onChange={(e) => handleQuranSettingsChange('tafseer', 'tafseerName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {tafseerNames.map(tafseer => (
                        <option key={tafseer} value={tafseer}>{tafseer}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              {/* Font Settings */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Font Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Arabic Font Size: {quranSettingsForm.font.arabicSize}px
                    </label>
                    <input
                      type="range"
                      min="16"
                      max="32"
                      value={quranSettingsForm.font.arabicSize}
                      onChange={(e) => handleQuranSettingsChange('font', 'arabicSize', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Translation Font Size: {quranSettingsForm.font.translationSize}px
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="24"
                      value={quranSettingsForm.font.translationSize}
                      onChange={(e) => handleQuranSettingsChange('font', 'translationSize', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Family
                    </label>
                    <select
                      value={quranSettingsForm.font.fontFamily}
                      onChange={(e) => handleQuranSettingsChange('font', 'fontFamily', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {fontFamilies.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Audio Settings */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Audio Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Reciter
                    </label>
                    <select
                      value={quranSettingsForm.audio.reciter}
                      onChange={(e) => handleQuranSettingsChange('audio', 'reciter', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {reciters.map(reciter => (
                        <option key={reciter} value={reciter}>{reciter}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Auto-play Audio</p>
                      <p className="text-sm text-gray-500">Automatically play audio when opening a surah</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuranSettingsChange('audio', 'autoPlay', !quranSettingsForm.audio.autoPlay)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        quranSettingsForm.audio.autoPlay ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        quranSettingsForm.audio.autoPlay ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Reading Display Settings */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Reading Display
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                    <div>
                      <p className="font-medium text-gray-900">Show Arabic Text</p>
                      <p className="text-sm text-gray-500">Display Arabic ayah text in reader</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuranSettingsChange('readingMode', 'showArabic', !quranSettingsForm.readingMode.showArabic)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        quranSettingsForm.readingMode.showArabic ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        quranSettingsForm.readingMode.showArabic ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                    <div>
                      <p className="font-medium text-gray-900">Show Ayah Number</p>
                      <p className="text-sm text-gray-500">Display ayah numbers in reader</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuranSettingsChange('readingMode', 'showAyahNumber', !quranSettingsForm.readingMode.showAyahNumber)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        quranSettingsForm.readingMode.showAyahNumber ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        quranSettingsForm.readingMode.showAyahNumber ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Quran Settings'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Subscription Settings */}
        {activeTab === 'subscription' && studentData && studentData.subscription && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Subscription Details</h3>
                {studentData.subscription.isActive ? (
                  <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm">
                    <XCircle className="w-4 h-4" />
                    Inactive
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Current Plan</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {studentData.subscription.currentPlan || 'Basic'}
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Monthly Fee</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${studentData.subscription.monthlyFee || 0}/month
                  </p>
                </div>
                
                {studentData.subscription.nextBillingDate && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Next Billing Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(studentData.subscription.nextBillingDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Enrollment Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(studentData.enrollmentDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {studentData.subscription.paymentHistory && studentData.subscription.paymentHistory.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Payment History</h4>
                  <div className="space-y-2">
                    {studentData.subscription.paymentHistory.map((payment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(payment.date).toLocaleDateString()}
                          </span>
                          <span className="font-medium text-gray-900">${payment.amount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {payment.status === 'paid' ? (
                            <span className="flex items-center gap-1 text-green-600 text-sm">
                              <CheckCircle className="w-3 h-3" />
                              Paid
                            </span>
                          ) : payment.status === 'pending' ? (
                            <span className="flex items-center gap-1 text-yellow-600 text-sm">
                              <AlertCircle className="w-3 h-3" />
                              Pending
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600 text-sm">
                              <XCircle className="w-3 h-3" />
                              Failed
                            </span>
                          )}
                          {payment.transactionId && (
                            <span className="text-xs text-gray-400">ID: {payment.transactionId}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <CreditCard className="w-4 h-4" />
                  Manage Subscription
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Setting;