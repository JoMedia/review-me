'use strict'

const Container = require('../src/container/container')
const config = require('../src/config/config')

const container = new Container()

// Always bind the config before anything else.
container.bind('config', () => {
  return config
})

// Register all service providers
config.providers.forEach(name => {
  const ProviderClass = require(`../src/providers/${name}_provider`)
  const provider = new ProviderClass(container)
  provider.register()
})

module.exports = container