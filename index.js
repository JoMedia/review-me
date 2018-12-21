'use strict'

const container = require('./bootstrap/bootstrap')
const Worker = require('./worker')

const config = container.make('config')

const apps = Object.keys(config.apps)
  .filter(appName => {
    return config.apps[appName].active
  })
  .map(appName => {
    try {
      return container.make(`apps.${appName}`)
    } catch (e) {
      container.make('logger').warn(`The app "${appName}" is not valid.`)
      return null
    }
  })
  .filter(app => {
    return app !== null
  })

const worker = new Worker(apps, container)

worker.start()

