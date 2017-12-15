import checkVersion from 'botpress-version-manager'
import path from 'path'
import fs from 'fs'

import axios from 'axios'
import Slack from './slack.js'

let config = null
let dashbot = {
  facebook: null,
  slack: new Slack(config)
}

const incomingMiddleware = (event, next) => {
  if (!!dashbot[event.platform]) {
    dashbot[event.platform].logIncoming(event)
  }
  next()
}

const outgoingMiddleware = (event, next) => {
  if (!!dashbot[event.platform]) {
    dashbot[event.platform].logOutgoing(event)
  }
  next()
}

const saveSettings = () => {
  dashbot.slack.setConfig({ apiKey: config && config.slackApiKey || null })
}

module.exports = {
  config: {
    facebookApiKey: { type: 'string', env: 'DASHBOT_FACEBOOK_API_KEY' },
    slackApiKey: { type: 'string', env: 'DASHBOT_SLACK_API_KEY' }
  },

  init: async function(bp, configurator) {
    checkVersion(bp, __dirname)

    bp.middlewares.register({
      name: 'dashbot.incoming',
      module: 'botpress-dashbot',
      type: 'incoming',
      handler: incomingMiddleware,
      order: 10,
      description: 'Send analytics data for incoming messages to Dashbot.'
    })

    bp.middlewares.register({
      name: 'dashbot.outgoing',
      module: 'botpress-dashbot',
      type: 'outgoing',
      handler: outgoingMiddleware,
      order: 10,
      description: 'Send analytics data for outgoing messages to Dashbot.'
    })

    config = await configurator.loadAll()
    saveSettings()
  },

  ready: async function(bp, configurator) {
    const router = bp.getRouter('botpress-dashbot')

    router.get('/config', async (req, res) => {
      res.send(await configurator.loadAll())
    })
    router.post('/config', async (req, res) => {
      const { facebookApiKey, slackApiKey } = req.body
      await configurator.saveAll({ facebookApiKey, slackApiKey })
      config = await configurator.loadAll()

      saveSettings()

      res.sendStatus(200)
    })
  }
}
