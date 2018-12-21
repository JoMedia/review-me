'use strict'

class DatabaseManager {
  constructor (connection) {
    this.connection = connection
  }

  query(sql, bindings = []) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, bindings, function (error, results) {
        if (error) {
          return reject(error)
        }
        return resolve(results)
      })
    })
  }
}

module.exports = DatabaseManager