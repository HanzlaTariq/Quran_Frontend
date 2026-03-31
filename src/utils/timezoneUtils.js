// src/utils/timezoneUtils.js
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

/**
 * Get user's timezone with fallback
 */
export const getUserTimezone = (user) => {
  if (user?.timezone) return user.timezone;
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
};

/**
 * Convert time from one timezone to another
 * @param {string} timeStr - Time in HH:MM format
 * @param {string} fromTimezone - Source timezone
 * @param {string} toTimezone - Target timezone
 * @param {Date} date - Reference date (defaults to today)
 * @returns {string} Converted time in HH:MM format
 */
export const convertTimeBetweenTimezones = (timeStr, fromTimezone, toTimezone, date = new Date()) => {
  if (!timeStr || !fromTimezone || !toTimezone) return timeStr;

  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const refDate = dayjs(date);

    // Create date in source timezone
    const sourceDate = dayjs.tz(
      `${refDate.format('YYYY-MM-DD')} ${timeStr}`,
      'YYYY-MM-DD HH:mm',
      fromTimezone
    );

    // Convert to target timezone
    const targetDate = sourceDate.tz(toTimezone);

    // Return formatted time
    return targetDate.format('HH:mm');
  } catch (error) {
    console.error('Time conversion error:', error);
    return timeStr;
  }
};

/**
 * Convert local time to UTC
 * @param {string} timeStr - Time in HH:MM format
 * @param {string} localTimezone - Local timezone
 * @param {Date} date - Reference date
 * @returns {string} UTC time in HH:MM format
 */
export const localToUTC = (timeStr, localTimezone, date = new Date()) => {
  if (!timeStr || !localTimezone) return timeStr;

  try {
    const [hours, minutes] = timeStr.split(':').map(Number);

    // ✅ Correct way
    const localDate = dayjs.tz(
      `${dayjs(date).format('YYYY-MM-DD')} ${timeStr}`,
      'YYYY-MM-DD HH:mm',
      localTimezone
    );

    const utcDate = localDate.utc();
    return utcDate.format('HH:mm');
  } catch (error) {
    console.error('Local to UTC conversion error:', error);
    return timeStr;
  }
};

/**
 * Convert UTC to local time
 * @param {string} utcTimeStr - UTC time in HH:MM format
 * @param {string} localTimezone - Local timezone
 * @param {Date} date - Reference date
 * @returns {string} Local time in HH:MM format
 */
export const utcToLocal = (utcTimeStr, localTimezone, date = new Date()) => {
  if (!utcTimeStr || !localTimezone) return utcTimeStr;

  try {
    const [hours, minutes] = utcTimeStr.split(':').map(Number);
    const utcDate = dayjs.utc(date)
      .hour(hours)
      .minute(minutes)
      .second(0);

    const localDate = utcDate.tz(localTimezone);
    return localDate.format('HH:mm');
  } catch (error) {
    console.error('UTC to local conversion error:', error);
    return utcTimeStr;
  }
};

/**
 * Format time for display in 12-hour format
 * @param {string} timeStr - Time in HH:MM format
 * @returns {string} Formatted time (e.g., "09:30 AM")
 */
export const formatTime12 = (timeStr) => {
  if (!timeStr) return '';

  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return timeStr;
  }
};

/**
 * Format time with timezone info
 * @param {string} timeStr - Time in HH:MM format
 * @param {string} timezone - Timezone name
 * @returns {string} Formatted time with timezone
 */
export const formatTimeWithTimezone = (timeStr, timezone) => {
  if (!timeStr || !timezone) return timeStr;

  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = dayjs().tz(timezone).hour(hours).minute(minutes);
    const time12 = date.format('hh:mm A');
    const tzAbbr = getTimezoneAbbreviation(timezone);

    return `${time12} (${tzAbbr})`;
  } catch (error) {
    return timeStr;
  }
};

/**
 * Get timezone abbreviation
 * @param {string} timezone - Timezone name
 * @returns {string} Timezone abbreviation
 */
export const getTimezoneAbbreviation = (timezone) => {
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'short'
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find(part => part.type === 'timeZoneName');
    return tzPart ? tzPart.value : timezone.split('/').pop();
  } catch (error) {
    return timezone.split('/').pop() || 'UTC';
  }
};

/**
 * Generate time slots between start and end time
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @param {number} intervalMinutes - Interval in minutes
 * @param {string} sourceTZ - Source timezone
 * @param {string} targetTZ - Target timezone
 * @returns {Array} Array of time slots
 */
export const generateTimeSlots = (startTime, endTime, intervalMinutes = 30, sourceTZ, targetTZ) => {
  const slots = [];

  if (!startTime || !endTime) return slots;

  try {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    for (let time = startMinutes; time < endMinutes; time += intervalMinutes) {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      const nextTime = time + intervalMinutes;

      if (nextTime <= endMinutes) {
        const nextHours = Math.floor(nextTime / 60);
        const nextMinutes = nextTime % 60;

        const slotStart = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const slotEnd = `${nextHours.toString().padStart(2, '0')}:${nextMinutes.toString().padStart(2, '0')}`;

        // Convert to target timezone if needed
        const studentStart = sourceTZ && targetTZ
          ? convertTimeBetweenTimezones(slotStart, sourceTZ, targetTZ)
          : slotStart;
        const studentEnd = sourceTZ && targetTZ
          ? convertTimeBetweenTimezones(slotEnd, sourceTZ, targetTZ)
          : slotEnd;

        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          studentStartTime: studentStart,
          studentEndTime: studentEnd,
          durationMinutes: intervalMinutes,
          label: `${formatTime12(studentStart)} - ${formatTime12(studentEnd)}`,
          teacherLabel: `${formatTime12(slotStart)} - ${formatTime12(slotEnd)}`,
          startUTC: localToUTC(slotStart, sourceTZ),
          endUTC: localToUTC(slotEnd, sourceTZ)
        });
      }
    }
  } catch (error) {
    console.error('Error generating time slots:', error);
  }

  return slots;
};

/**
 * Create enrollment schedule with timezone info
 * @param {Object} params - Schedule parameters
 * @returns {Object} Schedule object with UTC times and metadata
 */
export const createScheduleWithTimezone = ({
  days,
  startTime,
  endTime,
  studentTimezone,
  teacherTimezone,
  durationMinutes
}) => {
  const currentDate = new Date();

  // Convert to UTC
  const utcStart = localToUTC(startTime, studentTimezone, currentDate);
  const utcEnd = localToUTC(endTime, studentTimezone, currentDate);

  // Create UTC ISO strings for exact datetime reference
  const [startHour, startMinute] = utcStart.split(':').map(Number);
  const [endHour, endMinute] = utcEnd.split(':').map(Number);

  const utcStartDate = new Date(currentDate);
  utcStartDate.setUTCHours(startHour, startMinute, 0, 0);

  const utcEndDate = new Date(currentDate);
  utcEndDate.setUTCHours(endHour, endMinute, 0, 0);

  return {
    days,
    startTime: utcStart, // Store in UTC
    endTime: utcEnd, // Store in UTC
    durationMinutes: durationMinutes || (parseInt(endHour) * 60 + endMinute) - (parseInt(startHour) * 60 + startMinute),
    studentTimezone,
    teacherTimezone,
    originalStartTime: startTime,
    originalEndTime: endTime,
    utcStart: utcStartDate.toISOString(),
    utcEnd: utcEndDate.toISOString()
  };
};

/**
 * Get display times for schedule based on viewer's timezone
 * @param {Object} schedule - Schedule object from database
 * @param {string} viewerTimezone - Viewer's timezone
 * @returns {Object} Display times
 */
export const getScheduleDisplayTimes = (schedule, viewerTimezone) => {
  if (!schedule) return null;

  try {
    // Handle MongoDB extended JSON format or Date objects
    let utcStart, utcEnd;

    if (schedule.utcStart) {
      if (typeof schedule.utcStart === 'object' && schedule.utcStart.$date) {
        utcStart = schedule.utcStart.$date;
      } else {
        utcStart = schedule.utcStart;
      }
    }

    if (schedule.utcEnd) {
      if (typeof schedule.utcEnd === 'object' && schedule.utcEnd.$date) {
        utcEnd = schedule.utcEnd.$date;
      } else {
        utcEnd = schedule.utcEnd;
      }
    }

    // If we have UTC times, use them for accurate conversion
    if (utcStart && utcEnd) {
      const utcStartDate = new Date(utcStart);
      const utcEndDate = new Date(utcEnd);

      const viewerStart = utcStartDate.toLocaleTimeString('en-US', {
        timeZone: viewerTimezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const viewerEnd = utcEndDate.toLocaleTimeString('en-US', {
        timeZone: viewerTimezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      return {
        startTime: viewerStart,
        endTime: viewerEnd,
        startTime12: formatTime12(viewerStart),
        endTime12: formatTime12(viewerEnd),
        duration: schedule.durationMinutes
      };
    }

    // Fallback: Use stored UTC times
    if (schedule.startTime && schedule.endTime) {
      const viewerStart = utcToLocal(schedule.startTime, viewerTimezone);
      const viewerEnd = utcToLocal(schedule.endTime, viewerTimezone);

      return {
        startTime: viewerStart,
        endTime: viewerEnd,
        startTime12: formatTime12(viewerStart),
        endTime12: formatTime12(viewerEnd),
        duration: schedule.durationMinutes
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting schedule display times:', error);
    return null;
  }
};

/**
 * Get display times for a class based on viewer's timezone
 * @param {Object} classObj - Class object from database
 * @param {string} viewerTimezone - Viewer's timezone
 * @returns {Object} Display times
 */
export const getClassDisplayTimes = (classObj, viewerTimezone) => {
  if (!classObj) return null;

  try {
    // Use UTC Date objects for accurate conversion
    if (classObj.utcStart && classObj.utcEnd) {
      const utcStartDate = new Date(classObj.utcStart);
      const utcEndDate = new Date(classObj.utcEnd);

      const viewerStart = utcStartDate.toLocaleTimeString('en-US', {
        timeZone: viewerTimezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const viewerEnd = utcEndDate.toLocaleTimeString('en-US', {
        timeZone: viewerTimezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      return {
        startTime: viewerStart,
        endTime: viewerEnd,
        startTime12: formatTime12(viewerStart),
        endTime12: formatTime12(viewerEnd),
        duration: Math.round((utcEndDate - utcStartDate) / (1000 * 60)) // minutes
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting class display times:', error);
    return null;
  }
};

/**
 * Calculate duration between two time strings in minutes
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {number} Duration in minutes
 */
const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;

  try {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    return endMinutes - startMinutes;
  } catch (error) {
    return 0;
  }
};

/**
 * Validate if a time slot is within teacher's working hours
 * @param {string} timeStr - Time in HH:MM format
 * @param {string} teacherTZ - Teacher's timezone
 * @param {string} studentTZ - Student's timezone
 * @param {Object} workingHours - Teacher's working hours {startTime, endTime}
 * @returns {boolean} True if valid
 */
export const isValidTimeSlot = (timeStr, teacherTZ, studentTZ, workingHours) => {
  if (!timeStr || !teacherTZ || !workingHours) return false;

  try {
    // Convert student's selected time to teacher's timezone
    const teacherTime = convertTimeBetweenTimezones(timeStr, studentTZ, teacherTZ);

    // Check if within working hours
    const [selectedHour, selectedMinute] = teacherTime.split(':').map(Number);
    const [startHour, startMinute] = workingHours.startTime.split(':').map(Number);
    const [endHour, endMinute] = workingHours.endTime.split(':').map(Number);

    const selectedMinutes = selectedHour * 60 + selectedMinute;
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    return selectedMinutes >= startMinutes && selectedMinutes < endMinutes;
  } catch (error) {
    console.error('Error validating time slot:', error);
    return false;
  }
};

/**
 * Get timezone offset in minutes
 * @param {string} timezone - Timezone name
 * @param {Date} date - Reference date
 * @returns {number} Offset in minutes
 */
export const getTimezoneOffset = (timezone, date = new Date()) => {
  try {
    const dateStr = date.toLocaleString('en-US', { timeZone: timezone });
    const tzDate = new Date(dateStr);
    return tzDate.getTimezoneOffset();
  } catch (error) {
    return 0;
  }
};

/**
 * Get list of common timezones
 * @returns {Array} List of timezones
 */
export const getCommonTimezones = () => {
  return [
    { value: 'UTC', label: 'UTC' },
    { value: 'Asia/Karachi', label: 'Pakistan (PKT)' },
    { value: 'Asia/Dhaka', label: 'Bangladesh (BST)' },
    { value: 'Asia/Dubai', label: 'UAE (GST)' },
    { value: 'Asia/Riyadh', label: 'Saudi Arabia (AST)' },
    { value: 'Asia/Kolkata', label: 'India (IST)' },
    { value: 'Asia/Kabul', label: 'Afghanistan (AFT)' },
    { value: 'Asia/Tehran', label: 'Iran (IRST)' },
    { value: 'Asia/Baghdad', label: 'Iraq (AST)' },
    { value: 'Asia/Amman', label: 'Jordan (EET)' },
    { value: 'Africa/Cairo', label: 'Egypt (EET)' },
    { value: 'America/New_York', label: 'USA (EST/EDT)' },
    { value: 'America/Los_Angeles', label: 'USA (PST/PDT)' },
    { value: 'Europe/London', label: 'UK (GMT/BST)' },
    { value: 'Europe/Istanbul', label: 'Turkey (TRT)' },
    { value: 'Australia/Sydney', label: 'Australia (AEDT)' }
  ];
};

// Export all functions as default object
export default {
  getUserTimezone,
  convertTimeBetweenTimezones,
  localToUTC,
  utcToLocal,
  formatTime12,
  formatTimeWithTimezone,
  getTimezoneAbbreviation,
  generateTimeSlots,
  createScheduleWithTimezone,
  getScheduleDisplayTimes,
  getClassDisplayTimes, // ✅ add this

  isValidTimeSlot,
  getTimezoneOffset,
  getCommonTimezones
};