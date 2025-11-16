// Shared utility functions for InamiMapApp

import { ValidationError, ValidationResult } from './types';
import { VALIDATION, ERROR_MESSAGES } from './constants';

/**
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!VALIDATION.EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate password
 */
export function validatePassword(password: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    errors.push({ 
      field: 'password', 
      message: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long` 
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate name
 */
export function validateName(name: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!name) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (name.length < VALIDATION.NAME_MIN_LENGTH) {
    errors.push({ 
      field: 'name', 
      message: `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters long` 
    });
  } else if (name.length > VALIDATION.NAME_MAX_LENGTH) {
    errors.push({ 
      field: 'name', 
      message: `Name must be no more than ${VALIDATION.NAME_MAX_LENGTH} characters long` 
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate distance between two coordinates in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Format distance for display
 */
export function formatDistance(distanceInMeters: number): string {
  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)} m`;
  } else {
    const km = distanceInMeters / 1000;
    return `${km.toFixed(1)} km`;
  }
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, includeTime = false): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (includeTime) {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } else {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(null, args);
    }
  };
}

/**
 * Check if coordinates are within Inami bounds
 */
export function isWithinInami(latitude: number, longitude: number): boolean {
  return (
    latitude >= 36.54 &&
    latitude <= 36.57 &&
    longitude >= 136.92 &&
    longitude <= 137.0
  );
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Sleep function for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Safe JSON parsing
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if string is empty or whitespace only
 */
export function isEmptyString(value: string): boolean {
  return !value || value.trim().length === 0;
}