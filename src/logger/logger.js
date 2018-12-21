'use strict'

const bunyan = require('bunyan')

class Logger {
  constructor (config) {
    this.logger = bunyan.createLogger({
      name: 'logger',
      streams: config
    })
  }

  /**
   * Logs an 'info' message
   * @param message
   */
  info (message) {
    this.logger.info(message)
  }

  /**
   * Logs a 'debug' message
   * @param message
   */
  debug (message) {
    this.logger.debug(message)
  }

  /**
   * Logs a 'warning' message
   * @param message
   */
  warn (message) {
    this.logger.warn(message)
  }

  /**
   * Logs an 'error' message
   * @param message
   */
  error (message) {
    this.logger.error(message)
  }

  /**
   * Logs a 'fatal' message
   * @param message
   */
  fatal (message) {
    this.logger.fatal(message)
  }
}

module.exports = Logger
