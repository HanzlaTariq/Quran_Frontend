import React, { useState, useEffect } from 'react';
import {
  Bookmark, Trash2, Filter, Calendar, Clock,
  ChevronRight, Search, Tag, FolderPlus,
  Star, Share2, Download, Copy,
  MoreVertical, Edit3, Eye, EyeOff,
  Book, Hash, Layers, TrendingUp
} from 'lucide-react';
import { quranService } from '../../services';
import { quranUtils } from '../../utils/quranUtils';
import toast from 'react-hot-toast';

const BookmarksPanel = ({ darkMode }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, recent, favorite, bySurah
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedBookmarks, setSelectedBookmarks] = useState([]);
  const [categories, setCategories] = useState([
    { id: 'favorites', name: 'Favorites', color: 'yellow' },
    { id: 'study', name: 'Study List', color: 'blue' },
    { id: 'memorization', name: 'Memorization', color: 'green' },
    { id: 'reflection', name: 'Reflection', color: 'purple' }
  ]);

  // Load bookmarks from localStorage
  useEffect(() => {
    loadBookmarks();
  }, []);

  useEffect(() => {
    filterBookmarks();
  }, [bookmarks, searchTerm, filter, selectedSurah]);

  const loadBookmarks = () => {
    const saved = localStorage.getItem('quranBookmarks');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Add default category if not present
      const enhanced = parsed.map(b => ({
        ...b,
        category: b.category || 'favorites',
        notes: b.notes || '',
        tags: b.tags || [],
        favorite: b.favorite || false
      }));
      setBookmarks(enhanced);
    }
  };

  const filterBookmarks = () => {
    let filtered = [...bookmarks];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filter === 'recent') {
      filtered = filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (filter === 'favorite') {
      filtered = filtered.filter(b => b.favorite);
    } else if (filter === 'bySurah' && selectedSurah) {
      filtered = filtered.filter(b => b.surah === selectedSurah);
    }

    setFilteredBookmarks(filtered);
  };

  const deleteBookmark = (index) => {
    const newBookmarks = bookmarks.filter((_, i) => i !== index);
    setBookmarks(newBookmarks);
    localStorage.setItem('quranBookmarks', JSON.stringify(newBookmarks));
    setShowDeleteConfirm(null);
    toast.success('Bookmark deleted');
  };

  const deleteSelected = () => {
    const newBookmarks = bookmarks.filter((_, i) => !selectedBookmarks.includes(i));
    setBookmarks(newBookmarks);
    setSelectedBookmarks([]);
    localStorage.setItem('quranBookmarks', JSON.stringify(newBookmarks));
    toast.success(`${selectedBookmarks.length} bookmarks deleted`);
  };

  const toggleFavorite = (index) => {
    const newBookmarks = [...bookmarks];
    newBookmarks[index].favorite = !newBookmarks[index].favorite;
    setBookmarks(newBookmarks);
    localStorage.setItem('quranBookmarks', JSON.stringify(newBookmarks));
    toast.success(newBookmarks[index].favorite ? 'Added to favorites' : 'Removed from favorites');
  };

  const updateCategory = (index, categoryId) => {
    const newBookmarks = [...bookmarks];
    newBookmarks[index].category = categoryId;
    setBookmarks(newBookmarks);
    localStorage.setItem('quranBookmarks', JSON.stringify(newBookmarks));
    toast.success('Category updated');
  };

  const addNote = (index, note) => {
    const newBookmarks = [...bookmarks];
    newBookmarks[index].notes = note;
    setBookmarks(newBookmarks);
    localStorage.setItem('quranBookmarks', JSON.stringify(newBookmarks));
  };

  const shareBookmark = async (bookmark) => {
    const text = `Bookmark: Surah ${bookmark.surah}:${bookmark.ayah}\n"${bookmark.text}"`;
    
    if (navigator.share) {
      await navigator.share({
        title: 'Quran Bookmark',
        text: text,
        url: quranUtils.generateShareLink(bookmark.surah, bookmark.ayah)
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Bookmark copied!');
    }
  };

  const exportBookmarks = () => {
    const dataStr = JSON.stringify(bookmarks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `quran-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('Bookmarks exported!');
  };

  const importBookmarks = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        const merged = [...bookmarks, ...imported];
        setBookmarks(merged);
        localStorage.setItem('quranBookmarks', JSON.stringify(merged));
        toast.success('Bookmarks imported!');
      } catch (error) {
        toast.error('Invalid file format');
      }
    };
    
    reader.readAsText(file);
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return 'gray';
    
    const colors = {
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    
    return colors[category.color] || colors.gray;
  };

  const getStats = () => {
    const total = bookmarks.length;
    const favorites = bookmarks.filter(b => b.favorite).length;
    const bySurah = {};
    
    bookmarks.forEach(b => {
      bySurah[b.surah] = (bySurah[b.surah] || 0) + 1;
    });
    
    const mostBookmarkedSurah = Object.entries(bySurah)
      .sort((a, b) => b[1] - a[1])[0];
    
    return { total, favorites, mostBookmarkedSurah };
  };

  const stats = getStats();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className={`rounded-2xl p-6 mb-8 bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-xl`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-4 mb-4">
              <Bookmark className="h-12 w-12" />
              <div>
                <h1 className="text-3xl font-bold">Bookmarks</h1>
                <p className="text-xl opacity-90">Your saved verses and reflections</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Book className="h-4 w-4" />
                <span>{stats.total} bookmarks</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4" />
                <span>{stats.favorites} favorites</span>
              </div>
              {stats.mostBookmarkedSurah && (
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Surah {stats.mostBookmarkedSurah[0]} ({stats.mostBookmarkedSurah[1]})</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={exportBookmarks}
              className="flex items-center space-x-2 bg-white text-yellow-700 px-4 py-2 rounded-lg font-bold hover:bg-yellow-50 transition"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <label className="flex items-center space-x-2 bg-white text-yellow-700 px-4 py-2 rounded-lg font-bold hover:bg-yellow-50 transition cursor-pointer">
              <FolderPlus className="h-4 w-4" />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={importBookmarks}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`mb-6 p-4 rounded-xl border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookmarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-100 border-gray-200'
                } border`}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-gray-100 border-gray-200'
              } border`}
            >
              <option value="all">All Bookmarks</option>
              <option value="recent">Recently Added</option>
              <option value="favorite">Favorites</option>
              <option value="bySurah">By Surah</option>
            </select>

            {filter === 'bySurah' && (
              <select
                value={selectedSurah || ''}
                onChange={(e) => setSelectedSurah(e.target.value)}
                className={`px-3 py-2 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-100 border-gray-200'
                } border`}
              >
                <option value="">Select Surah</option>
                {[...new Set(bookmarks.map(b => b.surah))].map(surah => (
                  <option key={surah} value={surah}>
                    Surah {surah}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-3 py-2 rounded-lg ${
                editMode
                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  : darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {editMode ? 'Done' : 'Edit'}
            </button>

            {editMode && selectedBookmarks.length > 0 && (
              <button
                onClick={deleteSelected}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete ({selectedBookmarks.length})
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(category.id)}`}
            >
              {category.name}
              <span className="ml-1 opacity-75">
                ({bookmarks.filter(b => b.category === category.id).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bookmarks Grid */}
      {filteredBookmarks.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            No bookmarks found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {bookmarks.length === 0 
              ? 'Start by bookmarking verses while reading the Quran' 
              : 'Try different search terms or filters'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookmarks.map((bookmark, index) => (
            <div
              key={index}
              className={`rounded-xl border p-4 transition-all duration-300 ${
                selectedBookmarks.includes(index)
                  ? 'ring-2 ring-green-500'
                  : darkMode 
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      getCategoryColor(bookmark.category)
                    }`}>
                      {categories.find(c => c.id === bookmark.category)?.name}
                    </span>
                    {bookmark.favorite && (
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <h4 className="font-bold">
                    Surah {bookmark.surah}:{bookmark.ayah}
                  </h4>
                </div>

                <div className="flex items-center space-x-1">
                  {editMode ? (
                    <input
                      type="checkbox"
                      checked={selectedBookmarks.includes(index)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBookmarks([...selectedBookmarks, index]);
                        } else {
                          setSelectedBookmarks(selectedBookmarks.filter(i => i !== index));
                        }
                      }}
                      className="h-4 w-4 text-green-600"
                    />
                  ) : (
                    <button
                      onClick={() => toggleFavorite(index)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      <Star className={`h-4 w-4 ${
                        bookmark.favorite 
                          ? 'text-yellow-500 fill-current' 
                          : 'text-gray-400'
                      }`} />
                    </button>
                  )}
                  
                  <div className="relative">
                    <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    <div className={`absolute right-0 top-full mt-1 py-1 min-w-[120px] rounded-lg shadow-lg z-10 ${
                      darkMode ? 'bg-gray-800' : 'bg-white'
                    } hidden hover:block`}>
                      <button
                        onClick={() => shareBookmark(bookmark)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Share
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(bookmark.text);
                          toast.success('Text copied!');
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Copy Text
                      </button>
                      {showDeleteConfirm === index ? (
                        <button
                          onClick={() => deleteBookmark(index)}
                          className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                        >
                          Confirm Delete
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowDeleteConfirm(index)}
                          className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ayah Text */}
              <div className="mb-3">
                <div className="text-right font-arabic text-lg leading-relaxed mb-2">
                  {bookmark.text}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {bookmark.translation?.substring(0, 100)}...
                </div>
              </div>

              {/* Notes */}
              {bookmark.notes && (
                <div className={`mt-3 p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <Edit3 className="h-3 w-3" />
                    <span className="text-xs font-medium">Notes</span>
                  </div>
                  <p className="text-sm">{bookmark.notes}</p>
                </div>
              )}

              {/* Tags */}
              {bookmark.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {bookmark.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3" />
                    <span>{quranUtils.formatBookmarkDate(bookmark.timestamp)}</span>
                  </div>
                  
                  <button
                    onClick={() => window.location.href = `/quran/${bookmark.surah}/${bookmark.ayah}`}
                    className="text-green-600 hover:text-green-700"
                  >
                    View →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarksPanel;