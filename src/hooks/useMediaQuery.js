import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if a media query matches
 * @param {string} query - CSS media query string
 * @returns {boolean} - Whether the media query matches
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is defined (for SSR)
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    
    // Update state initially
    setMatches(media.matches);
    
    // Create event listener for changes
    const listener = (event) => {
      setMatches(event.matches);
    };
    
    // Add listener
    media.addEventListener('change', listener);
    
    // Clean up
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
};

/**
 * Predefined media query hooks for common breakpoints
 */

// Mobile devices (up to 640px)
export const useIsMobile = () => useMediaQuery('(max-width: 640px)');

// Tablets (641px to 1024px)
export const useIsTablet = () => useMediaQuery('(min-width: 641px) and (max-width: 1024px)');

// Desktop (1025px and above)
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');

// Small mobile devices (up to 375px)
export const useIsSmallMobile = () => useMediaQuery('(max-width: 375px)');

// Large mobile devices (376px to 425px)
export const useIsLargeMobile = () => useMediaQuery('(min-width: 376px) and (max-width: 425px)');

// Large desktop (1440px and above)
export const useIsLargeDesktop = () => useMediaQuery('(min-width: 1440px)');

// Portrait orientation
export const useIsPortrait = () => useMediaQuery('(orientation: portrait)');

// Landscape orientation
export const useIsLandscape = () => useMediaQuery('(orientation: landscape)');

// High DPI screens (Retina)
export const useIsRetina = () => useMediaQuery('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)');

// Touch devices
export const useIsTouchDevice = () => useMediaQuery('(hover: none) and (pointer: coarse)');

// Print mode
export const useIsPrint = () => useMediaQuery('print');

// Dark mode preference
export const usePrefersDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)');

// Reduced motion preference
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');

// High contrast preference
export const usePrefersHighContrast = () => useMediaQuery('(prefers-contrast: high)');

// Custom breakpoints
export const useBreakpoint = (breakpoint) => {
  const queries = {
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
    '2xl': '(min-width: 1536px)',
  };
  
  return useMediaQuery(queries[breakpoint] || breakpoint);
};

// Responsive hook that returns breakpoint name
export const useResponsive = () => {
  const isSm = useMediaQuery('(min-width: 640px)');
  const isMd = useMediaQuery('(min-width: 768px)');
  const isLg = useMediaQuery('(min-width: 1024px)');
  const isXl = useMediaQuery('(min-width: 1280px)');
  const is2xl = useMediaQuery('(min-width: 1536px)');

  if (is2xl) return '2xl';
  if (isXl) return 'xl';
  if (isLg) return 'lg';
  if (isMd) return 'md';
  if (isSm) return 'sm';
  return 'xs';
};

// Hook for responsive values
export const useResponsiveValue = (values) => {
  const breakpoint = useResponsive();
  
  const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const index = breakpoints.indexOf(breakpoint);
  
  // Find the most appropriate value
  for (let i = index; i >= 0; i--) {
    if (values[breakpoints[i]] !== undefined) {
      return values[breakpoints[i]];
    }
  }
  
  // Return default if specified
  return values.default;
};

// Hook for responsive styles
export const useResponsiveStyle = (styles) => {
  const breakpoint = useResponsive();
  
  return styles[breakpoint] || styles.default || {};
};

// Hook for conditional rendering based on screen size
export const useResponsiveRender = (components) => {
  const breakpoint = useResponsive();
  
  return components[breakpoint] || components.default || null;
};

// Hook for device detection
export const useDeviceDetection = () => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const isTouch = useIsTouchDevice();
  const isPortrait = useIsPortrait();
  const isRetina = useIsRetina();

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    isPortrait,
    isRetina,
    isLandscape: !isPortrait,
    deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
  };
};

// Hook for theme detection
export const useThemeDetection = () => {
  const prefersDark = usePrefersDarkMode();
  const prefersReducedMotion = usePrefersReducedMotion();
  const prefersHighContrast = usePrefersHighContrast();

  return {
    prefersDark,
    prefersReducedMotion,
    prefersHighContrast,
  };
};

// Hook for responsive layout with fallbacks
export const useLayout = () => {
  const { isMobile, isTablet, isDesktop } = useDeviceDetection();
  const responsive = useResponsive();
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    breakpoint: responsive,
    columns: isMobile ? 1 : isTablet ? 2 : 3,
    spacing: isMobile ? 2 : isTablet ? 3 : 4,
    fontSize: isMobile ? 'sm' : isTablet ? 'md' : 'lg',
    padding: isMobile ? 'p-4' : isTablet ? 'p-6' : 'p-8',
  };
};

// Hook for responsive grid configuration
export const useGridConfig = () => {
  const { isMobile, isTablet, isDesktop } = useDeviceDetection();
  
  return {
    columns: isMobile ? 1 : isTablet ? 2 : 3,
    gap: isMobile ? 'gap-4' : isTablet ? 'gap-6' : 'gap-8',
    rowGap: isMobile ? 'gap-y-4' : isTablet ? 'gap-y-6' : 'gap-y-8',
    colGap: isMobile ? 'gap-x-4' : isTablet ? 'gap-x-6' : 'gap-x-8',
  };
};

// Hook for responsive typography
export const useTypography = () => {
  const { isMobile, isTablet, isDesktop } = useDeviceDetection();
  
  return {
    h1: isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-4xl',
    h2: isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-3xl',
    h3: isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl',
    body: isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-lg',
    small: isMobile ? 'text-xs' : isTablet ? 'text-sm' : 'text-base',
  };
};

// Hook for responsive container
export const useContainer = () => {
  const { isMobile, isTablet, isDesktop } = useDeviceDetection();
  
  return {
    maxWidth: isMobile ? 'max-w-full' : isTablet ? 'max-w-3xl' : 'max-w-6xl',
    padding: isMobile ? 'px-4' : isTablet ? 'px-6' : 'px-8',
    margin: isMobile ? 'mx-auto' : 'mx-auto',
  };
};

// Export all hooks
export default {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsSmallMobile,
  useIsLargeMobile,
  useIsLargeDesktop,
  useIsPortrait,
  useIsLandscape,
  useIsRetina,
  useIsTouchDevice,
  useIsPrint,
  usePrefersDarkMode,
  usePrefersReducedMotion,
  usePrefersHighContrast,
  useBreakpoint,
  useResponsive,
  useResponsiveValue,
  useResponsiveStyle,
  useResponsiveRender,
  useDeviceDetection,
  useThemeDetection,
  useLayout,
  useGridConfig,
  useTypography,
  useContainer,
};