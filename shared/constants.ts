// Shared constants for InamiMapApp

// Inami location constants
export const INAMI_CENTER = {
  latitude: 36.5569,
  longitude: 136.9628,
} as const;

export const INAMI_BOUNDS = {
  north: 36.57,
  south: 36.54,
  east: 137.0,
  west: 136.92,
} as const;

// API configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Map configuration
export const MAP_CONFIG = {
  DEFAULT_ZOOM: 15,
  MIN_ZOOM: 10,
  MAX_ZOOM: 18,
  TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
} as const;

// Event statuses
export const EVENT_APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const EVENT_PROGRESS_STATUS = {
  SCHEDULED: 'scheduled',    // 予定
  CANCELLED: 'cancelled',    // 中止
  ONGOING: 'ongoing',        // 開催中
  FINISHED: 'finished',      // 終了
} as const;

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  SHOP_OWNER: 'shop_owner',
} as const;

// Image upload constraints
export const IMAGE_CONSTRAINTS = {
  MAX_IMAGES_PER_ITEM: 5,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// App configuration
export const APP_CONFIG = {
  NAME: 'InamiMapApp',
  VERSION: '1.0.0',
  DESCRIPTION: 'Explore the beautiful Inami region',
  AUTHOR: 'Hayato Shimada',
} as const;

// Validation constants
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNAUTHORIZED: 'Please log in to continue.',
  NOT_FOUND: 'The requested resource was not found.',
  LOCATION_PERMISSION_DENIED: 'Location permission is required to use this feature.',
  LOCATION_SERVICE_DISABLED: 'Please enable location services.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  REGISTER_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  DATA_SAVED: 'Data saved successfully!',
  LOCATION_UPDATED: 'Location updated successfully!',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  LAST_LOCATION: 'lastLocation',
  PREFERENCES: 'userPreferences',
  OFFLINE_DATA: 'offlineData',
} as const;

// Date formats
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  DATE_ONLY: 'YYYY-MM-DD',
  TIME_ONLY: 'HH:mm:ss',
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm',
} as const;