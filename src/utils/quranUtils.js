class QuranUtils {
  // Format Arabic text
  static formatArabicText(text) {
    return text.replace(/۞/g, ' ﷽ ').replace(/۩/g, ' 🕌 ');
  }

  // Calculate reading time
  static calculateReadingTime(ayahs, wordsPerMinute = 200) {
    const estimatedWords = ayahs * 15; // Average 15 words per ayah
    const minutes = Math.ceil(estimatedWords / wordsPerMinute);
    return `${minutes} min read`;
  }

  // Get surah name by number
  static getSurahName(surahNumber) {
    const surahNames = {
      1: 'Al-Fatihah',
      2: 'Al-Baqarah',
      3: 'Al-Imran',
      4: 'An-Nisa',
      5: 'Al-Maidah',
      6: 'Al-Anam',
      7: 'Al-Araf',
      8: 'Al-Anfal',
      9: 'At-Tawbah',
      10: 'Yunus',
      11: 'Hud',
      12: 'Yusuf',
      13: 'Ar-Rad',
      14: 'Ibrahim',
      15: 'Al-Hijr',
      16: 'An-Nahl',
      17: 'Al-Isra',
      18: 'Al-Kahf',
      19: 'Maryam',
      20: 'Taha',
      21: 'Al-Anbiya',
      22: 'Al-Hajj',
      23: 'Al-Muminun',
      24: 'An-Nur',
      25: 'Al-Furqan',
      26: 'Ash-Shuara',
      27: 'An-Naml',
      28: 'Al-Qasas',
      29: 'Al-Ankabut',
      30: 'Ar-Rum',
      31: 'Luqman',
      32: 'As-Sajdah',
      33: 'Al-Ahzab',
      34: 'Saba',
      35: 'Fatir',
      36: 'Ya-Sin',
      37: 'As-Saffat',
      38: 'Sad',
      39: 'Az-Zumar',
      40: 'Ghafir',
      41: 'Fussilat',
      42: 'Ash-Shura',
      43: 'Az-Zukhruf',
      44: 'Ad-Dukhan',
      45: 'Al-Jathiyah',
      46: 'Al-Ahqaf',
      47: 'Muhammad',
      48: 'Al-Fath',
      49: 'Al-Hujurat',
      50: 'Qaf',
      51: 'Adh-Dhariyat',
      52: 'At-Tur',
      53: 'An-Najm',
      54: 'Al-Qamar',
      55: 'Ar-Rahman',
      56: 'Al-Waqiah',
      57: 'Al-Hadid',
      58: 'Al-Mujadilah',
      59: 'Al-Hashr',
      60: 'Al-Mumtahanah',
      61: 'As-Saff',
      62: 'Al-Jumuah',
      63: 'Al-Munafiqun',
      64: 'At-Taghabun',
      65: 'At-Talaq',
      66: 'At-Tahrim',
      67: 'Al-Mulk',
      68: 'Al-Qalam',
      69: 'Al-Haqqah',
      70: 'Al-Maarij',
      71: 'Nuh',
      72: 'Al-Jinn',
      73: 'Al-Muzzammil',
      74: 'Al-Muddaththir',
      75: 'Al-Qiyamah',
      76: 'Al-Insan',
      77: 'Al-Mursalat',
      78: 'An-Naba',
      79: 'An-Naziat',
      80: 'Abasa',
      81: 'At-Takwir',
      82: 'Al-Infitar',
      83: 'Al-Mutaffifin',
      84: 'Al-Inshiqaq',
      85: 'Al-Buruj',
      86: 'At-Tariq',
      87: 'Al-Ala',
      88: 'Al-Ghashiyah',
      89: 'Al-Fajr',
      90: 'Al-Balad',
      91: 'Ash-Shams',
      92: 'Al-Layl',
      93: 'Ad-Duha',
      94: 'Ash-Sharh',
      95: 'At-Tin',
      96: 'Al-Alaq',
      97: 'Al-Qadr',
      98: 'Al-Bayyinah',
      99: 'Az-Zalzalah',
      100: 'Al-Adiyat',
      101: 'Al-Qariah',
      102: 'At-Takathur',
      103: 'Al-Asr',
      104: 'Al-Humazah',
      105: 'Al-Fil',
      106: 'Quraysh',
      107: 'Al-Maun',
      108: 'Al-Kawthar',
      109: 'Al-Kafirun',
      110: 'An-Nasr',
      111: 'Al-Masad',
      112: 'Al-Ikhlas',
      113: 'Al-Falaq',
      114: 'An-Nas'
    };
    return surahNames[surahNumber] || `Surah ${surahNumber}`;
  }

  // Format ayah reference
  static formatReference(surahNumber, ayahNumber) {
    return `${surahNumber}:${ayahNumber}`;
  }

  // Parse ayah reference
  static parseReference(reference) {
    const [surah, ayah] = reference.split(':');
    return { surah: parseInt(surah), ayah: parseInt(ayah) };
  }

  // Get juz from surah and ayah
  static getJuzFromAyah(surahNumber, ayahNumber) {
    // Simplified juz calculation
    // In a real app, you'd need a proper mapping
    if (surahNumber === 1 && ayahNumber <= 7) return 1;
    if (surahNumber === 2 && ayahNumber <= 141) return 2;
    if (surahNumber === 2 && ayahNumber <= 252) return 3;
    // ... continue for all juz
    return Math.ceil(surahNumber / 3.8);
  }

  // Get page from surah and ayah
  static getPageFromAyah(surahNumber, ayahNumber) {
    // Simplified page calculation
    const basePages = {
      1: 1, 2: 2, 3: 50, 4: 77, 5: 106,
      6: 128, 7: 151, 8: 177, 9: 187,
      10: 208, 11: 221, 12: 235, 13: 249,
      14: 255, 15: 262, 16: 267, 17: 282,
      18: 293, 19: 305, 20: 312, 21: 322,
      22: 332, 23: 342, 24: 350, 25: 359,
      26: 367, 27: 377, 28: 385, 29: 396,
      30: 404, 31: 411, 32: 415, 33: 418,
      34: 428, 35: 434, 36: 440, 37: 446,
      38: 453, 39: 458, 40: 467, 41: 477,
      42: 483, 43: 489, 44: 496, 45: 499,
      46: 502, 47: 507, 48: 511, 49: 515,
      50: 518, 51: 520, 52: 523, 53: 526,
      54: 528, 55: 531, 56: 534, 57: 537,
      58: 542, 59: 545, 60: 549, 61: 551,
      62: 553, 63: 554, 64: 556, 65: 558,
      66: 560, 67: 562, 68: 564, 69: 566,
      70: 568, 71: 570, 72: 572, 73: 574,
      74: 575, 75: 577, 76: 578, 77: 580,
      78: 582, 79: 583, 80: 585, 81: 586,
      82: 587, 83: 587, 84: 589, 85: 590,
      86: 591, 87: 591, 88: 592, 89: 593,
      90: 594, 91: 595, 92: 595, 93: 596,
      94: 596, 95: 597, 96: 597, 97: 598,
      98: 598, 99: 599, 100: 599, 101: 600,
      102: 600, 103: 601, 104: 601, 105: 601,
      106: 602, 107: 602, 108: 602, 109: 603,
      110: 603, 111: 603, 112: 604, 113: 604,
      114: 604
    };
    return basePages[surahNumber] || 1;
  }

  // Get revelation type - THIS WAS MISSING!
  static getRevelationType(surahNumber) {
    const makki = [
      1, 6, 7, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 23, 25, 26, 27, 28, 
      29, 30, 31, 32, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 50, 
      51, 52, 53, 54, 56, 67, 68, 69, 70, 71, 72, 73, 74, 75, 77, 78, 79, 80, 
      81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 
      99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114
    ];
    
    return makki.includes(surahNumber) ? 'Makki' : 'Madani';
  }

  // Generate shareable link
  static generateShareLink(surahNumber, ayahNumber) {
    return `${window.location.origin}/quran/${surahNumber}/${ayahNumber}`;
  }

  // Format date for bookmarks
  static formatBookmarkDate(timestamp) {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Recent';
      }
      const now = new Date();
      const diff = now - date;
      
      const minute = 60 * 1000;
      const hour = 60 * minute;
      const day = 24 * hour;
      const week = 7 * day;
      
      if (diff < minute) return 'Just now';
      if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
      if (diff < day) return `${Math.floor(diff / hour)}h ago`;
      if (diff < week) return `${Math.floor(diff / day)}d ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return 'Recent';
    }
  }

  // Calculate progress percentage
  static calculateProgress(currentAyah, totalAyahs) {
    if (!totalAyahs || totalAyahs === 0) return 0;
    return ((currentAyah / totalAyahs) * 100).toFixed(1);
  }

  // Get color scheme for themes
  static getThemeColors(theme) {
    const themes = {
      default: {
        primary: '#10B981',
        secondary: '#059669',
        background: '#F9FAFB',
        text: '#1F2937'
      },
      dark: {
        primary: '#10B981',
        secondary: '#059669',
        background: '#111827',
        text: '#F9FAFB'
      },
      sepia: {
        primary: '#D97706',
        secondary: '#B45309',
        background: '#FEF3C7',
        text: '#78350F'
      },
      blue: {
        primary: '#3B82F6',
        secondary: '#1D4ED8',
        background: '#DBEAFE',
        text: '#1E40AF'
      }
    };
    
    return themes[theme] || themes.default;
  }

  // Validate edition identifier
  static validateEdition(edition) {
    const validEditions = [
      'quran-uthmani', 'en.asad', 'en.pickthall', 'en.yusufali',
      'ar.alafasy', 'ar.abdulbasitmurattal', 'ar.hudhaify',
      'ur.jalandhry', 'fr.hamidullah', 'es.bornez'
    ];
    return validEditions.includes(edition);
  }

  // Get audio quality options
  static getAudioQualities() {
    return [
      { label: 'Low (48kbps)', value: 'low' },
      { label: 'Medium (128kbps)', value: 'medium' },
      { label: 'High (192kbps)', value: 'high' },
      { label: 'HD (320kbps)', value: 'hd' }
    ];
  }

  // Format file size
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Byte';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  }

  // Format time for audio player
  static formatTime(seconds) {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Get reading time for surah
  static getSurahReadingTime(numberOfAyahs) {
    const minutes = Math.ceil(numberOfAyahs * 0.5); // ~30 seconds per ayah
    return `${minutes} min`;
  }

  // Check if surah is popular
  static isPopularSurah(surahNumber) {
    const popularSurahs = [1, 2, 18, 36, 55, 56, 67, 73, 112];
    return popularSurahs.includes(surahNumber);
  }

  // Get surah type color class
  static getSurahTypeColorClass(surahNumber, isCurrent = false) {
    const type = this.getRevelationType(surahNumber);
    if (isCurrent) {
      return 'bg-white/20';
    }
    return type === 'Makki' 
      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  }

  // Get surah type icon
  static getSurahTypeIcon(surahNumber) {
    const type = this.getRevelationType(surahNumber);
    return type === 'Makki' ? '🕋' : '🕌';
  }

  // Get surah difficulty level (simplified)
  static getSurahDifficulty(surahNumber) {
    if (surahNumber <= 10) return 'Easy';
    if (surahNumber <= 50) return 'Medium';
    if (surahNumber <= 100) return 'Hard';
    return 'Very Hard';
  }

  // Get surah theme/category (simplified)
  static getSurahCategory(surahNumber) {
    const categories = {
      1: 'Opening',
      2: 'Law & Guidance',
      36: 'Prophets',
      55: 'Mercy & Blessings',
      56: 'Day of Judgment',
      67: 'Sovereignty',
      112: 'Monotheism'
    };
    return categories[surahNumber] || 'Guidance';
  }
}

// Create instance
export const quranUtils = new QuranUtils();

// Also export static methods directly for convenience
export const {
  formatArabicText,
  calculateReadingTime,
  getSurahName,
  formatReference,
  parseReference,
  getJuzFromAyah,
  getPageFromAyah,
  getRevelationType,
  generateShareLink,
  formatBookmarkDate,
  calculateProgress,
  getThemeColors,
  validateEdition,
  getAudioQualities,
  formatFileSize,
  formatTime,
  getSurahReadingTime,
  isPopularSurah,
  getSurahTypeColorClass,
  getSurahTypeIcon,
  getSurahDifficulty,
  getSurahCategory
} = QuranUtils;

// Default export
export default quranUtils;