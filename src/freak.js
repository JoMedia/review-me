'use strict'

const os = require('os')

class Freak {
  constructor (http, config) {
    this.http = http
    this.config = config
  }

  /**
   * Notify crontol freak.
   * @param namespace
   * @param frequency
   */
  notify (namespace, frequency) {
    if (!this.config.active) {
      return false
    }

    const body = JSON.stringify({
      frequency,
      threshold: 2,
      alert: [
        {type: 'email', data: {email: this.config.email}}
      ],
      info: {
        'hostname': os.hostname(),
        'user': process.env.USER,
        'command': process.argv.join(' ')
      }
    })

    this.http.request({
      host: this.config.host,
      port: this.config.port,
      method: 'POST',
      path: `/report/review-me.${this.config.env}.${namespace}`,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }).end(body)
  }
}

module.exports = Freak
