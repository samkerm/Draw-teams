/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { HeaderBackButton } from 'react-navigation';

let app;

export default class Teams extends Component {
  static navigationOptions = {
    title: 'Join a team',
    headerLeft: <HeaderBackButton onPress={() => { app.alet('You need a team', 'Its mandatory to be part of a team.') }} />,
    gesturesEnabled: false,
  };

  componentWillMount() {
    app = this;
  }

  alet(title, message) {
    Alert.alert(
      title,
      message,
      [
        {text: 'Join', style: 'cancel'},
      ],
      { cancelable: false }
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Im the MyComponent component</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
