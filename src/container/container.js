'use strict'

const BindingResolutionError = require('./binding_resolution_error')

class Container {
  constructor () {
    this.abstracts = {}
    this.resolved = {}
  }

  /**
   * Bind an object resolution in the container
   * @param abstract
   * @param resolver
   */
  bind (abstract, resolver) {
    this.abstracts[abstract] = resolver
  }

  /**
   * Resolves an object out of the container.
   * @param abstract
   * @returns {*}
   */
  make (abstract) {
    if (typeof this.abstracts[abstract] === 'undefined') {
      throw new BindingResolutionError(`Target [${abstract}] is not instantiable`)
    }

    if (typeof this.resolved[abstract] !== 'undefined') {
      return this.resolved[abstract]
    }

    let concrete = this.abstracts[abstract].call()
    this.resolved[abstract] = concrete

    return concrete
  }

  /**
   * Check if an object was bound in the container
   * @param key
   * @returns {boolean}
   */
  bound (key) {
    return typeof this.abstracts[key] !== 'undefined'
  }
}

module.exports = Container
