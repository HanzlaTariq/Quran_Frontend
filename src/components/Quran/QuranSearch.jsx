import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { quranService } from '../../services';
import {
  Search, X, Filter, Book, Hash, Globe,
  Volume2, Check, ChevronRight, ExternalLink,
  Save, Clock, Star, Copy
} from 'lucide-react';
import { quranUtils } from '../../utils/quranUtils';
import toast from 'react-hot-toast';

const QuranSearch = ({ onSelectAyah, isOpen, onClose }) => {
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedSurah, setSelectedSurah] = useState('all');
  const [selectedTranslation, setSelectedTranslation] = useState('en.asad');
  const [searchHistory, setSearchHistory] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [advancedFilters, setAdvancedFilters] = useState({
    exactMatch: false,
    caseSensitive: false,
    wholeWord: false,
    surahRange: { from: 1, to: 114 },
    juzRange: { from: 1, to: 30 },
    pageRange: { from: 1, to: 604 },
  });

  // Get surahs list
  const { data: surahs = [] } = useQuery({
    queryKey: ['surahs'],
    queryFn: () => quranService.getAllSurahs().then(res => res.data.data),
    staleTime: 60000,
  });

  // Get translations list
  const translations = quranService.getPopularTranslations();

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('quranSearchHistory');
    const saved = localStorage.getItem('quranSavedSearches');

    if (savedHistory) setSearchHistory(JSON.parse(savedHistory));
    if (saved) setSavedSearches(JSON.parse(saved));
  }, []);

  // Save search to history
  const saveToHistory = (search) => {
    const newHistory = [
      search,
      ...searchHistory.filter(h => h.term !== search.term).slice(0, 9)
    ];
    setSearchHistory(newHistory);
    localStorage.setItem('quranSearchHistory', JSON.stringify(newHistory));
  };

  // Save search to favorites
  const saveSearch = (search) => {
    const newSaved = [...savedSearches, { ...search, savedAt: new Date().toISOString() }];
    setSavedSearches(newSaved);
    localStorage.setItem('quranSavedSearches', JSON.stringify(newSaved));
    toast.success('Search saved!');
  };

  // Perform search
  const { data: searchResults, isLoading: isSearching, refetch } = useQuery({
    queryKey: ['quranSearch', searchTerm, selectedSurah, selectedTranslation],
    queryFn: async () => {
      if (!searchTerm.trim()) return { results: [], total: 0 };

      try {
        const response = await quranService.searchQuran(
          searchTerm,
          selectedSurah,
          selectedTranslation
        );

        const searchData = {
          term: searchTerm,
          results: response.data?.data || [],
          total: response.data?.data?.length || 0,
          timestamp: new Date().toISOString(),
          filters: {
            language: selectedLanguage,
            surah: selectedSurah,
            translation: selectedTranslation,
          }
        };

        saveToHistory(searchData);
        return searchData;
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Search failed. Please try again.');
        return { results: [], total: 0 };
      }
    },
    enabled: false, // Manual trigger
  });

  // Handle search
  const handleSearch = () => {
    if (searchTerm.trim()) {
      refetch();
    }
  };

  // Handle key press (Enter)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Copy ayah to clipboard
  const copyAyah = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Ayah copied to clipboard!');
  };

  // Play ayah audio
  const playAyahAudio = async (surahNumber, ayahNumber) => {
    try {
      const response = await quranService.getAyah(
        `${surahNumber}:${ayahNumber}`,
        'ar.alafasy'
      );

      const audioUrl = response.data.data.audio;
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
        toast.success('Playing ayah audio...');
      }
    } catch (error) {
      toast.error('Audio not available');
    }
  };

  // Navigate to ayah
  const navigateToAyah = (surahNumber, ayahNumber) => {
    if (onSelectAyah) {
      onSelectAyah(surahNumber, ayahNumber);
    }
    onClose?.();
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Quick search suggestions
  const quickSuggestions = [
    { term: 'mercy', icon: '💖' },
    { term: 'patience', icon: '⏳' },
    { term: 'paradise', icon: '🏞️' },
    { term: 'hellfire', icon: '🔥' },
    { term: 'prayer', icon: '🙏' },
    { term: 'charity', icon: '🤲' },
    { term: 'forgiveness', icon: '🕊️' },
    { term: 'guidance', icon: '🧭' },
  ];

  // Popular searches
  const popularSearches = [
    { term: 'Allah', count: 145 },
    { term: 'Muhammad', count: 98 },
    { term: 'faith', count: 76 },
    { term: 'knowledge', count: 65 },
    { term: 'justice', count: 54 },
    { term: 'peace', count: 43 },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Search the Quran</h2>
              <p className="text-gray-600">Search across translations and find relevant ayahs</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Search & Filters */}
          <div className="w-1/3 border-r p-6 overflow-y-auto">
            {/* Search Input */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter keyword to search..."
                  className="w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                  autoFocus
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <button
                onClick={handleSearch}
                disabled={!searchTerm.trim() || isSearching}
                className="w-full mt-3 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? 'Searching...' : 'Search Quran'}
              </button>
            </div>

            {/* Quick Filters */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Quick Filters
              </h3>

              <div className="space-y-3">
                {/* Translation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Translation
                  </label>
                  <select
                    value={selectedTranslation}
                    onChange={(e) => setSelectedTranslation(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {translations.map(t => (
                      <option key={t.identifier} value={t.identifier}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Surah */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Surah
                  </label>
                  <select
                    value={selectedSurah}
                    onChange={(e) => setSelectedSurah(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="all">All Surahs</option>
                    {surahs.map(s => (
                      <option key={s.number} value={s.number}>
                        {s.number}. {s.englishName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Advanced Filters Toggle */}
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="text-sm font-medium text-gray-700">
                      Advanced Filters
                    </span>
                    <ChevronRight className="h-4 w-4 group-open:rotate-90 transition-transform" />
                  </summary>

                  <div className="mt-3 space-y-3">
                    {/* Exact Match */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="exactMatch"
                        checked={advancedFilters.exactMatch}
                        onChange={(e) => setAdvancedFilters({
                          ...advancedFilters,
                          exactMatch: e.target.checked
                        })}
                        className="h-4 w-4 text-green-600"
                      />
                      <label htmlFor="exactMatch" className="ml-2 text-sm text-gray-700">
                        Exact match
                      </label>
                    </div>

                    {/* Whole Word */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="wholeWord"
                        checked={advancedFilters.wholeWord}
                        onChange={(e) => setAdvancedFilters({
                          ...advancedFilters,
                          wholeWord: e.target.checked
                        })}
                        className="h-4 w-4 text-green-600"
                      />
                      <label htmlFor="wholeWord" className="ml-2 text-sm text-gray-700">
                        Whole word only
                      </label>
                    </div>
                  </div>
                </details>
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3">Quick Suggestions</h3>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchTerm(suggestion.term);
                      setTimeout(handleSearch, 100);
                    }}
                    className="inline-flex items-center space-x-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                  >
                    <span>{suggestion.icon}</span>
                    <span>{suggestion.term}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800">Recent Searches</h3>
                  <button
                    onClick={() => {
                      setSearchHistory([]);
                      localStorage.removeItem('quranSearchHistory');
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2">
                  {searchHistory.slice(0, 5).map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchTerm(item.term);
                        setTimeout(handleSearch, 100);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-gray-50 flex justify-between items-center"
                    >
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{item.term}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {item.total} results
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3">Popular Searches</h3>
              <div className="space-y-2">
                {popularSearches.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchTerm(item.term);
                      setTimeout(handleSearch, 100);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-gray-50 flex justify-between items-center"
                  >
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span>{item.term}</span>
                    </div>
                    <span className="text-sm text-gray-500">{item.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="w-2/3 p-6 overflow-y-auto">
            {isSearching ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">Searching Quran...</p>
              </div>
            ) : searchResults?.results?.length > 0 ? (
              <>
                {/* Results Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Search Results
                      </h3>
                      <p className="text-gray-600">
                        Found {searchResults.total} results for "{searchResults.term}"
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => saveSearch(searchResults)}
                        className="flex items-center space-x-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save Search</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Results List */}
                <div className="space-y-4">
                  {searchResults.results.map((result, index) => (
                    <div
                      key={index}
                      className="border rounded-xl overflow-hidden hover:shadow-md transition"
                    >
                      <div className="p-5">
                        {/* Arabic Text */}
                        <div className="text-2xl text-right font-arabic leading-loose mb-4">
                          {result.text || result.ayah?.text}
                        </div>

                        {/* Translation */}
                        <div className="p-4 bg-gray-50 rounded-lg mb-4">
                          <div className="text-gray-700 leading-relaxed">
                            {result.translation || 'Translation not available'}
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Book className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium">
                                {quranUtils.getSurahName(result.surah?.number || 1)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Hash className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">Ayah {result.numberInSurah}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Globe className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">Page {result.page}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => copyAyah(result.text)}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                              title="Copy ayah"
                            >
                              <Copy className="h-4 w-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => playAyahAudio(result.surah?.number, result.numberInSurah)}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                              title="Play audio"
                            >
                              <Volume2 className="h-4 w-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => navigateToAyah(result.surah?.number, result.numberInSurah)}
                              className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              <span>View</span>
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : searchTerm ? (
              // No Results
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Results Found</h3>
                <p className="text-gray-600 mb-6">
                  No ayahs found for "{searchTerm}". Try different keywords or check spelling.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Suggestions:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Try simpler or more common words</li>
                    <li>• Check if the word appears in your selected translation</li>
                    <li>• Try searching in a different language</li>
                    <li>• Remove filters to search all surahs</li>
                  </ul>
                </div>
              </div>
            ) : (
              // Initial State
              <div className="text-center py-12">
                <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                  <Search className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  Search the Holy Quran
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Enter keywords to find relevant ayahs across multiple translations.
                  You can filter by surah, translation, and more.
                </p>

                {/* Tips */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 max-w-lg mx-auto">
                  <h4 className="font-bold text-blue-800 mb-2">Search Tips:</h4>
                  <ul className="text-sm text-blue-700 space-y-1 text-left">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Search in English translations by default</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Use specific surah filters for targeted results</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Try different translations for varied interpretations</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Save important searches for quick access later</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Saved Searches */}
            {savedSearches.length > 0 && !searchTerm && (
              <div className="mt-8">
                <h3 className="font-bold text-gray-800 mb-4">Saved Searches</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {savedSearches.map((saved, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-3 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{saved.term}</div>
                          <div className="text-xs text-gray-500">
                            {saved.results.length} results • {new Date(saved.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSearchTerm(saved.term);
                            setTimeout(handleSearch, 100);
                          }}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Search className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        Filters: {saved.filters?.translation || 'en.asad'} •
                        Surah: {saved.filters?.surah === 'all' ? 'All' : saved.filters?.surah}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuranSearch;