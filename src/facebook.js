import dashbotModule from 'dashbot'

class Facebook {
  constructor(config) {
    this.config = config || null
    this.dashbot = null
    this.connect()
  }

  setConfig(config) {
    this.config = config || null
    this.connect()
  }

  connect() {
    if (!!this.config && !!this.config.apiKey) {
      this.dashbot = dashbotModule(this.config.apiKey).facebook
    } else {
      this.dashbot = null
    }
  }

  logIncoming(event) {
    if (!!this.dashbot && !!event.raw && !!event.raw.message) {
      let data = {
        object: 'page',
        entry: [{
          //id: '',
          time: (new Date()).getTime(),
          messaging: [ event.raw ]
        }]
      }
      this.dashbot.logIncoming(data)
      //event.bp.logger.debug('facebook - incoming', JSON.stringify(data, null, 2))
    }
  }

  logOutgoing(event) {
    if (!!this.dashbot) {
      const reply = {
        type: 'message',
        text: event.text,
        channel: event.raw.channelId
      }
      //this.dashbot.logOutgoing(this.getBot(event), this.getTeam(event), reply)
      //event.bp.logger.debug('slack - outgoing', this.getBot(event), this.getTeam(event), this.getTeam(event), reply)
    }
  }

  getBot(event) {
    let data = event.bp.slack && event.bp.slack.getData() || {}
    return {
      id: data.self.id,
      name: data.self.name
    }
  }

  getTeam(event) {
    let data = event.bp.slack && event.bp.slack.getData() || {}
    return {
      id: data.team.id,
      name: data.team.name
    }
  }
}

module.exports = Facebook
