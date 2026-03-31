import api from './api';

// Create axios instance for Quran API (now proxied through backend)
const quranApi = api;

const quranService = {
  // ==================== EDITIONS ====================
  
  // Get all editions
  getEditions: (params = {}) => 
    quranApi.get('/edition', { params }),
  
  // Get editions by language
  getEditionsByLanguage: (language) => 
    quranApi.get(`/edition/language/${language}`),
  
  // Get editions by type
  getEditionsByType: (type) => 
    quranApi.get(`/edition/type/${type}`),
  
  // Get editions by format
  getEditionsByFormat: (format) => 
    quranApi.get(`/edition/format/${format}`),
  
  // Get all languages
  getLanguages: () => quranApi.get('/edition/language'),
  
  // Get all types
  getTypes: () => quranApi.get('/edition/type'),
  
  // Get all formats
  getFormats: () => quranApi.get('/edition/format'),

  // ==================== COMPLETE QURAN ====================
  
  // Get complete Quran (text/audio)
  getCompleteQuran: (edition = 'quran-uthmani') => 
    quranApi.get(`/quran/${edition}`),
  
  // Get complete Quran with multiple editions
  getCompleteQuranMultipleEditions: (editions) => 
    quranApi.get(`/quran/editions/${editions}`),

  // ==================== SURAHS ====================
  
  // Get all surahs list
  getAllSurahs: () => quranApi.get('/quran/surah'),
  
  // Get single surah
  getSurah: (surahNumber, edition = 'quran-uthmani', params = {}) => 
    quranApi.get(`/quran/surah/${surahNumber}/${edition}`, { params }),
  
  // Get surah with multiple editions
  getSurahMultipleEditions: (surahNumber, editions) => 
    quranApi.get(`/surah/${surahNumber}/editions/${editions}`),

  // ==================== AYAHS ====================
  
  // Get single ayah
  getAyah: (reference, edition = 'quran-uthmani') => 
    quranApi.get(`/ayah/${reference}/${edition}`),
  
  // Get ayah with multiple editions
  getAyahMultipleEditions: (reference, editions) => 
    quranApi.get(`/ayah/${reference}/editions/${editions}`),

  // ==================== JUZ ====================
  
  // Get juz
  getJuz: (juzNumber, edition = 'quran-uthmani', params = {}) => 
    quranApi.get(`/juz/${juzNumber}/${edition}`, { params }),

  // ==================== SEARCH ====================
  
  // Search Quran
  searchQuran: (keyword, surah = 'all', editionOrLanguage = 'en') => 
    quranApi.get(`/search/${keyword}/${surah}/${editionOrLanguage}`),

  // ==================== PAGES ====================
  
  // Get page
  getPage: (pageNumber, edition = 'quran-uthmani') => 
    quranApi.get(`/page/${pageNumber}/${edition}`),

  // ==================== HIZB ====================
  
  // Get hizb quarter
  getHizbQuarter: (quarterNumber, edition = 'quran-uthmani') => 
    quranApi.get(`/hizbQuarter/${quarterNumber}/${edition}`),

  // ==================== MANZIL ====================
  
  // Get manzil
  getManzil: (manzilNumber, edition = 'quran-uthmani') => 
    quranApi.get(`/manzil/${manzilNumber}/${edition}`),

  // ==================== RUKU ====================
  
  // Get ruku
  getRuku: (rukuNumber, edition = 'quran-uthmani') => 
    quranApi.get(`/ruku/${rukuNumber}/${edition}`),

  // ==================== SAJDA ====================
  
  // Get sajda (prostration) verses
  getSajda: (edition = 'quran-uthmani') => 
    quranApi.get(`/sajda/${edition}`),

  // ==================== META DATA ====================
  
  // Get meta data (surahs, pages, hizbs, juzs)
  getMetaData: () => quranApi.get('/meta'),

  // ==================== CUSTOM METHODS ====================
  
  // Get reciters list
  getReciters: async () => {
    const response = await quranApi.get('/edition?format=audio');
    return response.data.data.filter(edition => 
      edition.type === 'versebyverse' && 
      edition.format === 'audio'
    );
  },

  // Get translations list
  getTranslations: async () => {
    const response = await quranApi.get('/edition?format=text&type=translation');
    return response.data.data;
  },

  // Get tafsirs list
  getTafsirs: async () => {
    const response = await quranApi.get('/edition?format=text&type=tafsir');
    return response.data.data;
  },

  // Get popular reciters
  getPopularReciters: () => [
    { identifier: 'ar.alafasy', name: 'Mishary Rashid Alafasy', language: 'ar' },
    { identifier: 'ar.abdulbasitmurattal', name: 'Abdul Basit Murattal', language: 'ar' },
    { identifier: 'ar.abdulsamad', name: 'Abdul Samad', language: 'ar' },
    { identifier: 'ar.husary', name: 'Mahmoud Khalil Al-Husary', language: 'ar' },
    { identifier: 'ar.hudhaify', name: 'Ali Al-Hudhaify', language: 'ar' },
    { identifier: 'ar.minshawi', name: 'Mohammad Siddiq Al-Minshawi', language: 'ar' },
    { identifier: 'ar.mahermuaiqly', name: 'Maher Al-Muaiqly', language: 'ar' },
    { identifier: 'ar.nasser', name: 'Nasser Al-Qatami', language: 'ar' },
  ],

  // Get popular translations
  getPopularTranslations: () => [
    { identifier: 'en.asad', name: 'Muhammad Asad (English)', language: 'en' },
    { identifier: 'en.pickthall', name: 'Marmaduke Pickthall (English)', language: 'en' },
    { identifier: 'en.yusufali', name: 'Abdullah Yusuf Ali (English)', language: 'en' },
    { identifier: 'en.sahih', name: 'Saheeh International (English)', language: 'en' },
    { identifier: 'ur.jalandhry', name: 'Fateh Muhammad Jalandhry (Urdu)', language: 'ur' },
    { identifier: 'ur.maududi', name: 'Abul Ala Maududi (Urdu)', language: 'ur' },
    { identifier: 'ur.ahmedali', name: 'Ahmed Ali (Urdu)', language: 'ur' },
    { identifier: 'fr.hamidullah', name: 'Muhammad Hamidullah (French)', language: 'fr' },
    { identifier: 'es.cortes', name: 'Julio Cortes (Spanish)', language: 'es' },
  ],

  // Get surah info with translation and audio
  getSurahWithAudioAndTranslation: async (surahNumber, translation = 'en.asad', audio = 'ar.alafasy') => {
    const [surahResponse, audioResponse, translationResponse] = await Promise.all([
      quranApi.get(`/surah/${surahNumber}/quran-uthmani`),
      quranApi.get(`/surah/${surahNumber}/${audio}`),
      quranApi.get(`/surah/${surahNumber}/${translation}`),
    ]);

    return {
      surah: surahResponse.data.data,
      audio: audioResponse.data.data,
      translation: translationResponse.data.data,
    };
  },

  // Get ayah with multiple features
  getAyahDetailed: async (reference) => {
    const [arabic, translation, audio, tafsir] = await Promise.all([
      quranApi.get(`/ayah/${reference}/quran-uthmani`),
      quranApi.get(`/ayah/${reference}/en.asad`),
      quranApi.get(`/ayah/${reference}/ar.alafasy`),
      quranApi.get(`/ayah/${reference}/en.tafsir`).catch(() => ({ data: null })), // Optional
    ]);

    return {
      arabic: arabic.data.data,
      translation: translation.data.data,
      audio: audio.data.data,
      tafsir: tafsir.data?.data || null,
    };
  },

  // Get random ayah
  getRandomAyah: async () => {
    const randomAyah = Math.floor(Math.random() * 6236) + 1;
    return quranService.getAyahDetailed(randomAyah);
  },

  // Get daily ayah
  getDailyAyah: async () => {
    // Use date to get consistent daily ayah
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const ayahNumber = (dayOfYear % 6236) + 1;
    
    return quranService.getAyahDetailed(ayahNumber);
  },

  // Search with advanced options
  advancedSearch: async (keyword, options = {}) => {
    const {
      language = 'en',
      surah = 'all',
      translation = null,
      page = 1,
      limit = 20,
    } = options;

    const endpoint = translation 
      ? `/search/${keyword}/${surah}/${translation}`
      : `/search/${keyword}/${surah}/${language}`;

    const response = await quranApi.get(endpoint);
    
    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const results = response.data.data || [];
    
    return {
      results: results.slice(start, end),
      total: results.length,
      page,
      totalPages: Math.ceil(results.length / limit),
    };
  },

  // Get recitation by surah with progress
  getRecitationWithProgress: async (surahNumber, reciter = 'ar.alafasy') => {
    const response = await quranApi.get(`/surah/${surahNumber}/${reciter}`);
    const surah = response.data.data;
    
    // Calculate audio duration (estimate: 3 seconds per ayah)
    const estimatedDuration = (surah.ayahs?.length || 0) * 3;
    
    return {
      ...surah,
      reciter,
      estimatedDuration,
      audioFormat: 'mp3',
    };
  },

  // Download surah audio
  downloadSurahAudio: (surahNumber, reciter = 'ar.alafasy') => {
    return `${QURAN_API_BASE}/surah/${surahNumber}/${reciter}?download=true`;
  },

  // Get surah info for display
  getSurahInfo: (surahNumber) => {
    const surahInfo = [
      { number: 1, name: 'Al-Fatihah', nameArabic: 'الفاتحة', ayahs: 7, type: 'Makki', order: 5 },
      { number: 2, name: 'Al-Baqarah', nameArabic: 'البقرة', ayahs: 286, type: 'Madani', order: 87 },
      { number: 3, name: 'Al-Imran', nameArabic: 'آل عمران', ayahs: 200, type: 'Madani', order: 89 },
      { number: 4, name: 'An-Nisa', nameArabic: 'النساء', ayahs: 176, type: 'Madani', order: 92 },
      { number: 5, name: 'Al-Maidah', nameArabic: 'المائدة', ayahs: 120, type: 'Madani', order: 112 },
      { number: 6, name: 'Al-An\'am', nameArabic: 'الأنعام', ayahs: 165, type: 'Makki', order: 55 },
      { number: 7, name: 'Al-A\'raf', nameArabic: 'الأعراف', ayahs: 206, type: 'Makki', order: 39 },
      { number: 8, name: 'Al-Anfal', nameArabic: 'الأنفال', ayahs: 75, type: 'Madani', order: 88 },
      { number: 9, name: 'At-Tawbah', nameArabic: 'التوبة', ayahs: 129, type: 'Madani', order: 113 },
      { number: 10, name: 'Yunus', nameArabic: 'يونس', ayahs: 109, type: 'Makki', order: 51 },
      // Add more surahs...
    ];

    return surahInfo.find(s => s.number === surahNumber) || null;
  },

  // Get juz mapping
  getJuzMapping: () => {
    return [
      { juz: 1, surah: 1, ayah: 1, toSurah: 2, toAyah: 141 },
      { juz: 2, surah: 2, ayah: 142, toSurah: 2, toAyah: 252 },
      { juz: 3, surah: 2, ayah: 253, toSurah: 3, toAyah: 92 },
      // Add all 30 juz...
    ];
  },

  // Get page mapping
  getPageMapping: (pageNumber) => {
    const pages = [
      { page: 1, surah: 1, ayah: 1, toSurah: 2, toAyah: 5 },
      { page: 2, surah: 2, ayah: 6, toSurah: 2, toAyah: 16 },
      // Add all 604 pages...
    ];
    
    return pages.find(p => p.page === pageNumber) || null;
  },
};

export default quranService;