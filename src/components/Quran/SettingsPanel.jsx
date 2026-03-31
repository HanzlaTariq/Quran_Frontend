import React, { useState, useEffect } from 'react';
import {
  Settings, Moon, Sun, Type, Volume2,
  Globe, Download, Bell, Shield,
  HelpCircle, Info, Palette, Eye,
  RotateCcw, Save, Check, X,
  Zap, Users, Database, Key
} from 'lucide-react';
import { quranService } from '../../services';
import { quranUtils } from '../../utils/quranUtils';
import toast from 'react-hot-toast';

const SettingsPanel = ({
  darkMode,
  onDarkModeToggle,
  fontSize,
  onFontSizeChange,
  theme,
  onThemeChange,
  reciter,
  onReciterChange,
  translation,
  onTranslationChange
}) => {
  const [audioQuality, setAudioQuality] = useState('medium');
  const [autoPlay, setAutoPlay] = useState(false);
  const [showTafsir, setShowTafsir] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [dataSaving, setDataSaving] = useState(false);
  const [showVerseNumbers, setShowVerseNumbers] = useState(true);
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  const [showJuzNumbers, setShowJuzNumbers] = useState(true);
  const [advancedSettings, setAdvancedSettings] = useState(false);
  const [cacheSize, setCacheSize] = useState('0 MB');

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('quranSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setAudioQuality(settings.audioQuality || 'medium');
      setAutoPlay(settings.autoPlay || false);
      setShowTafsir(settings.showTafsir !== false);
      setNotifications(settings.notifications !== false);
      setOfflineMode(settings.offlineMode || false);
      setDataSaving(settings.dataSaving || false);
      setShowVerseNumbers(settings.showVerseNumbers !== false);
      setShowPageNumbers(settings.showPageNumbers !== false);
      setShowJuzNumbers(settings.showJuzNumbers !== false);
    }

    // Calculate cache size
    calculateCacheSize();
  }, []);

  const calculateCacheSize = () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage.getItem(key).length * 2; // UTF-16
      }
    }
    setCacheSize((total / (1024 * 1024)).toFixed(2) + ' MB');
  };

  const saveSettings = () => {
    const settings = {
      audioQuality,
      autoPlay,
      showTafsir,
      notifications,
      offlineMode,
      dataSaving,
      showVerseNumbers,
      showPageNumbers,
      showJuzNumbers,
      fontSize,
      theme,
      reciter,
      translation
    };

    localStorage.setItem('quranSettings', JSON.stringify(settings));
    toast.success('Settings saved successfully!');
  };

  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      localStorage.removeItem('quranSettings');
      setAudioQuality('medium');
      setAutoPlay(false);
      setShowTafsir(true);
      setNotifications(true);
      setOfflineMode(false);
      setDataSaving(false);
      setShowVerseNumbers(true);
      setShowPageNumbers(true);
      setShowJuzNumbers(true);
      onFontSizeChange(24);
      onThemeChange('default');
      onReciterChange('ar.alafasy');
      onTranslationChange('en.asad');
      toast.success('Settings reset to default');
    }
  };

  const clearCache = () => {
    if (window.confirm('Clear all cached data? This will improve performance but require re-downloading data.')) {
      localStorage.clear();
      quranService.clearCache();
      calculateCacheSize();
      toast.success('Cache cleared successfully!');
    }
  };

  const exportData = () => {
    const data = {
      settings: {
        audioQuality,
        autoPlay,
        showTafsir,
        notifications,
        offlineMode,
        dataSaving,
        showVerseNumbers,
        showPageNumbers,
        showJuzNumbers,
        fontSize,
        theme,
        reciter,
        translation
      },
      bookmarks: JSON.parse(localStorage.getItem('quranBookmarks') || '[]'),
      statistics: JSON.parse(localStorage.getItem('quranStatistics') || '{}')
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `quran-app-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('Data exported successfully!');
  };

  const importData = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        // Import settings
        if (data.settings) {
          const settings = data.settings;
          setAudioQuality(settings.audioQuality || 'medium');
          setAutoPlay(settings.autoPlay || false);
          setShowTafsir(settings.showTafsir !== false);
          setNotifications(settings.notifications !== false);
          setOfflineMode(settings.offlineMode || false);
          setDataSaving(settings.dataSaving || false);
          setShowVerseNumbers(settings.showVerseNumbers !== false);
          setShowPageNumbers(settings.showPageNumbers !== false);
          setShowJuzNumbers(settings.showJuzNumbers !== false);
          onFontSizeChange(settings.fontSize || 24);
          onThemeChange(settings.theme || 'default');
          onReciterChange(settings.reciter || 'ar.alafasy');
          onTranslationChange(settings.translation || 'en.asad');

          localStorage.setItem('quranSettings', JSON.stringify(settings));
        }

        // Import bookmarks
        if (data.bookmarks) {
          localStorage.setItem('quranBookmarks', JSON.stringify(data.bookmarks));
        }

        // Import statistics
        if (data.statistics) {
          localStorage.setItem('quranStatistics', JSON.stringify(data.statistics));
        }

        toast.success('Data imported successfully!');
      } catch (error) {
        toast.error('Invalid backup file');
      }
    };

    reader.readAsText(file);
  };

  const audioQualities = quranUtils.getAudioQualities();
  const popularReciters = quranService.getPopularReciters();
  const popularTranslations = quranService.getPopularTranslations();
  const themes = [
    { id: 'default', name: 'Default', color: '#10B981' },
    { id: 'dark', name: 'Dark', color: '#111827' },
    { id: 'sepia', name: 'Sepia', color: '#FEF3C7' },
    { id: 'blue', name: 'Blue', color: '#DBEAFE' },
    { id: 'green', name: 'Green', color: '#D1FAE5' },
    { id: 'purple', name: 'Purple', color: '#F3E8FF' }
  ];

  const fontSizes = [
    { size: 16, name: 'Small' },
    { size: 18, name: 'Medium' },
    { size: 20, name: 'Standard' },
    { size: 24, name: 'Large' },
    { size: 28, name: 'X-Large' },
    { size: 32, name: 'XX-Large' },
    { size: 36, name: 'Huge' },
    { size: 40, name: 'Massive' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className={`rounded-2xl p-6 mb-8 bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-xl`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-4 mb-4">
              <Settings className="h-12 w-12" />
              <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-xl opacity-90">Customize your Quran reading experience</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={saveSettings}
              className="flex items-center space-x-2 bg-white text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-50 transition"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
            <button
              onClick={resetSettings}
              className="flex items-center space-x-2 bg-white/20 text-white px-4 py-2 rounded-lg font-bold hover:bg-white/30 transition"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Categories */}
      <div className="space-y-6">
        {/* Appearance */}
        <div className={`rounded-xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
          <div className="flex items-center space-x-3 mb-6">
            <Palette className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-bold">Appearance</h2>
          </div>

          <div className="space-y-6">
            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Dark Mode</h3>
                <p className="text-sm opacity-75">Switch between light and dark themes</p>
              </div>
              <button
                onClick={onDarkModeToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${darkMode ? 'bg-green-600' : 'bg-gray-300'
                  }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
              </button>
            </div>

            {/* Theme */}
            <div>
              <h3 className="font-medium mb-3">Theme Color</h3>
              <div className="flex flex-wrap gap-3">
                {themes.map((themeItem) => (
                  <button
                    key={themeItem.id}
                    onClick={() => onThemeChange(themeItem.id)}
                    className={`w-12 h-12 rounded-lg border-2 ${theme === themeItem.id ? 'border-green-500' : 'border-gray-300'
                      }`}
                    style={{ backgroundColor: themeItem.color }}
                    title={themeItem.name}
                  />
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium">Font Size</h3>
                  <p className="text-sm opacity-75">Adjust text size for better readability</p>
                </div>
                <span className="font-bold">{fontSize}px</span>
              </div>
              <div className="flex items-center space-x-4">
                <Type className="h-5 w-5 text-gray-400" />
                <input
                  type="range"
                  min="16"
                  max="40"
                  value={fontSize}
                  onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-600"
                />
                <Type className="h-7 w-7 text-gray-400" />
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span>Small</span>
                <span>Large</span>
              </div>
            </div>

            {/* Display Options */}
            <div>
              <h3 className="font-medium mb-3">Display Options</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Show Verse Numbers</h4>
                    <p className="text-xs opacity-75">Display ayah numbers</p>
                  </div>
                  <button
                    onClick={() => setShowVerseNumbers(!showVerseNumbers)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${showVerseNumbers ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${showVerseNumbers ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Show Page Numbers</h4>
                    <p className="text-xs opacity-75">Display traditional page numbers</p>
                  </div>
                  <button
                    onClick={() => setShowPageNumbers(!showPageNumbers)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${showPageNumbers ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${showPageNumbers ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Show Juz Numbers</h4>
                    <p className="text-xs opacity-75">Display Juz divisions</p>
                  </div>
                  <button
                    onClick={() => setShowJuzNumbers(!showJuzNumbers)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${showJuzNumbers ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${showJuzNumbers ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Show Tafsir</h4>
                    <p className="text-xs opacity-75">Display commentary and explanations</p>
                  </div>
                  <button
                    onClick={() => setShowTafsir(!showTafsir)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${showTafsir ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${showTafsir ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audio & Translation */}
        <div className={`rounded-xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
          <div className="flex items-center space-x-3 mb-6">
            <Volume2 className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold">Audio & Translation</h2>
          </div>

          <div className="space-y-6">
            {/* Reciter */}
            <div>
              <h3 className="font-medium mb-3">Default Reciter</h3>
              <select
                value={reciter}
                onChange={(e) => onReciterChange(e.target.value)}
                className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
              >
                {popularReciters.map((r) => (
                  <option key={r.identifier} value={r.identifier}>
                    {r.name} ({r.language.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Translation */}
            <div>
              <h3 className="font-medium mb-3">Default Translation</h3>
              <select
                value={translation}
                onChange={(e) => onTranslationChange(e.target.value)}
                className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
              >
                {popularTranslations.map((t) => (
                  <option key={t.identifier} value={t.identifier}>
                    {t.name} ({t.language.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Audio Quality */}
            <div>
              <h3 className="font-medium mb-3">Audio Quality</h3>
              <div className="flex flex-wrap gap-2">
                {audioQualities.map((quality) => (
                  <button
                    key={quality.value}
                    onClick={() => setAudioQuality(quality.value)}
                    className={`px-4 py-2 rounded-lg transition ${audioQuality === quality.value
                        ? 'bg-blue-600 text-white'
                        : darkMode
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                  >
                    {quality.label}
                  </button>
                ))}
              </div>
              <p className="text-sm opacity-75 mt-2">
                Higher quality uses more data but sounds better
              </p>
            </div>

            {/* Auto Play */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Auto Play</h3>
                <p className="text-sm opacity-75">Automatically play next ayah</p>
              </div>
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${autoPlay ? 'bg-green-600' : 'bg-gray-300'
                  }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${autoPlay ? 'translate-x-6' : 'translate-x-1'
                  }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications & Privacy */}
        <div className={`rounded-xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="h-6 w-6 text-yellow-600" />
            <h2 className="text-xl font-bold">Notifications & Privacy</h2>
          </div>

          <div className="space-y-6">
            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Notifications</h3>
                <p className="text-sm opacity-75">Daily reminders and updates</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications ? 'bg-green-600' : 'bg-gray-300'
                  }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
              </button>
            </div>

            {/* Offline Mode */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Offline Mode</h3>
                <p className="text-sm opacity-75">Download content for offline reading</p>
              </div>
              <button
                onClick={() => setOfflineMode(!offlineMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${offlineMode ? 'bg-green-600' : 'bg-gray-300'
                  }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${offlineMode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
              </button>
            </div>

            {/* Data Saving */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Data Saving</h3>
                <p className="text-sm opacity-75">Reduce data usage when on mobile</p>
              </div>
              <button
                onClick={() => setDataSaving(!dataSaving)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${dataSaving ? 'bg-green-600' : 'bg-gray-300'
                  }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${dataSaving ? 'translate-x-6' : 'translate-x-1'
                  }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className={`rounded-xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Zap className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-bold">Advanced Settings</h2>
            </div>
            <button
              onClick={() => setAdvancedSettings(!advancedSettings)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {advancedSettings ? 'Hide' : 'Show'}
            </button>
          </div>

          {advancedSettings && (
            <div className="space-y-6">
              {/* Cache Management */}
              <div>
                <h3 className="font-medium mb-3">Cache Management</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Cache Size</h4>
                    <p className="text-xs opacity-75">{cacheSize} used</p>
                  </div>
                  <button
                    onClick={clearCache}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Clear Cache
                  </button>
                </div>
              </div>

              {/* Data Management */}
              <div>
                <h3 className="font-medium mb-3">Data Management</h3>
                <div className="space-y-3">
                  <button
                    onClick={exportData}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center space-x-3">
                      <Download className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium">Export All Data</h4>
                        <p className="text-sm opacity-75">Backup your bookmarks and settings</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Database className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">Import Data</h4>
                        <p className="text-sm opacity-75">Restore from backup file</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importData}
                      className="hidden"
                    />
                    <ChevronRight className="h-5 w-5" />
                  </label>
                </div>
              </div>

              {/* App Information */}
              <div>
                <h3 className="font-medium mb-3">App Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-75">Version</span>
                    <span className="font-medium">2.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-75">Last Updated</span>
                    <span className="font-medium">2024-01-20</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-75">Data Source</span>
                    <span className="font-medium">Al Quran Cloud API</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-75">Cache Status</span>
                    <span className="font-medium">Active</span>
                  </div>
                </div>
              </div>

              {/* Reset Section */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-medium mb-3 text-red-600">Danger Zone</h3>
                <div className="space-y-3">
                  <button
                    onClick={resetSettings}
                    className="w-full text-left p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Reset All Settings</h4>
                        <p className="text-sm">Restore all settings to default values</p>
                      </div>
                      <RotateCcw className="h-5 w-5" />
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('This will delete ALL your data including bookmarks. This action cannot be undone.')) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="w-full text-left p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Delete All Data</h4>
                        <p className="text-sm">Permanently delete all app data</p>
                      </div>
                      <Trash2 className="h-5 w-5" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help & Support */}
        <div className={`rounded-xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
          <div className="flex items-center space-x-3 mb-6">
            <HelpCircle className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-bold">Help & Support</h2>
          </div>

          <div className="space-y-4">
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Info className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">User Guide</h4>
                    <p className="text-sm opacity-75">Learn how to use all features</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5" />
              </div>
            </button>

            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-medium">Privacy Policy</h4>
                    <p className="text-sm opacity-75">Read our privacy practices</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5" />
              </div>
            </button>

            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <h4 className="font-medium">Contact Support</h4>
                    <p className="text-sm opacity-75">Get help with issues</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5" />
              </div>
            </button>

            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Key className="h-5 w-5 text-yellow-600" />
                  <div>
                    <h4 className="font-medium">API Documentation</h4>
                    <p className="text-sm opacity-75">Technical API references</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-6 mt-8">
        <div className={`p-4 rounded-xl border shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">Save Your Changes</h3>
              <p className="text-sm opacity-75">Apply all settings modifications</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={resetSettings}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700"
              >
                <Save className="h-5 w-5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;