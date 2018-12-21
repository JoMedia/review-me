'use strict'

const Provider = require('./provider')

class LoggerProvider extends Provider {
  register () {
    this.container.bind('logger', () => {
      const Logger = require('../logger/logger')
      return new Logger(this.container.make('config').logger)
    })
    this.container.bind('logger.null', () => {
      const Logger = require('../logger/logger')
      return new Logger([])
    })
  }
}

module.exports = LoggerProvider
