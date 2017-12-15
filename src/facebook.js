import dashbotModule from 'dashbot'

class Facebook {
  constructor(bp, config) {
    this.config = config || null
    this.dashbot = null
    this.enabled = false
    this.logger = bp.logger

    this.connect(bp)
  }

  setConfig(bp, config) {
    this.config = config || null
    this.connect(bp)
  }

  connect(bp) {
    let apiKey = this.config && this.config.apiKey
    let messenger = bp._loadedModules['botpress-messenger']
    this.enabled = !!apiKey && !!messenger

    if (!this.enabled) {
      if (!messenger) {
        bp.logger.warn('Unable to enable Dashbot for Facebook because Messenger module is not loaded')
      }
      if (!apiKey) {
        bp.logger.warn('Unable to enable Dashbot for Facebook because Dashbot Api Key is not saved')
      }
    }

    this.dashbot = this.enabled ? dashbotModule(this.config.apiKey).facebook : null
    this.configEvents(bp)
  }

  configEvents(bp) {
    //bp.events.on('messenger.*', function (data) {
      //this.logger.debug('event.on *', this.event, data);
    //});
    bp.events.on('messenger.raw_webhook_body', (data) => {
      this.logIncoming.call(this, data)
    });
    bp.events.on('messenger.raw_send_request', (data) => {
      this.logOutgoing.call(this, data)
    });
  }

  logIncoming(data) {
    if (this.enabled) {
      this.logger.debug('facebook - incoming', JSON.stringify(data, null, 2))
      //this.dashbot.logIncoming(data)
    }
  }

  logOutgoing(data) {
    if (this.enabled) {
      this.logger.debug('facebook - outgoing', JSON.stringify(data, null, 2))
      //this.dashbot.logOutgoing(this.getBot(event), this.getTeam(event), reply)
    }
  }
}

module.exports = Facebook
