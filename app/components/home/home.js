/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AppRegistry,
  BackHandler
} from 'react-native';
import firebase from 'firebase';
import { NavigationActions } from 'react-navigation';

export default class Home extends Component {
  static navigationOptions = {
    headerLeft: null,
    gesturesEnabled: false,
  };

  constructor(props) {
    super(props);
    var user = firebase.auth().currentUser;
    this.state = {
      user: user
    };
  }

  componentWillMount() {
    console.log(this.state.user);

    BackHandler.addEventListener('hardwareBackPress', function() {
      return true;
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', function() {
      return false;
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Welcome</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20
  },
});

AppRegistry.registerComponent('Home', () => MyApp);
