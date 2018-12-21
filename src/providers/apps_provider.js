'use strict'

const Provider = require('./provider')
const google = require('googleapis')

let registerIOSApp = function () {
  this.container.bind('apps.ios', () => {
    const IOS = require('../apps/ios')
    const request = require('request')
    const config = this.container.make('config').apps.ios
    const logger = this.container.make('logger')

    return new IOS(config.appName, config.appId, config.options, request, logger)
  })
}


let registerGoogleJwt = function () {
  this.container.bind('google.jwt', () => {
    const config = this.container.make('config').apps.android
    const scopes = ['https://www.googleapis.com/auth/androidpublisher']
    const publisherJson = JSON.parse(require('fs').readFileSync(config.options.publisherKey, 'utf8'))

    return new google.auth.JWT(publisherJson.client_id, null, publisherJson.private_key, scopes, null)
  })
}

let registerAndroidApp = function () {
  registerGoogleJwt.call(this)

  this.container.bind('apps.android', () => {
    const Android = require('../apps/android')

    const config = this.container.make('config').apps.android
    const logger = this.container.make('logger')

    const googleReviews = google.androidpublisher('v2').reviews
    const jwt = this.container.make('google.jwt')
    if (jwt === null) {
      return null
    }

    return new Android(config.appName, config.appId, jwt, googleReviews, config.options, logger)
  })
}


class AppsProvider extends Provider {
  register () {
    registerIOSApp.call(this)
    registerAndroidApp.call(this)
  }
}

module.exports = AppsProvider
