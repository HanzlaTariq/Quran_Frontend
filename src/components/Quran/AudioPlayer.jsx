import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Repeat, Shuffle,
  Maximize2, Heart, Download, Share2
} from 'lucide-react';
import { quranService } from '../../services';
import toast from 'react-hot-toast';

const AudioPlayer = ({
  surahNumber,
  ayahNumber,
  reciter,
  isPlaying,
  onPlayPause,
  darkMode,
  onNext,
  onPrevious
}) => {
  const [audio, setAudio] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // none, one, all
  const [shuffleMode, setShuffleMode] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const audioRef = useRef(null);

  useEffect(() => {
    if (surahNumber && ayahNumber) {
      loadAudio(surahNumber, ayahNumber);
    }
  }, [surahNumber, ayahNumber, reciter]);

  const loadAudio = async (surahNum, ayahNum) => {
    try {
      const response = await quranService.getAyah(`${surahNum}:${ayahNum}`, reciter);
      const audioUrl = response.data.data.audio;

      if (audioUrl) {
        if (audioRef.current) {
          audioRef.current.pause();
        }

        const newAudio = new Audio(audioUrl);
        audioRef.current = newAudio;

        newAudio.addEventListener('loadedmetadata', () => {
          setDuration(newAudio.duration);
        });

        newAudio.addEventListener('timeupdate', () => {
          setCurrentTime(newAudio.currentTime);
        });

        newAudio.addEventListener('ended', handleTrackEnd);

        if (isPlaying) {
          newAudio.play();
        }

        setAudio(newAudio);
      }
    } catch (error) {
      toast.error('Failed to load audio');
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      onPlayPause(!isPlaying);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const handleTrackEnd = () => {
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (repeatMode === 'all') {
      handleNext();
    } else {
      onPlayPause(false);
    }
  };

  const handleNext = () => {
    onNext?.();
  };

  const handlePrevious = () => {
    onPrevious?.();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (audioRef.current?.src) {
      const link = document.createElement('a');
      link.href = audioRef.current.src;
      link.download = `quran-${surahNumber}-${ayahNumber}.mp3`;
      link.click();
      toast.success('Download started!');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Quran Audio - Surah ${surahNumber}:${ayahNumber}`,
      text: `Listen to Surah ${surahNumber}, Ayah ${ayahNumber}`,
      url: audioRef.current?.src,
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast.success('Audio link copied!');
    }
  };

  if (!surahNumber) {
    return null;
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transform transition-transform ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      } border-t shadow-2xl`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Track Info */}
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
              <Play className="h-6 w-6 text-green-600" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold truncate">
                Surah {surahNumber}:{ayahNumber}
              </h4>
              <p className="text-sm opacity-75 truncate">
                Reciter: {reciter.split('.').pop()}
              </p>
            </div>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>

          {/* Player Controls */}
          <div className="flex-1 max-w-2xl">
            {/* Progress Bar */}
            <div className="flex items-center space-x-4 mb-2">
              <span className="text-sm tabular-nums">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-600"
              />
              <span className="text-sm tabular-nums">
                {formatTime(duration)}
              </span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center space-x-6">
              <button
                onClick={() => setRepeatMode(
                  repeatMode === 'none' ? 'one' :
                    repeatMode === 'one' ? 'all' : 'none'
                )}
                className={`p-2 rounded-full ${repeatMode !== 'none'
                    ? 'text-green-600 bg-green-100 dark:bg-green-900'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <Repeat className="h-5 w-5" />
              </button>

              <button
                onClick={handlePrevious}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <SkipBack className="h-6 w-6" />
              </button>

              <button
                onClick={handlePlayPause}
                className="p-4 bg-green-600 text-white rounded-full hover:bg-green-700 shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8" />
                )}
              </button>

              <button
                onClick={handleNext}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <SkipForward className="h-6 w-6" />
              </button>

              <button
                onClick={() => setShuffleMode(!shuffleMode)}
                className={`p-2 rounded-full ${shuffleMode
                    ? 'text-green-600 bg-green-100 dark:bg-green-900'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <Shuffle className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-4 flex-1 justify-end">
            <button
              onClick={handleMuteToggle}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-600"
            />
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <Maximize2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;