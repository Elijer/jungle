import fs from 'fs';
import path from 'path';
import { dirname } from './utilities.js';

class Logger {
  constructor(logFilePath) {
    this.logFilePath = logFilePath;
  }

  log(message, level = 'INFO') {
    const date = new Date()
    const timestamp = date.toISOString();
    const timestamp2 = date.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 2 });
    const logEntry = `[${timestamp2}] [${level}] ${message}`;

    console.log(logEntry);

    fs.appendFile(this.logFilePath, logEntry, (err) => {
      if (err) {
        console.error('Error writing to log file:', err);
      }
    });
  }

  info = (message) => this.l(message, 'INFO');
  warn = (message) => this.l(message, 'WARN');
  error = (message) => this.l(message, 'ERROR');

}

const logger = new Logger(path.join(dirname(), '../../app.log'));

export const log = logger.log.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);