'use strict'

const argv = require('minimist')(process.argv.slice(2))
const configDirectory = __dirname + '/../../conf'
const defaultLocalConfigPath = configDirectory + '/config-local.js'

let config = require(configDirectory + '/config.js')

if (argv.conf) {
  try {
    config = require(argv.conf)(config)
  } catch (e) {
    console.error(e.stack)
    process.exit()
  }
} else {
  try {
    config = require(defaultLocalConfigPath)(config)
  } catch (e) {
    console.warn('Unable to load the config from the default location ' + defaultLocalConfigPath + '\n')
  }
}

module.exports = config
