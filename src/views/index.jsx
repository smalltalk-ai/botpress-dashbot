import React from 'react'

import {
  Panel,
  Grid,
  Row,
  Col,
  ControlLabel,
  FormGroup,
  FormControl,
  Alert,
  Button
} from 'react-bootstrap'

import style from './style.scss'

export default class DashbotModule extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      message: null,
      initialStateHash: null
    }

    this.renderFacebookApiKey = this.renderFacebookApiKey.bind(this)
    this.renderSlackApiKey = this.renderSlackApiKey.bind(this)

    this.handleFacebookApiKeyChange = this.handleFacebookApiKeyChange.bind(this)
    this.handleSlackApiKeyChange = this.handleSlackApiKeyChange.bind(this)
    this.handleSaveChanges = this.handleSaveChanges.bind(this)
  }

  getAxios() {
    return this.props.bp.axios
  }

  getStateHash() {
    return this.state.facebookApiKey + ' ' + this.state.slackApiKey
  }

  componentDidMount() {
    this.getAxios().get('/api/botpress-dashbot/config')
    .then((res) => {
      this.setState({
        loading: false,
        ...res.data
      })

      setImmediate(() => {
        this.setState({
          initialStateHash: this.getStateHash()
        })
      })
    })
  }

  handleFacebookApiKeyChange(event) {
    this.setState({
      facebookApiKey: event.target.value
    })
  }

  handleSlackApiKeyChange(event) {
    this.setState({
      slackApiKey: event.target.value
    })
  }

  handleSaveChanges() {
    this.setState({ loading:true })

    return this.getAxios().post('/api/botpress-dashbot/config', {
      facebookApiKey: this.state.facebookApiKey,
      slackApiKey: this.state.slackApiKey
    })
    .then(() => {
      this.setState({
        loading: false,
        initialStateHash: this.getStateHash()
      })
    })
    .catch((err) => {
      this.setState({
        message: {
          type: 'danger',
          text: 'An error occured during you were trying to save configuration: ' + err.response.data.message
        },
        loading: false,
        initialStateHash: this.getStateHash()
      })
    })
  }

  renderFacebookApiKey() {
    return (
      <Row>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            Facebook API Key
          </Col>
          <Col sm={8}>
            <FormControl type="text" value={this.state.facebookApiKey} onChange={this.handleFacebookApiKeyChange}/>
          </Col>
        </FormGroup>
      </Row>
    )
  }

  renderSlackApiKey() {
    return (
      <Row>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            Slack API Key
          </Col>
          <Col sm={8}>
            <FormControl type="text" value={this.state.slackApiKey} onChange={this.handleSlackApiKeyChange}/>
          </Col>
        </FormGroup>
      </Row>
    )
  }

  renderMessageAlert() {
    return this.state.message
      ? <Alert bsStyle={this.state.message.type}>{this.state.message.text}</Alert>
      : null
  }

  renderSaveButton() {
  console.log('render save')
    const opacityStyle = (this.state.initialStateHash && this.state.initialStateHash !== this.getStateHash())
      ? {opacity:1}
      : {opacity:0}

    return <Button style={opacityStyle} bsStyle="success" onClick={this.handleSaveChanges}>Save</Button>
  }

  render() {
    if (this.state.loading) {
      return <h4>Module is loading...</h4>
    }

    return (
      <Grid>
        <Row>
          <Col md={8} mdOffset={2}>
            {this.renderMessageAlert()}
            <Panel header="Settings">
              {this.renderSaveButton()}
              <div>
                {this.renderFacebookApiKey()}
                {this.renderSlackApiKey()}
              </div>
            </Panel>
          </Col>
        </Row>
      </Grid>
    )
  }
}
