'use strict'

let parsePlayStoreReview = function (review) {
  let comment = review.comments[0].userComment

  return {
    id: review.reviewId,
    version: comment.appVersionName ? comment.appVersionName + (comment.appVersionCode ? `(${comment.appVersionCode})` : '') : '',
    title: '',
    text: comment.text,
    rating: comment.starRating,
    author: review.authorName,
    appName: 'Playster Android',
    storeName: 'Google Play Store',
    region: null,
    lastModified: comment.lastModified.seconds
  }
}

let authenticate = function () {
  return new Promise((resolve, reject) => {
    this.jwt.authorize(err => {
      if (err) {
        return reject(err)
      }
      return resolve()
    })
  })
}

let fetchReviews = function (jwt, googleReviews, appId, limit, logger) {
  return new Promise((resolve, reject) => {
    const options = {
      auth: jwt,
      packageName: appId
    }
    googleReviews.list(options, (err, response) => {
      if (err) {
        return reject(err)
      }
      if (!response.reviews) {
        logger.info(`No reviews received from Play Store`);
        return resolve([])
      }

      let reviews = response.reviews
        .slice(0, limit)
        .map(review => {
          return parsePlayStoreReview(review)
        })

      return resolve(reviews)
    })
  })
}


class Android {
  constructor (appName, appId, jwt, googleReviews, options, logger) {
    this.appName = appName
    this.appId = appId
    this.jwt = jwt
    this.googleReviews = googleReviews
    this.options = options
    this.logger = logger
  }

  name () {
    return this.appName
  }

  shortName () {
    return 'android'
  }

  fetchRecentReviews () {
    return new Promise((resolve, reject) => {
      authenticate.call(this)
        .then(() => {
          return fetchReviews(this.jwt, this.googleReviews, this.appId, this.options.limit, this.logger)
        })
        .then(reviews => {
          resolve(reviews)
        })
        .catch(err => {
          reject(err)
        })
    })
  }
}

module.exports = Android