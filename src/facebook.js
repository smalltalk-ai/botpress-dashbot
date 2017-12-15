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

  filterIncoming(data) {
    let requestBody = null

    let entries = []
    data.entry.forEach((entry) => {
      let messages = entry.messaging.filter((message) => !!message.message)
      if (messages.length) {
        entry.messaging = messages
        entries[entries.length] = entry
      }
    })
    if (entries.length) {
      requestBody = {
        object: data.object,
        entry: entries
      }
    }
    return requestBody;
  }

  logIncoming(data) {
    // only send to Dashbot if Facebook is enabled and the incoming has messages
    if (this.enabled) {
      let filteredData = this.filterIncoming(data)
      if (!!filteredData) {
        this.dashbot.logIncoming(data)
      }
    }
  }

  logOutgoing(data) {
    // only send to Dashbot if Facebook is enabled and the outgoing is a message
    if (this.enabled && data.endpoint === 'messages') {
      let requestData = {
        url: data.url,
        qs: { access_token: data.token },
        json: data.body
      }
      this.dashbot.logOutgoing(requestData, data.response)
    }
  }
}

module.exports = Facebook
