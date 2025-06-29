// API Configuration
export const API_BASE_URL = "http://localhost:8000/api";

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
};

// App Configuration
export const APP_CONFIG = {
  NAME: "Telegram Message Viewer",
  VERSION: "1.0.0",
  AUTHOR: "onelaack",
};

// Telegram Configuration
export const TELEGRAM_CONFIG = {
  MAX_MESSAGE_LIMIT: 100,
  DEFAULT_MESSAGE_LIMIT: 50,
  PHONE_REGEX: /^\+[1-9]\d{1,14}$/,
};

// UI Constants
export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
};

// Chat Types
export const CHAT_TYPES = {
  USER: "user",
  GROUP: "group",
  CHANNEL: "channel",
};

// Message Types
export const MESSAGE_TYPES = {
  TEXT: "text",
  MEDIA: "media",
  SYSTEM: "system",
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Помилка мережі. Перевірте з'єднання.",
  UNAUTHORIZED: "Необхідна авторизація",
  TELEGRAM_NOT_CONNECTED: "Telegram не підключений",
  INVALID_PHONE: "Невірний формат номеру телефону",
  WEAK_PASSWORD: "Пароль повинен містити мінімум 6 символів",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Успішний вхід!",
  REGISTER_SUCCESS: "Реєстрація успішна!",
  TELEGRAM_CONNECTED: "Telegram підключено!",
  TELEGRAM_DISCONNECTED: "Telegram відключено!",
};
