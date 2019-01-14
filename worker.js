'use strict'

const async = require('async')
const moment = require('moment')

let startApp = function (app) {
  const interval = this.container.make('config').interval
  const ignoreFirstRun = !this.container.make('config').publishFirstRun

  return new Promise((resolve, reject) => {
    executeAppTask.call(this, app, ignoreFirstRun)
      .then(() => resolve())
      .then(err => reject(err))

    setInterval(() => {
      this.container.make('logger').info(`Fetching reviews from ${app.shortName()}...`)
      executeAppTask.call(this, app, ignoreFirstRun)
        .then(totalReviewsProcessed => {
          this.container.make('logger').info(`Processed ${totalReviewsProcessed} reviews from ${app.shortName()}.`)
        })
        .catch(err => {
          this.container.make('logger').error(`Error processing reviews from ${app.shortName()}:`)
          this.container.make('logger').error(err)
        })
    }, interval)
  })
}

let executeAppTask = function (app, ignoreFirstRun) {
  return new Promise((resolve, reject) => {
    app.fetchRecentReviews()
      .then(reviews => {
        return filterUnpublishedReviews(app, reviews, this.container.make('database'))
      })
      .then(reviews => {
        if (ignoreFirstRun && this.isFirstRun(app.shortName())) {
          return Promise.resolve(reviews)
        }

        return publishReviews(reviews, this.container.make('slack'))
      })
      .then(reviews => {
        return markReviewsAsPublished(app, reviews, this.container.make('database'))
      })
      .then(totalReviewsProcessed => {
        this.markAppAsRan(app.shortName())
        resolve(totalReviewsProcessed)
      })
      .catch(err => {
        reject(err)
      })
  })
}

let filterUnpublishedReviews = function (app, reviews, database) {
  return new Promise((resolve, reject) => {
    let bindings = []
    const values = reviews
      .map(review => {
        bindings.push(review.id)
        return `?`
      })
      .join(',')

      bindings.push(app.shortName())

      const sql = `SELECT review_id, UNIX_TIMESTAMP(created_at) as created_at FROM app_reviews WHERE review_id IN (${values}) AND app = ?`

      database.query(sql, bindings)
        .then(results => {
          let alreadyPublished = {}

          results.forEach(record => {
            alreadyPublished[record['review_id']] = record['created_at']
          })

          const newReviews = reviews.filter(review => {
            if (typeof alreadyPublished[review.id] === 'undefined') {
              return true
            }
            if (typeof review.lastModified !== 'undefined') {
              return review.lastModified - parseInt(alreadyPublished[review.id]) >= 7200
            }
            return false
          })

          resolve(newReviews)
        })
        .catch(err => {
          reject(err)
        })
  })
}

let publishReviews = function (reviews, slack) {
  return new Promise((resolve, reject) => {
    let tasks = reviews.map(review => {
      return callback => {
        publishSingleReview(review, slack)
          .then(() => {
            callback()
          })
          .catch(err => {
            callback(err)
          })
      }
    })

    async.series(tasks, err => {
      if (err) {
        return reject(err)
      }
      resolve(reviews)
    })
  })
}

let publishSingleReview = function (review, slack) {
  return new Promise((resolve, reject) => {
    slack.notifyReview(review).then(() => resolve()).catch(err => reject(err))
  })
}

let markReviewsAsPublished = function (app, reviews, database) {
  return new Promise((resolve, reject) => {
    if (reviews.length === 0) {
      return resolve(reviews.length)
    }
    const defaultCreatedAt = moment().format('YYYY-MM-DD HH:mm:ss')

    let bindings = []
    const values = reviews
      .map(review => {
        let createdAt = defaultCreatedAt
        if (typeof review.lastModified !== 'undefined') {
          createdAt = moment.unix(review.lastModified).format('YYYY-MM-DD HH:mm:ss')
        }
        bindings.push(review.id, app.shortName(), review.version, review.title, review.text, review.rating, review.author, createdAt)
        return `(?, ?, ?, ?, ?, ?, ?, ?)`
      })
      .join(',')
    const sql = `
      INSERT INTO app_reviews (review_id, app, version, title, content, rating, author, created_at) 
      VALUES ${values} 
      ON DUPLICATE KEY UPDATE version = VALUES(version), title = VALUES(title), content = VALUES(content), rating = VALUES(rating), created_at = VALUES(created_at)`

    database.query(sql, bindings)
      .then(() => resolve(reviews.length))
      .catch(err => reject(err))
  })
}

class Worker {
  constructor (apps, container) {
    this.apps = apps
    this.container = container
    this.appExecutedOnce = {}
  }

  start () {
    this.apps.forEach(app => {
      startApp.call(this, app)
        .then(() => {
          this.container.make('logger').info(`Worker for ${app.name()} started...`)
        })
        .catch(err => {
          this.container.make('logger').error(`Error starting worker for ${app.name()}`)
          this.container.make('logger').error(err)
        })
    })
  }

  isFirstRun (appName) {
    return typeof this.appExecutedOnce[appName] === 'undefined'
  }

  markAppAsRan (appName) {
    return this.appExecutedOnce[appName] = true
  }
}

module.exports = Worker