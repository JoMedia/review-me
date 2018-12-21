'use strict'

class BindingResolutionError extends Error {
  constructor (message) {
    super(message)
    this.name = 'BindingResolutionError'
  }
}

module.exports = BindingResolutionError
