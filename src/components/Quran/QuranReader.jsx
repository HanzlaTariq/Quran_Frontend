import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { quranService } from '../../services';
import AyahCard from './AyahCard';
import {
  Play, Bookmark, Share2, Download,
  ChevronLeft, ChevronRight, Maximize2,
  BookOpen, Clock, Award, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuranReader = ({
  surahNumber,
  translation,
  reciter,
  fontSize,
  theme,
  onAyahSelect,
  currentAyah,
  darkMode
}) => {
  const [ayahs, setAyahs] = useState([]);
  const [surahInfo, setSurahInfo] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // split, arabic, translation
  const [showTafsir, setShowTafsir] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch surah data
  const { data, isLoading, error } = useQuery({
    queryKey: ['surah', surahNumber, translation, reciter],
    queryFn: async () => {
      const [arabic, translationData, audio] = await Promise.all([
        quranService.getSurah(surahNumber, 'quran-uthmani'),
        quranService.getSurah(surahNumber, translation),
        quranService.getSurah(surahNumber, reciter),
      ]);

      return {
        arabic: arabic.data.data,
        translation: translationData.data.data,
        audio: audio.data.data
      };
    },
    enabled: !!surahNumber,
  });

  useEffect(() => {
    if (data) {
      const combinedAyahs = data.arabic.ayahs.map((ayah, index) => ({
        ...ayah,
        translation: data.translation.ayahs[index]?.text || '',
        audio: data.audio.ayahs[index]?.audio || '',
        tafsir: null,
      }));
      setAyahs(combinedAyahs);
      setSurahInfo(data.arabic);
    }
  }, [data]);

  const handleBookmark = (ayahNumber) => {
    const bookmark = {
      surah: surahNumber,
      ayah: ayahNumber,
      text: ayahs.find(a => a.number === ayahNumber)?.text?.substring(0, 100),
      timestamp: new Date().toISOString(),
    };

    const newBookmarks = [...bookmarks, bookmark];
    setBookmarks(newBookmarks);
    localStorage.setItem('quranBookmarks', JSON.stringify(newBookmarks));
    toast.success('Bookmark saved!');
  };

  const handleShare = async (ayahNumber) => {
    const text = ayahs.find(a => a.number === ayahNumber)?.text;
    const shareData = {
      title: `Surah ${surahInfo?.englishName} - Ayah ${ayahNumber}`,
      text: text,
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Text copied to clipboard!');
    }
  };

  const handlePlayAyah = async (ayahNumber) => {
    try {
      const ayah = ayahs.find(a => a.number === ayahNumber);
      if (ayah?.audio) {
        const audio = new Audio(ayah.audio);
        await audio.play();
        setIsPlaying(true);
        onAyahSelect?.(ayahNumber);
        
        audio.onended = () => setIsPlaying(false);
      }
    } catch (error) {
      toast.error('Failed to play audio');
    }
  };

  const handleDownload = (ayahNumber) => {
    const ayah = ayahs.find(a => a.number === ayahNumber);
    if (ayah?.audio) {
      const link = document.createElement('a');
      link.href = ayah.audio;
      link.download = `surah-${surahNumber}-ayah-${ayahNumber}.mp3`;
      link.click();
      toast.success('Download started!');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse">
          <div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Failed to load surah</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Surah Header */}
      <div className={`rounded-2xl p-6 mb-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-4 mb-4">
              <div className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                <span className="text-2xl font-bold">Surah {surahNumber}</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2 font-arabic">
                  {surahInfo?.name}
                </h1>
                <p className="text-xl opacity-90">{surahInfo?.englishName}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>{surahInfo?.numberOfAyahs} Ayahs</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{surahInfo?.revelationType}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4" />
                <span>Juz {surahInfo?.juz?.join('-') || 'Multiple'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handlePlayAyah(1)}
              className="flex items-center space-x-2 bg-white text-green-700 px-6 py-3 rounded-full font-bold hover:bg-green-50 transition-all hover:scale-105"
            >
              <Play className="h-5 w-5" />
              <span>Play Surah</span>
            </button>
            <button className="p-3 bg-white/20 rounded-full hover:bg-white/30">
              <Maximize2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Reading Progress */}
      <div className={`mb-8 p-6 rounded-xl border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">Reading Progress</h3>
            <p className="text-sm opacity-75">
              {ayahs.length} ayahs in this surah
            </p>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {((currentAyah / ayahs.length) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
            style={{ width: `${(currentAyah / ayahs.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* View Controls */}
      <div className={`mb-6 p-4 rounded-xl border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <span className="font-medium">View:</span>
            {['split', 'arabic', 'translation'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg transition ${
                  viewMode === mode
                    ? 'bg-green-600 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowTafsir(!showTafsir)}
              className={`px-4 py-2 rounded-lg transition ${
                showTafsir
                  ? 'bg-purple-600 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Sparkles className="h-4 w-4 inline mr-2" />
              Tafsir
            </button>
          </div>
        </div>
      </div>

      {/* Ayahs List */}
      <div className="space-y-6">
        {ayahs.map((ayah) => (
          <AyahCard
            key={ayah.number}
            ayah={ayah}
            viewMode={viewMode}
            fontSize={fontSize}
            darkMode={darkMode}
            isPlaying={isPlaying && currentAyah === ayah.number}
            isBookmarked={bookmarks.some(b => b.ayah === ayah.number)}
            onPlay={() => handlePlayAyah(ayah.number)}
            onBookmark={() => handleBookmark(ayah.number)}
            onShare={() => handleShare(ayah.number)}
            onDownload={() => handleDownload(ayah.number)}
            onSelect={() => onAyahSelect?.(ayah.number)}
            showTafsir={showTafsir}
          />
        ))}
      </div>

      {/* Navigation */}
      {ayahs.length > 0 && (
        <div className={`mt-8 sticky bottom-4 p-6 rounded-xl border shadow-lg ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => onAyahSelect?.(Math.max(1, currentAyah - 1))}
              disabled={currentAyah === 1}
              className="flex items-center space-x-2 px-6 py-3 rounded-full border disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Previous</span>
            </button>

            <div className="text-center">
              <div className="font-bold text-lg">
                Ayah {currentAyah} of {ayahs.length}
              </div>
              <div className="text-sm opacity-75">
                Surah {surahInfo?.englishName}
              </div>
            </div>

            <button
              onClick={() => onAyahSelect?.(Math.min(ayahs.length, currentAyah + 1))}
              disabled={currentAyah === ayahs.length}
              className="flex items-center space-x-2 px-6 py-3 rounded-full border disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span>Next</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuranReader;