'use strict'

const Provider = require('./provider')

class SlackProvider extends Provider {
  register () {
    this.container.bind('slack', () => {
      const Slack = require('../slack/slack')
      const request = require('request')
      const config = this.container.make('config').slack

      return new Slack(request, config.webHook, config.options)
    })
  }
}

module.exports = SlackProvider
