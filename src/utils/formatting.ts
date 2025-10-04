// Formatting utilities for the Diet Game application
// Comprehensive data formatting functions for display and presentation

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Formats a number with commas for better readability
 * @param num - Number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}

/**
 * Formats a large number with appropriate suffixes (K, M, B)
 * @param num - Number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted number string with suffix
 */
export function formatLargeNumber(num: number, decimals: number = 1): string {
  if (num >= 1000000000) {
    return formatNumber(num / 1000000000, decimals) + 'B';
  } else if (num >= 1000000) {
    return formatNumber(num / 1000000, decimals) + 'M';
  } else if (num >= 1000) {
    return formatNumber(num / 1000, decimals) + 'K';
  }
  return formatNumber(num, decimals);
}

/**
 * Formats a percentage value
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats a ratio as a percentage
 * @param numerator - Numerator value
 * @param denominator - Denominator value
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatRatioAsPercentage(numerator: number, denominator: number, decimals: number = 1): string {
  if (denominator === 0) return '0%';
  const percentage = (numerator / denominator) * 100;
  return formatPercentage(percentage, decimals);
}

/**
 * Formats a currency value
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'USD')
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD', decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
}

// ============================================================================
// WEIGHT AND MEASUREMENT FORMATTING
// ============================================================================

/**
 * Formats weight in a user-friendly way
 * @param weight - Weight in kg
 * @param unit - Display unit ('kg' or 'lbs')
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted weight string
 */
export function formatWeight(weight: number, unit: 'kg' | 'lbs' = 'kg', decimals: number = 1): string {
  const displayWeight = unit === 'lbs' ? weight * 2.20462 : weight;
  return `${displayWeight.toFixed(decimals)} ${unit}`;
}

/**
 * Formats height in a user-friendly way
 * @param height - Height in cm
 * @param unit - Display unit ('cm' or 'ft')
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted height string
 */
export function formatHeight(height: number, unit: 'cm' | 'ft' = 'cm', decimals: number = 0): string {
  if (unit === 'ft') {
    const totalInches = height / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  }
  return `${height.toFixed(decimals)} cm`;
}

/**
 * Formats BMI with category
 * @param bmi - BMI value
 * @returns Formatted BMI string with category
 */
export function formatBMI(bmi: number): string {
  let category = '';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal weight';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';
  
  return `${bmi.toFixed(1)} (${category})`;
}

/**
 * Formats body fat percentage
 * @param percentage - Body fat percentage
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted body fat string
 */
export function formatBodyFat(percentage: number, decimals: number = 1): string {
  return `${percentage.toFixed(decimals)}% body fat`;
}

// ============================================================================
// NUTRITION FORMATTING
// ============================================================================

/**
 * Formats calories
 * @param calories - Number of calories
 * @returns Formatted calories string
 */
export function formatCalories(calories: number): string {
  return `${formatNumber(calories)} cal`;
}

/**
 * Formats macronutrients (protein, carbs, fat)
 * @param grams - Grams of macronutrient
 * @param unit - Unit to display ('g' or 'oz')
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted macronutrient string
 */
export function formatMacronutrient(grams: number, unit: 'g' | 'oz' = 'g', decimals: number = 1): string {
  const displayValue = unit === 'oz' ? grams * 0.035274 : grams;
  return `${displayValue.toFixed(decimals)} ${unit}`;
}

/**
 * Formats nutrition values for display
 * @param nutrition - Nutrition object
 * @returns Formatted nutrition string
 */
export function formatNutrition(nutrition: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}): string {
  const parts = [
    `${formatCalories(nutrition.calories)}`,
    `P: ${formatMacronutrient(nutrition.protein)}`,
    `C: ${formatMacronutrient(nutrition.carbs)}`,
    `F: ${formatMacronutrient(nutrition.fat)}`
  ];
  
  if (nutrition.fiber !== undefined) {
    parts.push(`Fiber: ${formatMacronutrient(nutrition.fiber)}`);
  }
  
  if (nutrition.sugar !== undefined) {
    parts.push(`Sugar: ${formatMacronutrient(nutrition.sugar)}`);
  }
  
  if (nutrition.sodium !== undefined) {
    parts.push(`Sodium: ${formatNumber(nutrition.sodium)} mg`);
  }
  
  return parts.join(' • ');
}

/**
 * Formats water intake
 * @param liters - Water intake in liters
 * @param unit - Display unit ('L' or 'oz')
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted water intake string
 */
export function formatWaterIntake(liters: number, unit: 'L' | 'oz' = 'L', decimals: number = 1): string {
  const displayValue = unit === 'oz' ? liters * 33.814 : liters;
  return `${displayValue.toFixed(decimals)} ${unit}`;
}

// ============================================================================
// TIME AND DATE FORMATTING
// ============================================================================

/**
 * Formats a date to a readable string
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
}

/**
 * Formats a time to a readable string
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted time string
 */
export function formatTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
}

/**
 * Formats date and time together
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
}

/**
 * Gets the relative time (e.g., "2 hours ago")
 * @param date - Date to compare
 * @returns Relative time string
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

/**
 * Formats duration in a human-readable way
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Formats time remaining until a target date
 * @param targetDate - Target date
 * @returns Formatted time remaining string
 */
export function formatTimeRemaining(targetDate: Date | string): string {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const now = new Date();
  const diffInMs = target.getTime() - now.getTime();
  
  if (diffInMs <= 0) return 'Overdue';
  
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} remaining`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  } else {
    return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  }
}

// ============================================================================
// TEXT FORMATTING
// ============================================================================

/**
 * Capitalizes the first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalizes the first letter of each word
 * @param str - String to capitalize
 * @returns Title case string
 */
export function titleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Converts a string to kebab-case
 * @param str - String to convert
 * @returns Kebab-case string
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Converts a string to camelCase
 * @param str - String to convert
 * @returns Camel-case string
 */
export function camelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

/**
 * Converts a string to snake_case
 * @param str - String to convert
 * @returns Snake-case string
 */
export function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Truncates text to a specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Formats a list of items with proper punctuation
 * @param items - Array of items
 * @param conjunction - Conjunction to use (default: 'and')
 * @returns Formatted list string
 */
export function formatList(items: string[], conjunction: string = 'and'): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  
  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1);
  
  return `${otherItems.join(', ')}, ${conjunction} ${lastItem}`;
}

// ============================================================================
// FILE SIZE FORMATTING
// ============================================================================

/**
 * Formats bytes to human readable format
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// ============================================================================
// PROGRESS AND STATUS FORMATTING
// ============================================================================

/**
 * Formats progress as a percentage with status
 * @param current - Current value
 * @param target - Target value
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted progress string
 */
export function formatProgress(current: number, target: number, decimals: number = 1): string {
  if (target === 0) return '0%';
  
  const percentage = (current / target) * 100;
  const status = percentage >= 100 ? '✅' : percentage >= 75 ? '🟢' : percentage >= 50 ? '🟡' : '🔴';
  
  return `${status} ${formatPercentage(percentage, decimals)}`;
}

/**
 * Formats streak information
 * @param days - Number of days in streak
 * @returns Formatted streak string
 */
export function formatStreak(days: number): string {
  if (days === 0) return 'No streak';
  if (days === 1) return '1 day streak';
  return `${days} day streak`;
}

/**
 * Formats achievement status
 * @param isCompleted - Whether achievement is completed
 * @param progress - Progress percentage (0-100)
 * @returns Formatted achievement status
 */
export function formatAchievementStatus(isCompleted: boolean, progress: number = 0): string {
  if (isCompleted) return '✅ Completed';
  return `🔄 ${formatPercentage(progress)} complete`;
}

// ============================================================================
// SPECIALIZED FORMATTING
// ============================================================================

/**
 * Formats a phone number
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone; // Return original if can't format
}

/**
 * Formats a credit card number (for display purposes)
 * @param cardNumber - Credit card number
 * @returns Formatted card number with asterisks
 */
export function formatCreditCard(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 4) return cardNumber;
  
  const lastFour = cleaned.slice(-4);
  const asterisks = '*'.repeat(cleaned.length - 4);
  
  return `${asterisks}${lastFour}`;
}

/**
 * Formats a social security number (for display purposes)
 * @param ssn - Social security number
 * @returns Formatted SSN with asterisks
 */
export function formatSSN(ssn: string): string {
  const cleaned = ssn.replace(/\D/g, '');
  if (cleaned.length !== 9) return ssn;
  
  return `***-**-${cleaned.slice(-4)}`;
}

/**
 * Formats a URL for display
 * @param url - URL to format
 * @param maxLength - Maximum length (default: 50)
 * @returns Formatted URL
 */
export function formatURL(url: string, maxLength: number = 50): string {
  try {
    const urlObj = new URL(url);
    const displayUrl = urlObj.hostname + urlObj.pathname;
    
    if (displayUrl.length <= maxLength) {
      return displayUrl;
    }
    
    return truncateText(displayUrl, maxLength);
  } catch {
    return truncateText(url, maxLength);
  }
}

/**
 * Formats a rating with stars
 * @param rating - Rating value (0-5)
 * @param maxRating - Maximum rating (default: 5)
 * @returns Formatted rating with stars
 */
export function formatRating(rating: number, maxRating: number = 5): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);
  
  const stars = '★'.repeat(fullStars) + 
                (hasHalfStar ? '☆' : '') + 
                '☆'.repeat(emptyStars);
  
  return `${stars} (${rating.toFixed(1)})`;
}
