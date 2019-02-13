'use strict'

let config = {}

config.providers = [
  'apps', 'database', 'logger', 'slack', 'freak'
]

config.logger = [
  {level: 'debug', stream: process.stdout}
]

config.slack = {
  webHook: '',
  options: {
    botUsername: 'ReviewMe',
    botIcon: null,
    botEmoji: null,
    channel: 'rate-us-feedbacks-qa'
  }
}

config.interval = 60 * 60 * 1000 //Every hour

config.publishFirstRun = false

config.apps = {
  ios: {
    active: false,
    appId: '1022477161',
    options: {
      regions: ['us'],
      limit: 50
    },
    appName: 'Playster IOS'
  },
  android: {
    active: false,
    appId: 'com.playster.premium',
    options: {
      publisherKey: __dirname + '/publisher.json',
      limit: 50
    },
    appName: 'Playster Android'
  },
}

config.mysql = {
  host: '127.0.0.1',
  user: 'root',
  password: 'secret',
  database: 'jomedia',
  charset: 'utf8_general_ci'
}

config.freak = {
  active: false,
  host: 'freak.playster.systems',
  port: 443,
  email: '',
  env: 'dev'
}

module.exports = config
