'use strict'

const http = require('http')
const https = require('https')
const Provider = require('./provider')

class FreakProvider extends Provider {
  register () {
    this.container.bind('freak', () => {
      const Freak = require('../freak')
      const freakConfig = this.container.make('config').freak
      const httpClient = freakConfig.port === 443 ? https : http
      return new Freak(httpClient, freakConfig)
    })
  }
}

module.exports = FreakProvider
