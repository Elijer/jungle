import fs from 'fs';
import path from 'path';
import { dirname } from './utilities.js';

class Logger {
  constructor(logFilePath) {
    this.logFilePath = logFilePath;
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;

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