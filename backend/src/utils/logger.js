// Logging utility using Winston
// Sprint 7-8: Core Backend Development - Day 1 Task 1.2

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which logs to print based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
];

// Create the logger
export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false
});

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Stream for Morgan HTTP logging
export const morganStream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};

// Error logging helper
export const logError = (error, context = {}) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    ...context
  });
};

// Performance logging helper
export const logPerformance = (operation, duration, metadata = {}) => {
  logger.info('Performance Metric', {
    operation,
    duration: `${duration}ms`,
    ...metadata
  });
};

// Security logging helper
export const logSecurity = (event, details = {}) => {
  logger.warn('Security Event', {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Business logic logging helper
export const logBusiness = (event, data = {}) => {
  logger.info('Business Event', {
    event,
    timestamp: new Date().toISOString(),
    ...data
  });
};

// Database operation logging helper
export const logDatabase = (operation, table, duration, metadata = {}) => {
  logger.debug('Database Operation', {
    operation,
    table,
    duration: `${duration}ms`,
    ...metadata
  });
};

// API usage logging helper
export const logAPIUsage = (endpoint, userId, metadata = {}) => {
  logger.info('API Usage', {
    endpoint,
    userId,
    timestamp: new Date().toISOString(),
    ...metadata
  });
};

// Gamification event logging helper
export const logGamification = (event, userId, data = {}) => {
  logger.info('Gamification Event', {
    event,
    userId,
    timestamp: new Date().toISOString(),
    ...data
  });
};

export default logger;
