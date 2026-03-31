import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Search,
  ArrowForward,
  ArrowBack,
  Bookmark,
  BookmarkBorder,
  KeyboardArrowUp,
  KeyboardArrowDown,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-hot-toast';

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

const getArabicFontFamily = (fontFamily = '') => {
  const family = fontFamily.toLowerCase();
  if (family.includes('indopak')) return 'serif';
  if (family.includes('nastaleeq')) return "'Noto Nastaliq Urdu', serif";
  return "'Amiri', serif";
};

const QuranViewer = ({ preferences }) => {
  const [surahs, setSurahs] = useState([]);
  const [currentSurah, setCurrentSurah] = useState(1);
  const [currentAyah, setCurrentAyah] = useState(1);
  const [quranData, setQuranData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [edition, setEdition] = useState('en.asad');
  const [bookmarks, setBookmarks] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const contentScrollRef = useRef(null);

  useEffect(() => {
    fetchAllSurahs();
    loadBookmarks();
  }, []);

  useEffect(() => {
    if (currentSurah) {
      fetchSurahData(currentSurah);
    }
  }, [currentSurah, edition]);

  useEffect(() => {
    if (!preferences) return;
    setEdition(getTranslationEdition(preferences.translation));
  }, [preferences]);

  const fetchAllSurahs = async () => {
    try {
      const response = await axios.get('/api/quran/surah');
      setSurahs(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching surahs:', error);
    }
  };

  const fetchSurahData = async (surahNumber) => {
    setLoading(true);
    try {
      const [arabicRes, translationRes] = await Promise.all([
        axios.get(`/api/quran/surah/${surahNumber}/quran-uthmani`),
        axios.get(`/api/quran/surah/${surahNumber}/${edition}`),
      ]);

      const arabicAyahs = arabicRes.data?.data?.ayahs || [];
      const translationAyahs = translationRes.data?.data?.ayahs || [];

      const mergedAyahs = arabicAyahs.map((ayah, index) => ({
        ...ayah,
        translation: translationAyahs[index]?.text || '',
      }));

      setQuranData({
        ...arabicRes.data?.data,
        ayahs: mergedAyahs,
      });
    } catch (error) {
      console.error('Error fetching surah:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchQuran = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.get('/api/quran/search', {
        params: { q: searchTerm.trim() },
      });
      setSearchResults(response.data?.data?.matches || []);
      setTabValue(1);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = () => {
    const saved = localStorage.getItem('quranBookmarks');
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  };

  const toggleBookmark = (surah, ayah) => {
    const bookmark = { surah, ayah, timestamp: Date.now() };
    const exists = bookmarks.some(b => b.surah === surah && b.ayah === ayah);
    
    let newBookmarks;
    if (exists) {
      newBookmarks = bookmarks.filter(b => !(b.surah === surah && b.ayah === ayah));
      toast.success('Bookmark removed');
    } else {
      newBookmarks = [...bookmarks, bookmark];
      toast.success('Bookmark added');
    }
    
    setBookmarks(newBookmarks);
    localStorage.setItem('quranBookmarks', JSON.stringify(newBookmarks));
  };

  const isBookmarked = (surah, ayah) => {
    return bookmarks.some(b => b.surah === surah && b.ayah === ayah);
  };

  const nextAyah = () => {
    if (quranData && currentAyah < quranData.numberOfAyahs) {
      setCurrentAyah(currentAyah + 1);
    }
  };

  const prevAyah = () => {
    if (currentAyah > 1) {
      setCurrentAyah(currentAyah - 1);
    }
  };

  const scrollContent = (direction) => {
    const container = contentScrollRef.current;
    if (!container) return;

    container.scrollBy({
      top: direction === 'up' ? -320 : 320,
      behavior: 'smooth',
    });
  };

  const showArabic = preferences?.readingMode?.showArabic !== false;
  const showAyahNumber = preferences?.readingMode?.showAyahNumber !== false;
  const showTranslation = Boolean(preferences?.translation?.enabled ?? true);
  const arabicFontSize = Number(preferences?.font?.arabicSize) || 22;
  const translationFontSize = Number(preferences?.font?.translationSize) || 16;
  const arabicFontFamily = getArabicFontFamily(preferences?.font?.fontFamily || '');

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #fdfdfd 0%, #f7fbff 100%)',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.92)' }}>
        <Typography variant="h6" gutterBottom>
          القرآن الكريم
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel>Translation</InputLabel>
          <Select
            value={edition}
            label="Translation"
            onChange={(e) => setEdition(e.target.value)}
          >
            <MenuItem value="ur.jalandhry">Urdu (Jalandhry)</MenuItem>
            <MenuItem value="en.asad">English (Asad)</MenuItem>
            <MenuItem value="en.sahih">English (Sahih)</MenuItem>
            <MenuItem value="en.yusufali">English (Yusuf Ali)</MenuItem>
            <MenuItem value="en.pickthall">English (Pickthall)</MenuItem>
            <MenuItem value="fr.hamidullah">French (Hamidullah)</MenuItem>
            <MenuItem value="tr.diyanet">Turkish (Diyanet)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Search Bar */}
      <Box sx={{ p: 2, pt: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search in Quran..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchQuran()}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={searchQuran} edge="end">
                  <Search />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={(e, v) => setTabValue(v)}
        sx={{
          px: 2,
          minHeight: 40,
          '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 600 },
        }}
      >
        <Tab label="Read" />
        <Tab label="Search" />
        <Tab label="Bookmarks" />
      </Tabs>

      {/* Tab Content */}
      <Box sx={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <Box
          ref={contentScrollRef}
          sx={{
            height: '100%',
            overflow: 'auto',
            p: 2,
            pr: 1.5,
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': {
              width: 8,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(47, 128, 237, 0.35)',
              borderRadius: 999,
            },
          }}
        >
        {/* Read Tab */}
        {tabValue === 0 && (
          <>
            {/* Surah Selector */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Select Surah</InputLabel>
              <Select
                value={currentSurah}
                label="Select Surah"
                onChange={(e) => {
                  setCurrentSurah(e.target.value);
                  setCurrentAyah(1);
                }}
              >
                {surahs.map((surah) => (
                  <MenuItem key={surah.number} value={surah.number}>
                    {surah.number}. {surah.englishName} ({surah.name})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Current Ayah Display */}
                {quranData && (
                  <Card sx={{ mb: 2, borderRadius: 2.5, boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)' }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1">
                          {quranData.englishName}
                          {showAyahNumber ? ` - Ayah ${currentAyah}` : ''}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => toggleBookmark(currentSurah, currentAyah)}
                        >
                          {isBookmarked(currentSurah, currentAyah) ? 
                            <Bookmark color="primary" /> : 
                            <BookmarkBorder />
                          }
                        </IconButton>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      {showArabic && (
                        <Typography
                          variant="h5"
                          align="center"
                          sx={{
                            fontFamily: arabicFontFamily,
                            direction: 'rtl',
                            fontSize: `${arabicFontSize}px`,
                            lineHeight: 2,
                            mb: 2,
                            color: '#0f172a',
                          }}
                        >
                          {quranData.ayahs?.[currentAyah - 1]?.text}
                        </Typography>
                      )}
                      {showTranslation && (
                        <Typography variant="body2" color="textSecondary" align="center" sx={{ lineHeight: 1.8 }}>
                          <Box component="span" sx={{ fontSize: `${translationFontSize}px` }}>
                            {quranData.ayahs?.[currentAyah - 1]?.translation || 'Translation loading...'}
                          </Box>
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Navigation */}
                <Grid container spacing={1} justifyContent="center">
                  <Grid item>
                    <Button
                      size="small"
                      startIcon={<ArrowBack />}
                      onClick={prevAyah}
                      disabled={currentAyah === 1}
                    >
                      Prev
                    </Button>
                  </Grid>
                  <Grid item>
                    <Typography variant="body2" sx={{ py: 1 }}>
                      {currentAyah} / {quranData?.numberOfAyahs}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Button
                      size="small"
                      endIcon={<ArrowForward />}
                      onClick={nextAyah}
                      disabled={!quranData || currentAyah === quranData.numberOfAyahs}
                    >
                      Next
                    </Button>
                  </Grid>
                </Grid>
              </>
            )}
          </>
        )}

        {/* Search Tab */}
        {tabValue === 1 && (
          <Box>
            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : searchResults.length > 0 ? (
              searchResults.map((result, index) => (
                <Card key={index} sx={{ mb: 1, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="caption" color="primary">
                      Surah {result.surah.name}, Ayah {result.numberInSurah}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "'Amiri', serif",
                        direction: 'rtl',
                        fontSize: '1.2rem',
                        my: 1
                      }}
                    >
                      {result.text}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => {
                        setCurrentSurah(result.surah.number);
                        setCurrentAyah(result.numberInSurah);
                        setTabValue(0);
                      }}
                    >
                      Go to Ayah
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography color="textSecondary" align="center" py={4}>
                {searchTerm ? 'No results found' : 'Search for any word in Quran'}
              </Typography>
            )}
          </Box>
        )}

        {/* Bookmarks Tab */}
        {tabValue === 2 && (
          <Box>
            {bookmarks.length === 0 ? (
              <Typography color="textSecondary" align="center" py={4}>
                No bookmarks yet
              </Typography>
            ) : (
              bookmarks.sort((a, b) => b.timestamp - a.timestamp).map((bookmark, index) => {
                const surah = surahs.find(s => s.number === bookmark.surah);
                return (
                  <Card key={index} sx={{ mb: 1, borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle2">
                        {surah?.englishName} - Ayah {bookmark.ayah}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(bookmark.timestamp).toLocaleDateString()}
                      </Typography>
                      <Box mt={1}>
                        <Button
                          size="small"
                          onClick={() => {
                            setCurrentSurah(bookmark.surah);
                            setCurrentAyah(bookmark.ayah);
                            setTabValue(0);
                          }}
                        >
                          Read
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => toggleBookmark(bookmark.surah, bookmark.ayah)}
                        >
                          Remove
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </Box>
        )}
        </Box>

        <Stack
          spacing={1}
          sx={{
            position: 'absolute',
            right: 8,
            bottom: 12,
            zIndex: 3,
          }}
        >
          <Tooltip title="Scroll up">
            <IconButton
              size="small"
              onClick={() => scrollContent('up')}
              sx={{
                bgcolor: 'rgba(15, 23, 42, 0.75)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.92)' },
              }}
            >
              <KeyboardArrowUp />
            </IconButton>
          </Tooltip>
          <Tooltip title="Scroll down">
            <IconButton
              size="small"
              onClick={() => scrollContent('down')}
              sx={{
                bgcolor: 'rgba(15, 23, 42, 0.75)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.92)' },
              }}
            >
              <KeyboardArrowDown />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );
};

export default QuranViewer;