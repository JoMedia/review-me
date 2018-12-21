'use strict'

const mysql = require('mysql')
const Provider = require('./provider')

class DatabaseProvider extends Provider {
  register () {
    this.container.bind('database', () => {
      const DatabaseManager = require('../database/mysql/manager')
      const mysqlConnection = mysql.createConnection(this.container.make('config').mysql)
      return new DatabaseManager(mysqlConnection)
    })
  }
}

module.exports = DatabaseProvider
