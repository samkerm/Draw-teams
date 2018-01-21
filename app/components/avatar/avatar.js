/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AppRegistry,
  BackHandler,
  Alert
} from 'react-native';
import { HeaderBackButton } from 'react-navigation';
import firebase from 'firebase';

export default class Avatar extends Component {
  static navigationOptions = {
    title: 'Select your avatar',
    headerLeft: <HeaderBackButton onPress={() => { app.showAlert('Logout', 'Are you sure you want to logout?') }} />,
    gesturesEnabled: false,
  };

  componentWillMount() {
    app = this;
    BackHandler.addEventListener('hardwareBackPress', function() {
      this.showAlert('Logout', 'Are you sure you want to logout?');
      return true;
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', function() {
      return false;
    });
  }

  logout() {
    firebase.auth().signOut()
    .then(function() {
      app.props.navigation.navigate('Login');
    }, function(error) {
      this.showAlert('Sign Out Error', error.message);
    });
  }

  showAlert(title, message) {
    Alert.alert(
      title,
      message,
      [
        {text: 'Stay', style: 'default'},
        {text: 'Logout', onPress: () => app.logout()},
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

AppRegistry.registerComponent('Avatar', () => MyApp);
