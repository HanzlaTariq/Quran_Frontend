// import React, { useState } from 'react';
// import {
//   Menu, Search, Book, Headphones, Globe,
//   Bookmark, BarChart3, Settings, Sun, Moon,
//   User, Bell, Home, Sparkles, ChevronDown,
//   LogOut, HelpCircle, Download, Share2,
//   Maximize2, Minimize2, X
// } from 'lucide-react';
// import { quranService } from '../../services';
// import toast from 'react-hot-toast';

// const NavigationBar = ({
//   darkMode,
//   onDarkModeToggle,
//   onSearchClick,
//   onMenuClick,
//   reciter,
//   translation,
//   onReciterChange,
//   onTranslationChange,
//   currentSurah,
//   currentAyah
// }) => {
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [showUserMenu, setShowUserMenu] = useState(false);
//   const [showReciterMenu, setShowReciterMenu] = useState(false);
//   const [showTranslationMenu, setShowTranslationMenu] = useState(false);
//   const [notifications, setNotifications] = useState([]);

//   const toggleFullscreen = () => {
//     if (!document.fullscreenElement) {
//       document.documentElement.requestFullscreen();
//       setIsFullscreen(true);
//     } else {
//       document.exitFullscreen();
//       setIsFullscreen(false);
//     }
//   };

//   const handleShare = async () => {
//     let text = 'Reading Quran';
//     if (currentSurah && currentAyah) {
//       text = `Reading Surah ${currentSurah} - Ayah ${currentAyah}`;
//     }

//     const shareData = {
//       title: 'Quran App',
//       text: text,
//       url: window.location.href
//     };

//     if (navigator.share) {
//       try {
//         await navigator.share(shareData);
//       } catch (err) {
//         console.log('Error sharing:', err);
//       }
//     } else {
//       navigator.clipboard.writeText(shareData.url);
//       toast.success('Link copied to clipboard!');
//     }
//   };

//   const handleDownload = () => {
//     // Trigger download of current surah
//     if (currentSurah) {
//       toast.success('Downloading surah...');
//       // Implementation would depend on your download logic
//     } else {
//       toast.error('Please select a surah first');
//     }
//   };

//   const popularReciters = quranService.getPopularReciters();
//   const popularTranslations = quranService.getPopularTranslations();

//   const navItems = [
//     { id: 'home', label: 'Home', icon: Home },
//     { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
//     { id: 'statistics', label: 'Statistics', icon: BarChart3 },
//     { id: 'settings', label: 'Settings', icon: Settings }
//   ];

//   return (
//     <nav className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300 ${darkMode
//         ? 'bg-gray-900 border-gray-800 text-white'
//         : 'bg-white border-gray-200 text-gray-900'
//       }`}>
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between h-16">
//           {/* Left Section */}
//           <div className="flex items-center space-x-4">
//             {/* Logo/Brand */}
//             <div className="flex items-center space-x-3">
//               <button
//                 onClick={onMenuClick}
//                 className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
//               >
//                 <Menu className="h-5 w-5" />
//               </button>

//               <div className="hidden md:flex items-center space-x-2">
//                 <div className="p-2 bg-green-600 text-white rounded-lg">
//                   <Book className="h-5 w-5" />
//                 </div>
//                 <div>
//                   <h1 className="font-bold text-lg">Quran App</h1>
//                   <p className="text-xs opacity-75">Digital Mushaf</p>
//                 </div>
//               </div>
//             </div>

//             {/* Search Button (Mobile) */}
//             <button
//               onClick={onSearchClick}
//               className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
//             >
//               <Search className="h-5 w-5" />
//             </button>
//           </div>

//           {/* Center Section - Navigation */}
//           <div className="hidden md:flex items-center space-x-1">
//             {navItems.map((item) => (
//               <button
//                 key={item.id}
//                 className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${window.location.pathname.includes(item.id)
//                     ? 'bg-green-600 text-white'
//                     : 'hover:bg-gray-100 dark:hover:bg-gray-800'
//                   }`}
//                 onClick={() => window.location.hash = `#${item.id}`}
//               >
//                 <item.icon className="h-4 w-4" />
//                 <span>{item.label}</span>
//               </button>
//             ))}
//           </div>

//           {/* Right Section */}
//           <div className="flex items-center space-x-2">
//             {/* Search (Desktop) */}
//             <button
//               onClick={onSearchClick}
//               className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
//             >
//               <Search className="h-4 w-4" />
//               <span>Search</span>
//             </button>

//             {/* Reciter Selector */}
//             <div className="relative">
//               <button
//                 onClick={() => setShowReciterMenu(!showReciterMenu)}
//                 className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
//               >
//                 <Headphones className="h-4 w-4" />
//                 <span className="max-w-[100px] truncate">
//                   {popularReciters.find(r => r.identifier === reciter)?.name || 'Reciter'}
//                 </span>
//                 <ChevronDown className="h-3 w-3" />
//               </button>

//               {showReciterMenu && (
//                 <div className={`absolute right-0 top-full mt-2 py-2 min-w-[200px] rounded-lg shadow-xl z-50 ${darkMode ? 'bg-gray-800' : 'bg-white'
//                   }`}>
//                   {popularReciters.map((r) => (
//                     <button
//                       key={r.identifier}
//                       onClick={() => {
//                         onReciterChange(r.identifier);
//                         setShowReciterMenu(false);
//                         toast.success(`Reciter changed to ${r.name}`);
//                       }}
//                       className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${reciter === r.identifier ? 'bg-green-50 dark:bg-green-900/20' : ''
//                         }`}
//                     >
//                       {r.name}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Translation Selector */}
//             <div className="relative">
//               <button
//                 onClick={() => setShowTranslationMenu(!showTranslationMenu)}
//                 className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
//               >
//                 <Globe className="h-4 w-4" />
//                 <span className="max-w-[100px] truncate">
//                   {popularTranslations.find(t => t.identifier === translation)?.name || 'Translation'}
//                 </span>
//                 <ChevronDown className="h-3 w-3" />
//               </button>

//               {showTranslationMenu && (
//                 <div className={`absolute right-0 top-full mt-2 py-2 min-w-[200px] rounded-lg shadow-xl z-50 ${darkMode ? 'bg-gray-800' : 'bg-white'
//                   }`}>
//                   {popularTranslations.map((t) => (
//                     <button
//                       key={t.identifier}
//                       onClick={() => {
//                         onTranslationChange(t.identifier);
//                         setShowTranslationMenu(false);
//                         toast.success(`Translation changed to ${t.name}`);
//                       }}
//                       className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${translation === t.identifier ? 'bg-green-50 dark:bg-green-900/20' : ''
//                         }`}
//                     >
//                       {t.name} ({t.language.toUpperCase()})
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Action Buttons */}
//             <div className="hidden md:flex items-center space-x-1">
//               <button
//                 onClick={handleShare}
//                 className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
//                 title="Share"
//               >
//                 <Share2 className="h-5 w-5" />
//               </button>

//               <button
//                 onClick={handleDownload}
//                 className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
//                 title="Download"
//               >
//                 <Download className="h-5 w-5" />
//               </button>

//               <button
//                 onClick={toggleFullscreen}
//                 className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
//                 title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
//               >
//                 {isFullscreen ? (
//                   <Minimize2 className="h-5 w-5" />
//                 ) : (
//                   <Maximize2 className="h-5 w-5" />
//                 )}
//               </button>

//               <button
//                 onClick={onDarkModeToggle}
//                 className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
//                 title={darkMode ? "Light Mode" : "Dark Mode"}
//               >
//                 {darkMode ? (
//                   <Sun className="h-5 w-5" />
//                 ) : (
//                   <Moon className="h-5 w-5" />
//                 )}
//               </button>
//             </div>

//             {/* User Menu */}
//             <div className="relative">
//               <button
//                 onClick={() => setShowUserMenu(!showUserMenu)}
//                 className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
//               >
//                 <User className="h-5 w-5" />
//                 <span className="hidden md:inline">Account</span>
//                 <ChevronDown className="h-3 w-3" />
//               </button>

//               {showUserMenu && (
//                 <div className={`absolute right-0 top-full mt-2 py-2 min-w-[200px] rounded-lg shadow-xl z-50 ${darkMode ? 'bg-gray-800' : 'bg-white'
//                   }`}>
//                   <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
//                     <p className="font-medium">Welcome Back</p>
//                     <p className="text-sm opacity-75">Quran Reader</p>
//                   </div>

//                   <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
//                     <div className="flex items-center space-x-3">
//                       <User className="h-4 w-4" />
//                       <span>Profile</span>
//                     </div>
//                   </button>

//                   <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
//                     <div className="flex items-center space-x-3">
//                       <Settings className="h-4 w-4" />
//                       <span>Settings</span>
//                     </div>
//                   </button>

//                   <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
//                     <div className="flex items-center space-x-3">
//                       <HelpCircle className="h-4 w-4" />
//                       <span>Help & Support</span>
//                     </div>
//                   </button>

//                   <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
//                     <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
//                       <div className="flex items-center space-x-3">
//                         <LogOut className="h-4 w-4" />
//                         <span>Log Out</span>
//                       </div>
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Mobile Bottom Navigation */}
//         <div className="md:hidden fixed bottom-0 left-0 right-0 border-t">
//           <div className={`flex items-center justify-around py-2 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
//             }`}>
//             {navItems.map((item) => (
//               <button
//                 key={item.id}
//                 className="flex flex-col items-center space-y-1 p-2"
//                 onClick={() => window.location.hash = `#${item.id}`}
//               >
//                 <item.icon className="h-5 w-5" />
//                 <span className="text-xs">{item.label}</span>
//               </button>
//             ))}

//             <button
//               onClick={onDarkModeToggle}
//               className="flex flex-col items-center space-y-1 p-2"
//             >
//               {darkMode ? (
//                 <Sun className="h-5 w-5" />
//               ) : (
//                 <Moon className="h-5 w-5" />
//               )}
//               <span className="text-xs">Theme</span>
//             </button>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default NavigationBar;