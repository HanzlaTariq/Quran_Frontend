import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Target, Award,
  Calendar, Clock, Book, Star, Zap,
  TrendingDown, Users, Trophy, Medal,
  LineChart, PieChart, Activity, TargetIcon,
  ChevronRight, Download, Share2, RefreshCw
} from 'lucide-react';
import { quranService } from '../../services';
import { quranUtils } from '../../utils/quranUtils';
import toast from 'react-hot-toast';

const StatisticsPanel = ({ darkMode }) => {
  const [stats, setStats] = useState({
    reading: {},
    achievements: [],
    streaks: {},
    progress: {}
  });
  const [timeRange, setTimeRange] = useState('all'); // all, week, month, year
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, [timeRange]);

  const loadStatistics = async () => {
    setIsLoading(true);
    try {
      // Load from localStorage
      const savedStats = localStorage.getItem('quranStatistics') || '{}';
      const savedBookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');

      // Calculate statistics
      const readingStats = calculateReadingStats(savedBookmarks);
      const achievementStats = calculateAchievements(readingStats);
      const streakStats = calculateStreaks(savedBookmarks);
      const progressStats = calculateProgress(readingStats);

      setStats({
        reading: readingStats,
        achievements: achievementStats,
        streaks: streakStats,
        progress: progressStats
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
      toast.error('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateReadingStats = (bookmarks) => {
    const totalAyahs = 6236;
    const totalSurahs = 114;

    const completedSurahs = [...new Set(bookmarks.map(b => b.surah))].length;
    const completedAyahs = bookmarks.length;

    const surahProgress = (completedSurahs / totalSurahs) * 100;
    const ayahProgress = (completedAyahs / totalAyahs) * 100;

    // Calculate reading time (estimate 30 seconds per ayah)
    const totalReadingMinutes = Math.round(bookmarks.length * 0.5);
    const averageDaily = bookmarks.length > 0 ? Math.round(bookmarks.length / 30) : 0; // Assuming 30 days

    return {
      totalSurahs,
      completedSurahs,
      surahProgress,
      totalAyahs,
      completedAyahs,
      ayahProgress,
      totalReadingMinutes,
      averageDaily,
      bookmarks: bookmarks.length
    };
  };

  const calculateAchievements = (readingStats) => {
    const achievements = [
      {
        id: 'first_bookmark',
        title: 'First Step',
        description: 'Bookmark your first ayah',
        icon: Star,
        completed: readingStats.completedAyahs > 0,
        progress: readingStats.completedAyahs > 0 ? 100 : 0,
        reward: '🎯'
      },
      {
        id: '10_ayahs',
        title: 'Quran Explorer',
        description: 'Bookmark 10 ayahs',
        icon: Target,
        completed: readingStats.completedAyahs >= 10,
        progress: Math.min((readingStats.completedAyahs / 10) * 100, 100),
        reward: '🌟'
      },
      {
        id: 'complete_surah',
        title: 'Surah Master',
        description: 'Complete reading a full Surah',
        icon: Trophy,
        completed: readingStats.completedSurahs >= 1,
        progress: Math.min((readingStats.completedSurahs / 1) * 100, 100),
        reward: '🏆'
      },
      {
        id: '30_minutes',
        title: 'Dedicated Reader',
        description: 'Spend 30 minutes reading',
        icon: Clock,
        completed: readingStats.totalReadingMinutes >= 30,
        progress: Math.min((readingStats.totalReadingMinutes / 30) * 100, 100),
        reward: '⏳'
      },
      {
        id: '5_surahs',
        title: 'Quran Scholar',
        description: 'Read 5 different Surahs',
        icon: Book,
        completed: readingStats.completedSurahs >= 5,
        progress: Math.min((readingStats.completedSurahs / 5) * 100, 100),
        reward: '📚'
      },
      {
        id: '100_ayahs',
        title: 'Quran Enthusiast',
        description: 'Bookmark 100 ayahs',
        icon: Zap,
        completed: readingStats.completedAyahs >= 100,
        progress: Math.min((readingStats.completedAyahs / 100) * 100, 100),
        reward: '⚡'
      },
      {
        id: '7_day_streak',
        title: 'Consistent Learner',
        description: '7-day reading streak',
        icon: Activity,
        completed: stats.streaks?.currentStreak >= 7,
        progress: Math.min(((stats.streaks?.currentStreak || 0) / 7) * 100, 100),
        reward: '🔥'
      },
      {
        id: 'complete_juz',
        title: 'Juz Champion',
        description: 'Complete one Juz (1/30th of Quran)',
        icon: Medal,
        completed: readingStats.ayahProgress >= (100 / 30),
        progress: Math.min((readingStats.ayahProgress / (100 / 30)) * 100, 100),
        reward: '🥇'
      }
    ];

    return achievements;
  };

  const calculateStreaks = (bookmarks) => {
    if (bookmarks.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalDays: 0
      };
    }

    const dates = [...new Set(bookmarks.map(b => b.timestamp.split('T')[0]))]
      .sort((a, b) => new Date(a) - new Date(b));

    let currentStreak = 1;
    let longestStreak = 1;
    let tempStreak = 1;

    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
        currentStreak = diffDays === 1 ? currentStreak + 1 : 1;
      } else if (diffDays > 1) {
        currentStreak = 1;
      }

      longestStreak = Math.max(longestStreak, tempStreak);
    }

    return {
      currentStreak,
      longestStreak,
      totalDays: dates.length,
      lastReading: dates[dates.length - 1]
    };
  };

  const calculateProgress = (readingStats) => {
    const weeklyGoal = 50; // 50 ayahs per week
    const monthlyGoal = 200; // 200 ayahs per month

    const weeklyProgress = Math.min((readingStats.averageDaily * 7 / weeklyGoal) * 100, 100);
    const monthlyProgress = Math.min((readingStats.averageDaily * 30 / monthlyGoal) * 100, 100);

    return {
      weeklyGoal,
      weeklyProgress,
      monthlyGoal,
      monthlyProgress,
      dailyAverage: readingStats.averageDaily
    };
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const shareStatistics = async () => {
    const text = `My Quran Reading Statistics 📊\n\n` +
      `📖 ${stats.reading.completedSurahs}/114 Surahs\n` +
      `🎯 ${stats.reading.completedAyahs}/6236 Ayahs\n` +
      `🔥 ${stats.streaks.currentStreak} day streak\n` +
      `⏱️ ${stats.reading.totalReadingMinutes} minutes\n\n` +
      `#Quran #ReadingStats`;

    if (navigator.share) {
      await navigator.share({
        title: 'My Quran Statistics',
        text: text
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Statistics copied to clipboard!');
    }
  };

  const exportStatistics = () => {
    const data = {
      timestamp: new Date().toISOString(),
      statistics: stats
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `quran-stats-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('Statistics exported!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className={`rounded-2xl p-6 mb-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-4 mb-4">
              <BarChart3 className="h-12 w-12" />
              <div>
                <h1 className="text-3xl font-bold">Reading Statistics</h1>
                <p className="text-xl opacity-90">Track your Quran reading journey</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Book className="h-4 w-4" />
                <span>{stats.reading.completedSurahs}/114 Surahs</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>{stats.reading.completedAyahs}/6236 Ayahs</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>{stats.streaks.currentStreak} day streak</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{stats.reading.totalReadingMinutes} minutes</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={shareStatistics}
              className="flex items-center space-x-2 bg-white text-blue-700 px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
            <button
              onClick={exportStatistics}
              className="flex items-center space-x-2 bg-white text-blue-700 px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={loadStatistics}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className={`mb-6 p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
        <div className="flex items-center space-x-4">
          <span className="font-medium">Time Range:</span>
          {['all', 'week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition ${timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Surah Progress */}
        <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">Surah Progress</h3>
              <p className="text-sm opacity-75">Total completion</p>
            </div>
            <Book className="h-8 w-8 text-green-500" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Completed</span>
                <span className={`font-bold ${getProgressColor(stats.reading.surahProgress)}`}>
                  {stats.reading.surahProgress.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressBarColor(stats.reading.surahProgress)} transition-all duration-500`}
                  style={{ width: `${stats.reading.surahProgress}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.reading.completedSurahs}</div>
              <div className="text-sm opacity-75">out of 114 Surahs</div>
            </div>
          </div>
        </div>

        {/* Ayah Progress */}
        <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">Ayah Progress</h3>
              <p className="text-sm opacity-75">Verses read</p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Completed</span>
                <span className={`font-bold ${getProgressColor(stats.reading.ayahProgress)}`}>
                  {stats.reading.ayahProgress.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressBarColor(stats.reading.ayahProgress)} transition-all duration-500`}
                  style={{ width: `${stats.reading.ayahProgress}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.reading.completedAyahs.toLocaleString()}</div>
              <div className="text-sm opacity-75">out of 6,236 Ayahs</div>
            </div>
          </div>
        </div>

        {/* Reading Streak */}
        <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">Reading Streak</h3>
              <p className="text-sm opacity-75">Consistency</p>
            </div>
            <Activity className="h-8 w-8 text-red-500" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Current Streak</span>
                <span className="font-bold text-green-600">
                  {stats.streaks.currentStreak} days
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${Math.min((stats.streaks.currentStreak / 30) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.streaks.longestStreak}</div>
                <div className="text-sm opacity-75">Longest</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.streaks.totalDays}</div>
                <div className="text-sm opacity-75">Total Days</div>
              </div>
            </div>
          </div>
        </div>

        {/* Reading Time */}
        <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">Reading Time</h3>
              <p className="text-sm opacity-75">Time invested</p>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Total Time</span>
                <span className="font-bold text-purple-600">
                  {stats.reading.totalReadingMinutes} min
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-500"
                  style={{ width: `${Math.min((stats.reading.totalReadingMinutes / 1000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.reading.averageDaily}</div>
              <div className="text-sm opacity-75">Average daily ayahs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Goals Progress */}
      <div className={`mb-8 p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
        <h3 className="font-bold text-xl mb-6">Weekly & Monthly Goals</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-bold">Weekly Goal</h4>
                <p className="text-sm opacity-75">Target: {stats.progress.weeklyGoal} ayahs</p>
              </div>
              <span className={`font-bold ${getProgressColor(stats.progress.weeklyProgress)}`}>
                {stats.progress.weeklyProgress.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressBarColor(stats.progress.weeklyProgress)} transition-all duration-500`}
                style={{ width: `${stats.progress.weeklyProgress}%` }}
              ></div>
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Current pace: {Math.round(stats.progress.dailyAverage * 7)} ayahs/week
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-bold">Monthly Goal</h4>
                <p className="text-sm opacity-75">Target: {stats.progress.monthlyGoal} ayahs</p>
              </div>
              <span className={`font-bold ${getProgressColor(stats.progress.monthlyProgress)}`}>
                {stats.progress.monthlyProgress.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressBarColor(stats.progress.monthlyProgress)} transition-all duration-500`}
                style={{ width: `${stats.progress.monthlyProgress}%` }}
              ></div>
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Current pace: {Math.round(stats.progress.dailyAverage * 30)} ayahs/month
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className={`mb-8 p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-xl">Achievements</h3>
          <span className="text-sm opacity-75">
            {stats.achievements.filter(a => a.completed).length} of {stats.achievements.length} unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-xl border ${achievement.completed
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : darkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-gray-50 border-gray-200'
                }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${achievement.completed
                    ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                  <achievement.icon className="h-6 w-6" />
                </div>
                <span className="text-2xl">{achievement.reward}</span>
              </div>

              <h4 className="font-bold mb-2">{achievement.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {achievement.description}
              </p>

              <div className="space-y-2">
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${achievement.completed ? 'bg-green-500' : 'bg-gray-400'
                      } transition-all duration-500`}
                    style={{ width: `${achievement.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs">
                  <span>{achievement.completed ? 'Completed!' : 'In Progress'}</span>
                  <span>{achievement.progress.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
        <h3 className="font-bold text-xl mb-6">Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <h4 className="font-bold">Strong Points</h4>
            </div>
            <ul className="space-y-2 text-sm">
              {stats.reading.completedSurahs >= 5 && (
                <li>✓ Reading multiple Surahs shows good diversity</li>
              )}
              {stats.streaks.currentStreak >= 3 && (
                <li>✓ Consistent reading habit formed</li>
              )}
              {stats.reading.totalReadingMinutes >= 60 && (
                <li>✓ Significant time invested in study</li>
              )}
            </ul>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown className="h-5 w-5 text-yellow-500" />
              <h4 className="font-bold">Areas to Improve</h4>
            </div>
            <ul className="space-y-2 text-sm">
              {stats.reading.surahProgress < 10 && (
                <li>• Try reading from different Surahs</li>
              )}
              {stats.streaks.currentStreak < 3 && (
                <li>• Establish a daily reading routine</li>
              )}
              {stats.progress.weeklyProgress < 50 && (
                <li>• Set smaller daily goals to build momentum</li>
              )}
            </ul>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
            <div className="flex items-center space-x-2 mb-2">
              <TargetIcon className="h-5 w-5 text-blue-500" />
              <h4 className="font-bold">Recommendations</h4>
            </div>
            <ul className="space-y-2 text-sm">
              <li>• Aim for 5 ayahs daily to build consistency</li>
              <li>• Try reading Juz 30 for shorter Surahs</li>
              <li>• Use bookmarks to track meaningful verses</li>
              <li>• Set weekly reminders for Quran reading</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;