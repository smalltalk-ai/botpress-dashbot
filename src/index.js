import checkVersion from 'botpress-version-manager'
import dashbotModule from 'dashbot'
import path from 'path'
import fs from 'fs'

import axios from 'axios'

let config = null
let dashbot = {
  facebook: null,
  slack: null
}

const incomingMiddleware = (event, next) => {
  switch (event.platform) {
    case 'facebook':
      let raw = event.raw
      //event.bp.logger.debug('facebook raw', raw)
      next()
      break
    case 'slack':
      if (!!dashbot.slack) {
        if (event.type === 'presence_change') {
          dashbot.slack.logConnect(event.raw)
        } else {
          let data = event.bp.slack && event.bp.slack.getData() || {}
          const bot = {
            id: data.self.id,
            name: data.self.name
          }
          const team = {
            id: data.team.id,
            name: data.team.name
          }
          dashbot.slack.logIncoming(bot, team, event.raw)
          event.bp.logger.debug('slack - incoming', typeof event.raw, JSON.stringify(event.raw, null, 2))
        }
      }
      next()
      break
    default:
      next()
  }
}

const outgoingMiddleware = (event, next) => {
  switch (event.platform) {
    case 'facebook':
      let raw = event.raw
      // event.bp.logger.debug('facebook raw', raw)
      next()
      break
    case 'slack':
      if (!!dashbot.slack) {
        let data = event.bp.slack && event.bp.slack.getData() || {}
        const bot = {
          id: data.self.id,
          name: data.self.name
        }
        const team = {
          id: data.team.id,
          name: data.team.name
        }
        const reply = {
          type: 'message',
          text: event.text,
          channel: event.raw.channelId
        }
        dashbot.slack.logOutgoing(bot, team, reply)
        //event.bp.logger.debug('slack - outgoing', bot, team, reply)
      }
      next()
      break
    default:
      next()
  }
}

const saveSettings = () => {
  if (!!config.facebookApiKey) {
    dashbot.slack = dashbotModule(config.facebookApiKey).facebook
  }
  if (!!config.slackApiKey) {
    dashbot.slack = dashbotModule(config.slackApiKey).slack
  }
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
