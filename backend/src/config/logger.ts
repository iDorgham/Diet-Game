/**
 * Logger Configuration
 * Winston-based logging setup with multiple transports
 */

import winston from 'winston';
import path from 'path';
import { config } from './environment';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      winston.format.colorize({ all: true }),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
  }),
];

// Add file transport in non-test environments
if (config.nodeEnv !== 'test') {
  // Create logs directory if it doesn't exist
  const logDir = path.dirname(config.logging.file);
  
  transports.push(
    // File transport for all logs
    new winston.transports.File({
      filename: config.logging.file,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
    }),
    
    // File transport for error logs only
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: config.logging.level,
  levels,
  transports,
  exitOnError: false,
});

// Create a stream object with a 'write' function for Morgan
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Export logger
export { logger };
export default logger;
