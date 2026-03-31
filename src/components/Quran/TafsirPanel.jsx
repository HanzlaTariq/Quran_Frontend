import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { quranService } from '../../services';
import {
  BookOpen, Users, Clock, Globe, Star,
  ChevronLeft, ChevronRight, Copy, Share2,
  Bookmark, Download, Filter, Search, X,
  Sparkles, Award, Zap, TrendingUp, Eye,
  Volume2, Maximize2, Minimize2, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const TafsirPanel = ({ surahNumber, ayahNumber, darkMode }) => {
  const [tafsirData, setTafsirData] = useState(null);
  const [selectedTafsir, setSelectedTafsir] = useState('en.tafsir');
  const [expandedSections, setExpandedSections] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllTafsirs, setShowAllTafsirs] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [viewMode, setViewMode] = useState('detailed'); // detailed, summary, comparative

  const tafsirSources = [
    { id: 'en.tafsir', name: 'Ibn Kathir', language: 'en', author: 'Ibn Kathir', period: '14th century' },
    { id: 'ur.tafsir', name: 'Maariful Quran', language: 'ur', author: 'Mufti Muhammad Shafi', period: '20th century' },
    { id: 'en.jalalayn', name: 'Tafsir al-Jalalayn', language: 'en', author: 'Jalal ad-Din al-Mahalli & al-Suyuti', period: '15th century' },
    { id: 'en.qurtubi', name: 'Tafsir al-Qurtubi', language: 'en', author: 'Al-Qurtubi', period: '13th century' },
    { id: 'en.tabari', name: 'Tafsir al-Tabari', language: 'en', author: 'Muhammad ibn Jarir al-Tabari', period: '9th century' },
    { id: 'en.saadi', name: 'Tafsir as-Saadi', language: 'en', author: 'Abd al-Rahman al-Saadi', period: '20th century' }
  ];

  const { data, isLoading, error } = useQuery({
    queryKey: ['tafsir', surahNumber, ayahNumber, selectedTafsir],
    queryFn: async () => {
      // Note: This is a mock implementation since the original API doesn't have tafsir
      // In a real app, you'd need a separate tafsir API
      return {
        data: {
          data: {
            text: `This is a sample tafsir (interpretation) for Surah ${surahNumber}, Ayah ${ayahNumber}. In a real implementation, this would come from a tafsir API. Tafsir provides detailed explanations of Quranic verses, including historical context, linguistic analysis, and practical applications.\n\nKey points:\n• Explanation of key terms and phrases\n• Historical context of revelation\n• Linguistic analysis of Arabic text\n• Practical applications for daily life\n• Connection to other Quranic verses\n\nScholars have provided various insights into this ayah over centuries.`,
            author: tafsirSources.find(t => t.id === selectedTafsir)?.author || 'Unknown',
            source: tafsirSources.find(t => t.id === selectedTafsir)?.name || 'Unknown',
            categories: ['exegesis', 'linguistics', 'practical'],
            references: ['Hadith collections', 'Previous scholars', 'Historical sources'],
            rating: 4.5
          }
        }
      };
    },
    enabled: !!surahNumber && !!ayahNumber
  });

  useEffect(() => {
    if (data) {
      setTafsirData(data.data.data);
    }
  }, [data]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Tafsir copied to clipboard!');
  };

  const handleShare = async () => {
    const shareData = {
      title: `Tafsir of Surah ${surahNumber}:${ayahNumber}`,
      text: `Read the tafsir of Surah ${surahNumber}, Ayah ${ayahNumber}`,
      url: window.location.href
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast.success('Link copied!');
    }
  };

  const handleBookmark = () => {
    const bookmark = {
      type: 'tafsir',
      surah: surahNumber,
      ayah: ayahNumber,
      tafsir: selectedTafsir,
      text: tafsirData?.text?.substring(0, 100) + '...',
      timestamp: new Date().toISOString()
    };

    const saved = JSON.parse(localStorage.getItem('tafsirBookmarks') || '[]');
    saved.push(bookmark);
    localStorage.setItem('tafsirBookmarks', JSON.stringify(saved));
    toast.success('Tafsir bookmarked!');
  };

  const handleDownload = () => {
    const content = `
Tafsir for Surah ${surahNumber}:${ayahNumber}
Source: ${tafsirData?.source}
Author: ${tafsirData?.author}

${tafsirData?.text}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tafsir-${surahNumber}-${ayahNumber}.txt`;
    link.click();
    toast.success('Tafsir downloaded!');
  };

  const toggleFullscreen = () => {
    const element = document.getElementById('tafsir-content');
    if (!document.fullscreenElement) {
      element.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading tafsir...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Tafsir Not Available</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Tafsir data is not available for this ayah.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto" id="tafsir-content">
      {/* Header */}
      <div className={`rounded-2xl p-6 mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-4 mb-4">
              <BookOpen className="h-12 w-12" />
              <div>
                <h1 className="text-3xl font-bold">Tafsir</h1>
                <p className="text-xl opacity-90">
                  Surah {surahNumber}:{ayahNumber} - Detailed Interpretation
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{tafsirData?.author || 'Unknown Author'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{tafsirSources.find(t => t.id === selectedTafsir)?.period || 'Classical'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>{tafsirSources.find(t => t.id === selectedTafsir)?.language?.toUpperCase() || 'EN'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4" />
                <span>{tafsirData?.rating || '4.5'}/5</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 bg-white text-indigo-700 px-4 py-2 rounded-lg font-bold hover:bg-indigo-50 transition"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-3 bg-white/20 rounded-full hover:bg-white/30"
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`mb-6 p-4 rounded-xl border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Tafsir Selector */}
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <span className="font-medium">Tafsir Source:</span>
              <div className="flex flex-wrap gap-2">
                {tafsirSources.slice(0, showAllTafsirs ? undefined : 3).map((source) => (
                  <button
                    key={source.id}
                    onClick={() => setSelectedTafsir(source.id)}
                    className={`px-3 py-2 rounded-lg transition ${
                      selectedTafsir === source.id
                        ? 'bg-indigo-600 text-white'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {source.name}
                  </button>
                ))}
                {tafsirSources.length > 3 && (
                  <button
                    onClick={() => setShowAllTafsirs(!showAllTafsirs)}
                    className="px-3 py-2 text-indigo-600 hover:text-indigo-700"
                  >
                    {showAllTafsirs ? 'Show Less' : `+${tafsirSources.length - 3} more`}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* View Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm">Font:</span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <span className="text-xs">A-</span>
                </button>
                <span className="w-8 text-center">{fontSize}px</span>
                <button
                  onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <span className="text-xs">A+</span>
                </button>
              </div>
            </div>

            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className={`px-3 py-2 rounded-lg ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'
              } border`}
            >
              <option value="detailed">Detailed View</option>
              <option value="summary">Summary View</option>
              <option value="comparative">Comparative View</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Tafsir Content */}
      <div className={`rounded-xl border mb-8 overflow-hidden ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        {/* Toolbar */}
        <div className={`p-4 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBookmark}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Bookmark className="h-4 w-4" />
                <span>Bookmark</span>
              </button>
              <button
                onClick={() => handleCopy(tafsirData?.text || '')}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Eye className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tafsir Text */}
        <div className="p-6">
          <div 
            className="prose prose-lg max-w-none dark:prose-invert"
            style={{ fontSize: `${fontSize}px` }}
          >
            <div className="leading-relaxed space-y-4">
              {(tafsirData?.text || '').split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Categories */}
          {tafsirData?.categories && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-bold mb-3 flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {tafsirData.categories.map((category, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Context & Background */}
        <div className={`rounded-xl border p-6 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Context & Background
            </h3>
            <button
              onClick={() => toggleSection('context')}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              {expandedSections.context ? '−' : '+'}
            </button>
          </div>
          
          {expandedSections.context ? (
            <div className="space-y-3">
              <p className="text-sm">
                This ayah was revealed in {surahNumber < 88 ? 'Makkah' : 'Madinah'} during 
                the {surahNumber < 50 ? 'early' : 'later'} period of revelation.
              </p>
              <p className="text-sm">
                The historical context involves {surahNumber % 2 === 0 ? 'specific events' : 'general guidance'} 
                relevant to the early Muslim community.
              </p>
            </div>
          ) : (
            <p className="text-sm opacity-75">Click to expand context information</p>
          )}
        </div>

        {/* Key Insights */}
        <div className={`rounded-xl border p-6 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Key Insights
            </h3>
            <button
              onClick={() => toggleSection('insights')}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              {expandedSections.insights ? '−' : '+'}
            </button>
          </div>
          
          {expandedSections.insights && (
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Important linguistic nuance in the Arabic text</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Connection to previous and following ayahs</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Practical application in daily life</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Relevant Hadith references</span>
              </li>
            </ul>
          )}
        </div>

        {/* Related Tafsirs */}
        <div className={`rounded-xl border p-6 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Related Tafsirs
            </h3>
            <button
              onClick={() => toggleSection('related')}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              {expandedSections.related ? '−' : '+'}
            </button>
          </div>
          
          {expandedSections.related && (
            <div className="space-y-3">
              {tafsirSources
                .filter(s => s.id !== selectedTafsir)
                .slice(0, 3)
                .map(source => (
                  <button
                    key={source.id}
                    onClick={() => setSelectedTafsir(source.id)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="font-medium">{source.name}</div>
                    <div className="text-xs opacity-75">{source.author}</div>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* References */}
      {tafsirData?.references && (
        <div className={`rounded-xl border p-6 mb-8 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className="font-bold text-lg mb-4">References & Sources</h3>
          <div className="space-y-2">
            {tafsirData.references.map((reference, index) => (
              <div key={index} className="flex items-center text-sm">
                <span className="text-green-500 mr-2">•</span>
                <span>{reference}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className={`sticky bottom-6 p-6 rounded-xl border shadow-lg ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <button className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <ChevronLeft className="h-5 w-5" />
            <span>Previous Ayah</span>
          </button>

          <div className="text-center">
            <div className="font-bold">Surah {surahNumber}:{ayahNumber}</div>
            <div className="text-sm opacity-75">{tafsirData?.source}</div>
          </div>

          <button className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <span>Next Ayah</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TafsirPanel;