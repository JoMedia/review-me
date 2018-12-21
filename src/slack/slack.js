'use strict'

class Slack {
  constructor (request, webHook, options = {}) {
    this.request = request
    this.webHook = webHook
    this.options = options
  }

  notifyReview (review) {
    return new Promise((resolve, reject) => {
      let color = review.rating >= 4 ? 'good' : (review.rating >= 2 ? 'warning' : 'danger')

      let stars = ''
      for (let i = 0; i < 5; i++) {
        stars += i < review.rating ? '★' : '☆';
      }

      let title = stars
      if (review.title) {
        title += ` - ${review.title}`
      }

      let footer = ''
      if (review.version) {
        footer += ` for v${review.version}`
      }
      footer += ` - ${review.appName}, ${review.storeName}`

      if (review.region) {
        footer += ` (${review.region})`
      }

      const message = {
        username: this.options.botUsername,
        icon_url: this.options.botIcon,
        icon_emoji: this.options.botEmoji,
        channel: this.options.channel,
        attachments: [
          {
            mrkdwn_in: ['text', 'pretext', 'title'],
            color: color,
            author_name: review.author,
            title: title,
            text: review.text + "\n",
            footer: footer
          }
        ]
      }

      const options = {
        url: this.webHook,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      }

      this.request.post(options, (err, response, body) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  }
}

module.exports = Slack