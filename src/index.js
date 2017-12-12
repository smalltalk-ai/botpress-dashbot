import checkVersion from 'botpress-version-manager'

import axios from 'axios'

let config = null

module.exports = {

  config: {
    facebookApiKey: { type: 'string', env: 'DASHBOT_FACEBOOK_API_KEY' },
    slackApiKey: { type: 'string', env: 'DASHBOT_SLACK_API_KEY' }
  },

  init: async function(bp, configurator) {
    checkVersion(bp, __dirname)

    config = await configurator.loadAll()
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

      res.sendStatus(200)
    })
  }
}
