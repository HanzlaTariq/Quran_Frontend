import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { quranService } from '../../services';

// Import static methods directly
import { getRevelationType } from '../../utils/quranUtils';
import {
  Search, Filter, ChevronRight, Star, Hash, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const SurahList = ({ onSurahSelect, currentSurah, darkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('number');
  const [filter, setFilter] = useState('all');
  const [quickStats, setQuickStats] = useState(null);

  const { data: surahs = [], isLoading } = useQuery({
    queryKey: ['surahs'],
    queryFn: () => quranService.getAllSurahs().then(res => res.data.data),
    staleTime: 60000,
    onSuccess: (data) => calculateStats(data)
  });

  const calculateStats = (data) => {
    const totalAyahs = data.reduce((sum, s) => sum + s.numberOfAyahs, 0);
    const makki = data.filter(s => getRevelationType(s.number) === 'Makki').length;
    const madani = data.filter(s => getRevelationType(s.number) === 'Madani').length;
    const avgLength = Math.round(totalAyahs / data.length);

    setQuickStats({
      totalAyahs,
      makki,
      madani,
      avgLength,
      longest: data.reduce((max, s) => s.numberOfAyahs > max.numberOfAyahs ? s : max),
      shortest: data.reduce((min, s) => s.numberOfAyahs < min.numberOfAyahs ? s : min)
    });
  };

  const filterSurahs = () => {
    let filtered = [...surahs];

    // Search
    if (searchTerm) {
      filtered = filtered.filter(surah =>
        surah.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        surah.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        surah.englishNameTranslation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filter !== 'all') {
      filtered = filtered.filter(surah => filter === getRevelationType(surah.number).toLowerCase());
    }

    // Sort
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.englishName.localeCompare(b.englishName));
        break;
      case 'length':
        filtered.sort((a, b) => b.numberOfAyahs - a.numberOfAyahs);
        break;
      case 'revelation':
        filtered.sort((a, b) => a.number - b.number);
        break;
      default:
        filtered.sort((a, b) => a.number - b.number);
    }

    return filtered;
  };

  const getSurahTypeColor = (surahNumber, isCurrent = false) => {
    const type = getRevelationType(surahNumber);
    if (isCurrent) return 'bg-white/20';
    return type === 'Makki'
      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  };

  const handleSurahClick = (surah) => {
    onSurahSelect(surah);
    toast.success(`Loading ${surah.englishName}...`);
  };

  const getPopularityBadge = (surahNumber) => {
    const popularSurahs = [1, 2, 36, 55, 56, 67, 112];
    if (popularSurahs.includes(surahNumber)) {
      return (
        <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400">
          <Star className="h-3 w-3 mr-1" /> Popular
        </div>
      );
    }
    return null;
  };

  const getReadingTime = (ayahs) => `${Math.ceil(ayahs * 0.5)} min`;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(10)].map((_, i) => (
          <div key={i} className={`h-16 rounded-xl animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-200'
            }`}></div>
        ))}
      </div>
    );
  }

  const filteredSurahs = filterSurahs();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Surahs</h2>
            <p className="text-sm opacity-75">114 Chapters</p>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span className="text-sm">{filteredSurahs.length}</span>
          </div>
        </div>

        {/* Quick Stats */}
        {quickStats && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className={`p-3 rounded-xl text-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className="text-xl font-bold text-green-600">{quickStats.makki}</div>
              <div className="text-xs">Makki</div>
            </div>
            <div className={`p-3 rounded-xl text-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className="text-xl font-bold text-blue-600">{quickStats.madani}</div>
              <div className="text-xs">Madani</div>
            </div>
            <div className={`p-3 rounded-xl text-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className="text-xl font-bold text-purple-600">{quickStats.avgLength}</div>
              <div className="text-xs">Avg Ayahs</div>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search surahs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-200'
              } border focus:ring-2 focus:ring-green-500`}
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-3 py-1 rounded-lg text-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
              } border`}
          >
            <option value="number">By Number</option>
            <option value="name">By Name</option>
            <option value="length">By Length</option>
            <option value="revelation">By Revelation</option>
          </select>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`px-3 py-1 rounded-lg text-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
              } border`}
          >
            <option value="all">All Types</option>
            <option value="makki">Makki Only</option>
            <option value="madani">Madani Only</option>
          </select>
        </div>
      </div>

      {/* Surah List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredSurahs.map(surah => {
          const isCurrent = currentSurah?.number === surah.number;
          const type = getRevelationType(surah.number);

          return (
            <button
              key={surah.number}
              onClick={() => handleSurahClick(surah)}
              className={`w-full text-left p-4 rounded-xl transition-all duration-300 group ${isCurrent
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                  : darkMode
                    ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                    : 'bg-white hover:bg-gray-50 border border-gray-200'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${isCurrent ? 'bg-white text-green-600' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}>{surah.number}</div>

                  <div className="text-left">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`font-bold ${isCurrent ? 'text-white' : ''}`}>{surah.englishName}</h3>
                      {getPopularityBadge(surah.number)}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getSurahTypeColor(surah.number, isCurrent)}`}>
                        {type}
                      </span>
                      <span className={`inline-flex items-center ${isCurrent ? 'text-white/80' : 'text-gray-500'}`}>
                        <Hash className="h-3 w-3 mr-1" />{surah.numberOfAyahs} ayahs
                      </span>
                      <span className={`inline-flex items-center ${isCurrent ? 'text-white/80' : 'text-gray-500'}`}>
                        <Clock className="h-3 w-3 mr-1" />{getReadingTime(surah.numberOfAyahs)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className={`text-xl font-arabic ${isCurrent ? 'text-white' : 'opacity-75'}`}>{surah.name}</div>
                  <ChevronRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${isCurrent ? 'text-white' : 'text-gray-400'}`} />
                </div>
              </div>
            </button>
          );
        })}

        {filteredSurahs.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No surahs found</p>
            <p className="text-sm text-gray-400 mt-2">Try different search terms or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurahList;
