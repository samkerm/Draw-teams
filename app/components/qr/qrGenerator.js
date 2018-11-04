import React, { Component } from 'react';
import {
  AppRegistry
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default class QrGenerator extends Component {

// Receives group id as prop, and generate code based on the group's id.
constructor(props) {
  super(props);
  const {params} = props.navigation.state;
  this.state = {
    groupId: params.groupId,
  };
}

componentDidMount() {
  console.log('D: ' + this.state.groupId)
}

render() {
  return (
    <QRCode
      value={ this.state.groupId }
      size={100}
    />
  );
};
}

AppRegistry.registerComponent('QrGenerator', () => MyApp);
