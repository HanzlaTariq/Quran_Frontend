import React, { useState } from 'react';
import {
  Play, Pause, Bookmark, Share2, Download,
  Copy, Heart, ChevronDown, ChevronUp,
  Volume2, Maximize2, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const AyahCard = ({
  ayah,
  viewMode,
  fontSize,
  darkMode,
  isPlaying,
  isBookmarked,
  onPlay,
  onBookmark,
  onShare,
  onDownload,
  onSelect,
  showTafsir
}) => {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ayah.text);
    toast.success('Text copied!');
  };

  const handleLike = () => {
    setLiked(!liked);
    toast.success(liked ? 'Like removed' : 'Liked!');
  };

  const getViewModeClass = () => {
    switch(viewMode) {
      case 'arabic':
        return 'text-center';
      case 'translation':
        return 'text-left';
      default:
        return 'text-right';
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 hover:shadow-lg ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
      onClick={() => onSelect?.()}
    >
      <div className="p-6">
        {/* Arabic Text */}
        {(viewMode === 'split' || viewMode === 'arabic') && (
          <div className={`mb-6 ${getViewModeClass()}`}>
            <div
              className="font-arabic leading-loose mb-4"
              style={{ fontSize: `${fontSize}px` }}
            >
              {ayah.text}
            </div>
            <div className="flex justify-end items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm ${
                darkMode 
                  ? 'bg-green-900 text-green-200' 
                  : 'bg-green-100 text-green-800'
              }`}>
                Ayah {ayah.number}
              </div>
              <div className="text-sm opacity-75">
                Page {ayah.page} • Juz {ayah.juz || 'N/A'}
              </div>
            </div>
          </div>
        )}

        {/* Translation */}
        {(viewMode === 'split' || viewMode === 'translation') && (
          <div className={`p-4 rounded-xl mb-6 ${
            darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <div 
              className="text-gray-900 dark:text-gray-300 leading-relaxed"
              style={{ fontSize: `${fontSize * 0.8}px` }}
            >
              {ayah.translation}
            </div>
          </div>
        )}

        {/* Tafsir Section */}
        {showTafsir && expanded && (
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800">
            <div className="flex items-center mb-3">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
              <h4 className="font-bold text-purple-700 dark:text-purple-300">Tafsir</h4>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {ayah.tafsir || 'Tafsir data not available for this ayah.'}
            </p>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center flex-wrap gap-2">
            {/* Play Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay();
              }}
              className={`p-3 rounded-xl transition hover:scale-105 ${
                isPlaying
                  ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                  : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
              }`}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>

            {/* Bookmark */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark();
              }}
              className={`p-3 rounded-xl transition hover:scale-105 ${
                isBookmarked
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Share */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:scale-105 transition"
            >
              <Share2 className="h-5 w-5" />
            </button>

            {/* Download */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload();
              }}
              className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 hover:scale-105 transition"
            >
              <Download className="h-5 w-5" />
            </button>

            {/* Copy */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 hover:scale-105 transition"
            >
              <Copy className="h-5 w-5" />
            </button>

            {/* Like */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              className={`p-3 rounded-xl transition hover:scale-105 ${
                liked
                  ? 'bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
            </button>

            {/* Expand */}
            {showTafsir && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:scale-105 transition"
              >
                {expanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm opacity-75">
              {ayah.sajda && '🕌 '} {/* Show mosque icon for sajda ayahs */}
              {ayah.ruku && `Ruku ${ayah.ruku}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AyahCard;