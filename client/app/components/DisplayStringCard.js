import { default as React } from 'react';
import { render } from 'react-dom';
import { WebsocketStore, WebsocketActions } from 'react-websocket-flux';
import { DisplayCard as DisplayStringCard } from '@mtk/mcs-components/lib/datachannels/string';

export default class MyComponent extends React.Component {
  constructor(props, context) {
    super(props, context);

    // 初始化 this.state
    this.state = {
      temperature: -1,
    };

    // WebSocket 的 'onMessage' callback
    this.onMessage = this.onMessage.bind(this);

    // 連線到 WebSocket Server
    WebsocketActions.connect(this.props.server);
  }

  componentDidMount() {
    // 將 'onMessage' 註冊到 Flux 的 Store
    WebsocketStore.addMessageListener(this.onMessage);
  }

  componentWillUnmount() {
    // 將 'onMessage' 從 Flux 的 Store 解除註冊
    WebsocketStore.removeMessageListener(this.onMessage);
  }

  onMessage(data) {
    // Deserialize
    this.setState({
      temperature: data.temperature,
    });
    console.log(data)
  }

  render() {
    return (
      <div>
        <DisplayStringCard
          values={{ value: this.state.temperature }}
          deviceId={this.props.deviceId}
          name={this.props.name}
          dataChnId={this.props.dataChnId}
          description={this.props.description}
          recordedAt={this.props.recordedAt}
          numberOfCards={this.props.numberOfCards}
          configs={this.props.configs}
        />
      </div>
    );
  }
}
