import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const getTranslationEdition = (translation = {}) => {
  const lang = translation.language || 'en';
  const translator = (translation.translator || '').toLowerCase();

  if (lang === 'ur') return 'ur.jalandhry';
  if (lang === 'fr') return 'fr.hamidullah';
  if (lang === 'tr') return 'tr.diyanet';

  if (translator.includes('yusuf')) return 'en.yusufali';
  if (translator.includes('pickthall')) return 'en.pickthall';
  if (translator.includes('muhsin')) return 'en.muhsin';
  if (translator.includes('sahih')) return 'en.sahih';

  return 'en.asad';
};

const getReciterEdition = (reciterName = '') => {
  const reciter = reciterName.toLowerCase();

  if (reciter.includes('abdul basit')) return 'ar.abdulbasitmurattal';
  if (reciter.includes('sudais')) return 'ar.abdurrahmaansudais';
  if (reciter.includes('maher')) return 'ar.mahermuaiqly';
  if (reciter.includes('shuraim')) return 'ar.saoodshuraym';
  if (reciter.includes('mishary')) return 'ar.alafasy';

  return 'ar.alafasy';
};

const getTafseerEdition = (tafseer = {}) => {
  if (!tafseer?.enabled) return null;

  const tafseerName = (tafseer.tafseerName || '').toLowerCase();
  if (tafseerName.includes('ibn kathir')) return 'en.ibnkathir';
  if (tafseerName.includes('jalalayn')) return 'en.jalalayn';
  if (tafseerName.includes('qurtubi')) return 'en.qurtubi';

  // Safe default for text tafseer edition
  return 'en.ibnkathir';
};

const getArabicFontFamily = (fontFamily = '') => {
  const family = fontFamily.toLowerCase();

  if (family.includes('indopak')) return 'serif';
  if (family.includes('nastaleeq')) return 'Noto Nastaliq Urdu, serif';
  return 'serif';
};

const getTranslationSpeechLang = (translation = {}) => {
  const lang = (translation.language || 'en').toLowerCase();
  if (lang === 'ur') return 'ur-PK';
  if (lang === 'fr') return 'fr-FR';
  if (lang === 'tr') return 'tr-TR';
  if (lang === 'ar') return 'ar-SA';
  return 'en-US';
};

const Quran = () => {
  const { user } = useAuth();
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [surahData, setSurahData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loadingSurahs, setLoadingSurahs] = useState(false);
  const [loadingAyahs, setLoadingAyahs] = useState(false);
  const [currentAudio, setCurrentAudio] = useState('');
  const [mobileSurahListOpen, setMobileSurahListOpen] = useState(false);
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(1);
  const [rangeApplied, setRangeApplied] = useState(false);
  const [playQueue, setPlayQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [queueMode, setQueueMode] = useState('single');
  const audioRef = useRef(null);

  const [quranSettings, setQuranSettings] = useState({
    translation: { language: 'en', translator: 'Sahih International', enabled: true },
    tafseer: { enabled: false, tafseerName: 'Ibn Kathir' },
    font: { arabicSize: 22, translationSize: 16, fontFamily: 'Uthmani' },
    audio: { reciter: 'Abdul Basit', autoPlay: false },
    readingMode: { mode: 'light', showAyahNumber: true },
  });

  const isDark = quranSettings.readingMode?.mode === 'dark';
  const showArabic = quranSettings.readingMode?.showArabic !== false;
  const showTranslation = Boolean(quranSettings.translation?.enabled);
  const showTafseer = Boolean(quranSettings.tafseer?.enabled);
  const translationEdition = useMemo(
    () => getTranslationEdition(quranSettings.translation),
    [quranSettings.translation]
  );
  const reciterEdition = useMemo(
    () => getReciterEdition(quranSettings.audio?.reciter),
    [quranSettings.audio?.reciter]
  );
  const tafseerEdition = useMemo(
    () => getTafseerEdition(quranSettings.tafseer),
    [quranSettings.tafseer]
  );

  useEffect(() => {
    const loadSurahs = async () => {
      try {
        setLoadingSurahs(true);
        const response = await axios.get('/api/quran/surah');
        setSurahs(response.data?.data || []);
      } catch (error) {
        toast.error('Failed to load Surah list');
      } finally {
        setLoadingSurahs(false);
      }
    };

    loadSurahs();
  }, []);

  useEffect(() => {
    if (!user?._id) return;

    const loadSettings = async () => {
      try {
        const response = await axios.get(`/api/quran/settings/${user._id}`);
        if (response.data) {
          setQuranSettings(response.data);
        }
      } catch (error) {
        // Keep defaults if settings are unavailable.
      }
    };

    loadSettings();
  }, [user?._id]);

  useEffect(() => {
    const loadSurah = async () => {
      try {
        setLoadingAyahs(true);
        const [arabicRes, translationRes, audioRes, tafseerRes] = await Promise.all([
          axios.get(`/api/quran/surah/${selectedSurah}/quran-uthmani`),
          axios.get(`/api/quran/surah/${selectedSurah}/${translationEdition}`),
          axios.get(`/api/quran/surah/${selectedSurah}/${reciterEdition}`),
          tafseerEdition
            ? axios.get(`/api/quran/surah/${selectedSurah}/${tafseerEdition}`).catch(() => null)
            : Promise.resolve(null),
        ]);

        const arabicAyahs = arabicRes.data?.data?.ayahs || [];
        const translationAyahs = translationRes.data?.data?.ayahs || [];
        const audioAyahs = audioRes.data?.data?.ayahs || [];
        const tafseerAyahs = tafseerRes?.data?.data?.ayahs || [];

        const mergedAyahs = arabicAyahs.map((ayah, index) => ({
          ...ayah,
          translation: translationAyahs[index]?.text || '',
          audio: audioAyahs[index]?.audio || '',
          tafseer: tafseerAyahs[index]?.text || '',
        }));

        setSurahData({
          ...arabicRes.data?.data,
          ayahs: mergedAyahs,
        });
        setRangeStart(1);
        setRangeEnd(Math.max(1, mergedAyahs.length));
        setRangeApplied(false);
        setPlayQueue([]);
        setQueueIndex(0);
        setQueueMode('single');
        setCurrentAudio('');
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } catch (error) {
        toast.error('Failed to load selected Surah');
      } finally {
        setLoadingAyahs(false);
      }
    };

    loadSurah();
  }, [selectedSurah, translationEdition, reciterEdition, tafseerEdition]);

  const playAyahAudio = (audioUrl) => {
    if (!audioUrl) {
      toast.error('Audio not available for this ayah');
      return;
    }
    setPlayQueue([]);
    setQueueIndex(0);
    setQueueMode('single');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentAudio(audioUrl);
  };

  const playAyahMix = (ayah) => {
    startQueuePlayback([ayah], 'ayah-mix', true);
  };

  const toggleDisplaySetting = async (key) => {
    if (!user?._id) return;

    let updatedSettings;
    setQuranSettings((prev) => {
      if (key === 'arabic') {
        updatedSettings = {
          ...prev,
          readingMode: {
            ...prev.readingMode,
            showArabic: !(prev.readingMode?.showArabic !== false),
          },
        };
        return updatedSettings;
      }

      if (key === 'translation') {
        updatedSettings = {
          ...prev,
          translation: {
            ...prev.translation,
            enabled: !Boolean(prev.translation?.enabled),
          },
        };
        return updatedSettings;
      }

      updatedSettings = {
        ...prev,
        tafseer: {
          ...prev.tafseer,
          enabled: !Boolean(prev.tafseer?.enabled),
        },
      };
      return updatedSettings;
    });

    try {
      await axios.put(`/api/quran/settings/${user._id}`, {
        translation: updatedSettings.translation,
        tafseer: updatedSettings.tafseer,
        readingMode: updatedSettings.readingMode,
      });
    } catch (error) {
      toast.error('Failed to save display preference');
    }
  };

  const startQueuePlayback = (ayahs, mode = 'full', includeTranslationVoice = false) => {
    const queue = [];

    ayahs.forEach((item) => {
      if (item.audio) {
        queue.push({ type: 'audio', src: item.audio });
      }

      if (includeTranslationVoice && showTranslation && item.translation) {
        queue.push({
          type: 'tts',
          text: item.translation,
          lang: getTranslationSpeechLang(quranSettings.translation),
        });
      }
    });

    if (queue.length === 0) {
      toast.error('Audio not available for selected ayahs');
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setPlayQueue(queue);
    setQueueIndex(0);
    setQueueMode(mode);
    setCurrentAudio('');
  };

  const handlePlayFullSurah = () => {
    if (!surahData?.ayahs?.length) return;
    startQueuePlayback(surahData.ayahs, 'full');
  };

  const handlePlayFullMix = () => {
    if (!surahData?.ayahs?.length) return;
    startQueuePlayback(surahData.ayahs, 'full-mix', true);
  };

  const handleApplyRange = () => {
    if (!surahData?.ayahs?.length) return;

    const total = surahData.ayahs.length;
    const start = Number(rangeStart);
    const end = Number(rangeEnd);

    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < 1) {
      toast.error('Range should be valid ayah numbers');
      return;
    }
    if (start > end) {
      toast.error('Range start should be less than or equal to end');
      return;
    }
    if (start > total || end > total) {
      toast.error(`Ayah range should be between 1 and ${total}`);
      return;
    }

    setRangeApplied(true);
  };

  const handleClearRange = () => {
    if (!surahData?.ayahs?.length) return;
    setRangeStart(1);
    setRangeEnd(surahData.ayahs.length);
    setRangeApplied(false);
  };

  const handlePlayRange = () => {
    if (!surahData?.ayahs?.length) return;

    const total = surahData.ayahs.length;
    const start = Number(rangeStart);
    const end = Number(rangeEnd);

    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < 1 || start > end || end > total) {
      toast.error(`Please choose a valid range between 1 and ${total}`);
      return;
    }

    const selectedAyahs = surahData.ayahs.filter(
      (item) => item.numberInSurah >= start && item.numberInSurah <= end
    );
    startQueuePlayback(selectedAyahs, 'range');
  };

  const handlePlayRangeMix = () => {
    if (!surahData?.ayahs?.length) return;

    const total = surahData.ayahs.length;
    const start = Number(rangeStart);
    const end = Number(rangeEnd);

    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < 1 || start > end || end > total) {
      toast.error(`Please choose a valid range between 1 and ${total}`);
      return;
    }

    const selectedAyahs = surahData.ayahs.filter(
      (item) => item.numberInSurah >= start && item.numberInSurah <= end
    );
    startQueuePlayback(selectedAyahs, 'range-mix', true);
  };

  const handleAudioEnded = () => {
    if (!playQueue.length) return;
    setQueueIndex((prev) => prev + 1);
  };

  useEffect(() => {
    if (!playQueue.length) return;

    if (queueIndex >= playQueue.length) {
      setQueueMode('single');
      setPlayQueue([]);
      setQueueIndex(0);
      setCurrentAudio('');
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    const currentItem = playQueue[queueIndex];
    if (currentItem?.type === 'audio') {
      setCurrentAudio(currentItem.src || '');
      return;
    }

    if (currentItem?.type === 'tts') {
      if (!('speechSynthesis' in window)) {
        toast.error('Translation voice is not supported in this browser');
        setQueueIndex((prev) => prev + 1);
        return;
      }

      setCurrentAudio('');
      const utterance = new SpeechSynthesisUtterance(currentItem.text || '');
      utterance.lang = currentItem.lang || 'en-US';
      utterance.rate = 0.95;
      utterance.onend = () => setQueueIndex((prev) => prev + 1);
      utterance.onerror = () => setQueueIndex((prev) => prev + 1);

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }

    return () => {
      if (currentItem?.type === 'tts' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [playQueue, queueIndex]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await axios.get('/api/quran/search', {
        params: { q: searchTerm.trim() },
      });
      const matches = response.data?.data?.matches || [];
      setSearchResults(matches.slice(0, 20));
    } catch (error) {
      toast.error('Search failed');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const bgClass = isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#f6f4ef] text-slate-900';
  const panelClass = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#e6dcc6]';
  const displayedAyahs = useMemo(() => {
    if (!surahData?.ayahs?.length) return [];
    if (!rangeApplied) return surahData.ayahs;

    const start = Number(rangeStart);
    const end = Number(rangeEnd);
    return surahData.ayahs.filter(
      (item) => item.numberInSurah >= start && item.numberInSurah <= end
    );
  }, [surahData, rangeApplied, rangeStart, rangeEnd]);

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <div className={`mb-5 rounded-2xl border p-5 ${panelClass}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Quran Reader</h1>
              <p className="mt-1 text-sm opacity-80">
                Reading mode and editions are loaded from your student settings.
              </p>
            </div>
            <Link
              to="/student/settings"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Open Quran Settings
            </Link>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 md:hidden">
            <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs text-emerald-900">
              {translationEdition}
            </span>
            <span className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs text-sky-900">
              {quranSettings.audio?.reciter}
            </span>
            <span className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-900">
              A {quranSettings.font?.arabicSize}px / T {quranSettings.font?.translationSize}px
            </span>
          </div>

          <div className="mt-4 hidden gap-3 md:grid md:grid-cols-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              Translation: <strong>{translationEdition}</strong>
            </div>
            <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
              Reciter: <strong>{quranSettings.audio?.reciter}</strong>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Arabic Size: <strong>{quranSettings.font?.arabicSize}px</strong>
            </div>
            <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900">
              Translation Size: <strong>{quranSettings.font?.translationSize}px</strong>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <aside className={`hidden rounded-2xl border p-4 ${panelClass} h-fit lg:sticky lg:top-4 lg:block`}>
            <h2 className="mb-3 text-lg font-semibold">Surah List</h2>
            {loadingSurahs ? (
              <p className="text-sm opacity-70">Loading surahs...</p>
            ) : (
              <div className="max-h-[520px] space-y-1 overflow-y-auto pr-1">
                {surahs.map((surah) => (
                  <button
                    key={surah.number}
                    type="button"
                    onClick={() => setSelectedSurah(surah.number)}
                    className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                      selectedSurah === surah.number
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : isDark
                          ? 'border-slate-700 bg-slate-800 hover:bg-slate-700'
                          : 'border-[#eadfca] bg-[#fffdf7] hover:bg-[#f7f2e7]'
                    }`}
                  >
                    <div className="text-sm font-semibold">{surah.number}. {surah.englishName}</div>
                    <div className="text-xs opacity-80">{surah.name}</div>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <section className={`order-1 rounded-2xl border p-4 ${panelClass} lg:order-2`}>
            <div className="mb-3 flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileSurahListOpen(true)}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
              >
                Surah List
              </button>
              <select
                value={selectedSurah}
                onChange={(e) => setSelectedSurah(Number(e.target.value))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                  isDark ? 'border-slate-700 bg-slate-900' : 'border-[#dacfb8] bg-white'
                }`}
              >
                {surahs.map((surah) => (
                  <option key={surah.number} value={surah.number}>
                    {surah.number}. {surah.englishName}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Search Quran (English)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm md:w-80 ${
                  isDark ? 'border-slate-700 bg-slate-900' : 'border-[#dacfb8] bg-white'
                }`}
              />
              <button
                type="button"
                onClick={handleSearch}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className={`mb-4 rounded-lg border p-3 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-[#e7dcc8] bg-[#fffdf8]'}`}>
                <h3 className="mb-2 text-sm font-semibold">Search Results</h3>
                <div className="max-h-56 space-y-2 overflow-y-auto">
                  {searchResults.map((match) => (
                    <button
                      key={match.number}
                      type="button"
                      onClick={() => {
                        setSelectedSurah(match.surah.number);
                        setSearchResults([]);
                      }}
                      className="block w-full rounded-md border border-transparent bg-transparent px-2 py-2 text-left text-sm hover:border-emerald-500"
                    >
                      <span className="font-semibold">{match.surah.englishName} {match.numberInSurah}</span>
                      <span className="ml-2 opacity-80">{match.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loadingAyahs ? (
              <p className="text-sm opacity-70">Loading ayahs...</p>
            ) : surahData ? (
              <div>
                <div className="mb-4 border-b pb-3">
                  <h2 className="text-xl font-bold">{surahData.englishName} ({surahData.name})</h2>
                  <p className="text-sm opacity-80">
                    Ayahs: {surahData.numberOfAyahs} • Revelation: {surahData.revelationType}
                  </p>
                </div>

                <div className={`mb-4 rounded-xl border p-3 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-[#e7dcc8] bg-[#fffdf8]'}`}>
                  <p className="mb-2 text-sm font-semibold">Display Options</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleDisplaySetting('arabic')}
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold ${showArabic ? 'bg-emerald-600 text-white' : 'bg-slate-500 text-white'}`}
                    >
                      Arabic {showArabic ? 'On' : 'Off'}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleDisplaySetting('translation')}
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold ${showTranslation ? 'bg-blue-600 text-white' : 'bg-slate-500 text-white'}`}
                    >
                      Translation {showTranslation ? 'On' : 'Off'}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleDisplaySetting('tafseer')}
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold ${showTafseer ? 'bg-amber-600 text-white' : 'bg-slate-500 text-white'}`}
                    >
                      Tafseer {showTafseer ? 'On' : 'Off'}
                    </button>
                  </div>
                </div>

                <div className={`mb-4 rounded-xl border p-3 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-[#e7dcc8] bg-[#fffdf8]'}`}>
                  <p className="mb-2 text-sm font-semibold">Range Reading & Full Play</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-xs opacity-80">From</label>
                    <input
                      type="number"
                      min={1}
                      max={surahData.numberOfAyahs}
                      value={rangeStart}
                      onChange={(e) => setRangeStart(e.target.value)}
                      className={`w-20 rounded-md border px-2 py-1.5 text-sm ${isDark ? 'border-slate-600 bg-slate-900' : 'border-[#dacfb8] bg-white'}`}
                    />
                    <label className="text-xs opacity-80">To</label>
                    <input
                      type="number"
                      min={1}
                      max={surahData.numberOfAyahs}
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(e.target.value)}
                      className={`w-20 rounded-md border px-2 py-1.5 text-sm ${isDark ? 'border-slate-600 bg-slate-900' : 'border-[#dacfb8] bg-white'}`}
                    />

                    <button
                      type="button"
                      onClick={handleApplyRange}
                      className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
                    >
                      Apply Range
                    </button>
                    <button
                      type="button"
                      onClick={handleClearRange}
                      className="rounded-md bg-slate-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-600"
                    >
                      Clear Range
                    </button>
                    <button
                      type="button"
                      onClick={handlePlayRange}
                      className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                    >
                      Play Range
                    </button>
                    <button
                      type="button"
                      onClick={handlePlayRangeMix}
                      className="rounded-md bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700"
                    >
                      Play Range Mix
                    </button>
                    <button
                      type="button"
                      onClick={handlePlayFullSurah}
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      Full Play (Surah)
                    </button>
                    <button
                      type="button"
                      onClick={handlePlayFullMix}
                      className="rounded-md bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                    >
                      Full Play Mix
                    </button>
                  </div>
                  {rangeApplied && (
                    <p className="mt-2 text-xs opacity-80">
                      Showing ayahs from {rangeStart} to {rangeEnd}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  {displayedAyahs.map((ayah) => (
                    <article
                      key={ayah.number}
                      className={`rounded-xl border p-4 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-[#e7dcc8] bg-[#fffdf8]'}`}
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">
                          {quranSettings.readingMode?.showAyahNumber ? ayah.numberInSurah : 'Ayah'}
                        </span>
                        <button
                          type="button"
                          onClick={() => playAyahAudio(ayah.audio)}
                          className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700"
                        >
                          Play Audio
                        </button>
                        <button
                          type="button"
                          onClick={() => playAyahMix(ayah)}
                          className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                        >
                          Play Mix
                        </button>
                      </div>

                      {showArabic && (
                        <p
                          className="mb-3 leading-loose"
                          style={{
                            fontSize: `${quranSettings.font?.arabicSize || 22}px`,
                            fontFamily: getArabicFontFamily(quranSettings.font?.fontFamily),
                            direction: 'rtl',
                            textAlign: 'right',
                          }}
                        >
                          {ayah.text}
                        </p>
                      )}

                      {showTranslation && (
                        <p
                          className="opacity-90"
                          style={{ fontSize: `${quranSettings.font?.translationSize || 16}px` }}
                        >
                          {ayah.translation}
                        </p>
                      )}

                      {showTafseer && ayah.tafseer && (
                        <div className={`mt-3 rounded-lg border p-3 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-amber-200 bg-amber-50'}`}>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-70">
                            Tafseer • {quranSettings.tafseer?.tafseerName || 'Ibn Kathir'}
                          </p>
                          <p
                            className="opacity-90"
                            style={{ fontSize: `${Math.max(13, (quranSettings.font?.translationSize || 16) - 1)}px` }}
                          >
                            {ayah.tafseer}
                          </p>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm opacity-70">Select a Surah to begin reading.</p>
            )}
          </section>
        </div>
      </div>

      {currentAudio && (
        <div className={`sticky bottom-0 border-t p-3 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-[#ddd0b8] bg-white'}`}>
          <div className="mx-auto max-w-4xl">
            {playQueue.length > 0 && (
              <p className="mb-1 text-xs opacity-80">
                {queueMode === 'full'
                  ? 'Full Surah Playback'
                  : queueMode === 'range'
                    ? 'Range Playback'
                    : queueMode === 'full-mix'
                      ? 'Full Surah Mix Playback'
                      : queueMode === 'range-mix'
                        ? 'Range Mix Playback'
                        : 'Ayah Mix Playback'}: {Math.min(queueIndex + 1, playQueue.length)}/{playQueue.length}
              </p>
            )}
            <audio
              ref={audioRef}
              src={currentAudio}
              controls
              autoPlay={Boolean(quranSettings.audio?.autoPlay || playQueue.length > 0)}
              onEnded={handleAudioEnded}
              className="w-full"
            />
          </div>
        </div>
      )}

      {mobileSurahListOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setMobileSurahListOpen(false)}>
          <div
            className={`absolute bottom-0 left-0 right-0 max-h-[75vh] rounded-t-2xl border p-4 ${panelClass}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold">Select Surah</h3>
              <button
                type="button"
                onClick={() => setMobileSurahListOpen(false)}
                className="rounded-md border px-2 py-1 text-xs"
              >
                Close
              </button>
            </div>

            <div className="max-h-[60vh] space-y-1 overflow-y-auto pr-1">
              {surahs.map((surah) => (
                <button
                  key={surah.number}
                  type="button"
                  onClick={() => {
                    setSelectedSurah(surah.number);
                    setMobileSurahListOpen(false);
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                    selectedSurah === surah.number
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : isDark
                        ? 'border-slate-700 bg-slate-800 hover:bg-slate-700'
                        : 'border-[#eadfca] bg-[#fffdf7] hover:bg-[#f7f2e7]'
                  }`}
                >
                  <div className="text-sm font-semibold">{surah.number}. {surah.englishName}</div>
                  <div className="text-xs opacity-80">{surah.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quran;