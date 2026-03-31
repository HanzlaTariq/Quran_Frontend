import axios from 'axios';

const API_BASE_URL = 'http://api.alquran.cloud/v1';

class QuranService {
  constructor() {
    this.cache = new Map();
  }

  async request(endpoint, params = {}) {
    const cacheKey = `${endpoint}-${JSON.stringify(params)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, { params });
      this.cache.set(cacheKey, response);
      return response;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Surah endpoints
  async getAllSurahs() {
    return this.request('/surah');
  }

  async getSurah(surahNumber, edition = 'quran-uthmani') {
    return this.request(`/surah/${surahNumber}/${edition}`);
  }

  async getSurahEditions(surahNumber, editions = []) {
    return this.request(`/surah/${surahNumber}/editions/${editions.join(',')}`);
  }

  // Ayah endpoints
  async getAyah(reference, edition = 'quran-uthmani') {
    return this.request(`/ayah/${reference}/${edition}`);
  }

  async getAyahEditions(reference, editions = []) {
    return this.request(`/ayah/${reference}/editions/${editions.join(',')}`);
  }

  // Juz endpoints
  async getJuz(juzNumber, edition = 'quran-uthmani') {
    return this.request(`/juz/${juzNumber}/${edition}`);
  }

  // Search endpoints
  async searchQuran(keyword, surah = 'all', edition = 'en.asad') {
    return this.request(`/search/${keyword}/${surah}/${edition}`);
  }

  // Edition endpoints
  async getEditions(params = {}) {
    return this.request('/edition', params);
  }

  async getLanguages() {
    return this.request('/edition/language');
  }

  async getEditionsByLanguage(language) {
    return this.request(`/edition/language/${language}`);
  }

  // Special endpoints
  async getSajda(edition = 'quran-uthmani') {
    return this.request(`/sajda/${edition}`);
  }

  async getMeta() {
    return this.request('/meta');
  }

  // Popular reciters and translations
  getPopularReciters() {
    return [
      { identifier: 'ar.alafasy', name: 'Mishary Alafasy', language: 'ar' },
      { identifier: 'ar.abdulbasitmurattal', name: 'Abdul Basit Murattal', language: 'ar' },
      { identifier: 'ar.hudhaify', name: 'Ali Al-Hudhaify', language: 'ar' },
      { identifier: 'ar.mahermuaiqly', name: 'Maher Al-Muaiqly', language: 'ar' },
      { identifier: 'ar.minshawimurattal', name: 'Mohamed Siddiq Al-Minshawi', language: 'ar' },
      { identifier: 'en.walk', name: 'Ibrahim Walk', language: 'en' },
      { identifier: 'ur.jalandhry', name: 'Fateh Muhammad Jalandhry', language: 'ur' },
    ];
  }

  getPopularTranslations() {
    return [
      { identifier: 'en.asad', name: 'Muhammad Asad', language: 'en' },
      { identifier: 'en.pickthall', name: 'Marmaduke Pickthall', language: 'en' },
      { identifier: 'en.yusufali', name: 'Abdullah Yusuf Ali', language: 'en' },
      { identifier: 'ur.jalandhry', name: 'Fateh Muhammad Jalandhry', language: 'ur' },
      { identifier: 'fr.hamidullah', name: 'Muhammad Hamidullah', language: 'fr' },
      { identifier: 'es.bornez', name: 'Muhammad Isa Garcia', language: 'es' },
      { identifier: 'tr.elmalli', name: 'Elmalili Hamdi Yazir', language: 'tr' },
      { identifier: 'id.muntakhab', name: 'Ministry of Religious Affairs', language: 'id' },
    ];
  }

  // Tafsir endpoints (placeholder - would need separate service)
  async getTafsir(surahNumber, ayahNumber, tafsir = 'en.tafsir') {
    // This is a placeholder - actual tafsir API would be different
    return Promise.resolve({
      data: {
        data: {
          text: `Tafsir for Surah ${surahNumber}, Ayah ${ayahNumber}`,
          author: 'Ibn Kathir',
          source: 'Tafsir Ibn Kathir'
        }
      }
    });
  }

  // Analytics
  trackEvent(eventName, data = {}) {
    // Track user interactions
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, data);
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

export const quranService = new QuranService();