'use strict'

const async = require('async')
const _ = require('lodash')

let isAppInformationEntry = function (entry) {
  // App information is available in an entry with some special fields
  return entry && entry['im:name'];
}

let parseAppStoreReview = function (entry, region) {
  return {
    id: entry.id.label,
    version: entry['im:version'].label,
    title: entry.title.label,
    text: entry.content.label,
    rating: entry['im:rating'].label,
    author: entry.author ? entry.author.name.label : '',
    appName: 'Playster IOS',
    storeName: 'Apple Store',
    region: region
  }
}

let fetchRegionReview = function (request, appId, region, limit, logger) {
  return new Promise((resolve, reject) => {
    const url = `https://itunes.apple.com/${region}/rss/customerreviews/id=${appId}/sortBy=mostRecent/json`

    request(url, (err, response, body) => {
      if (err) {
        logger.error(`Error fetching reviews from Apple Store (${region})`)
        return resolve([])
      }

      let rss
      try {
        rss = JSON.parse(body)
      } catch (e) {
        logger.error('Error parsing app store reviews')
        return resolve([])
      }

      let entries = rss.feed.entry

      if (entries === null || !entries.length > 0) {
        logger.info(`No reviews received from Apple Store (${region})`);
        return resolve([])
      }

      let reviews = entries
        .filter(review => {
          return !isAppInformationEntry(review)
        })
        .slice(0, limit)
        .map(review => {
          return parseAppStoreReview(review, region)
        })

      resolve(reviews)
    })
  })
}

class IOS {
  constructor (appName, appId, options, request, logger) {
    this.appName = appName
    this.appId = appId
    this.options = options
    this.request = request
    this.logger = logger
  }

  name () {
    return this.appName
  }

  shortName () {
    return 'ios'
  }

  fetchRecentReviews () {
    return new Promise((resolve, reject) => {
      let tasks = []

      this.options.regions.forEach(region => {
        tasks.push(callback => {
          fetchRegionReview(this.request, this.appId, region, this.options.limit, this.logger)
            .then(reviews => {
              callback(null, reviews)
            })
            .catch(callback)
        })
      })

      async.parallel(tasks, (err, results) => {
        if (err) {
          return reject(err)
        }
        resolve(_.flatten(results))
      })
    })
  }
}

module.exports = IOS