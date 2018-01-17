/* @flow */

import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  AppRegistry,
  Alert,
  BackHandler
} from 'react-native';
import firebase from 'firebase';
import { StackNavigator, HeaderBackButton } from 'react-navigation';
import { Input } from '../global/input';
import { Button } from '../global/button';

let app = Object;

export default class Profile extends Component {

  static navigationOptions = {
    title: 'Setup Your Profile',
    headerLeft: <HeaderBackButton onPress={() => { app.showAlert('Logout', 'Are you sure you want to logout?') }} />,
  };

  state = {
    email: '',
    password: '',
    userId: ''
  }

  constructor(props) {
    super(props);
    var user = firebase.auth().currentUser;
    this.state = {
      user: user.uid
    };
  }

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

  goBack() {
    firebase.auth().signOut()
    .then(function() {
      app.props.navigation.goBack(null);
    }, function(error) {
      console.error(error);
    });
  }

  // Double check for back buttonn logout.
  showAlert(title, message) {
    Alert.alert(
      title,
      message,
      [
        {text: 'Stay', style: 'cancel'},
        {text: 'Go back', onPress: () => app.goBack()},
      ],
      { cancelable: false }
    )
  }

  registerUser() {
    firebase.database().ref('users/' + this.state.userId).set({
    username: name,
    email: email,
    profile_picture : imageUrl
  });
  }

  render() {
    return (
      <View style={ styles.title }>
        <Input
          placeholder={ 'Enter your display name...' }
          label={ 'Display Name' }
          onChangeText={ email => this.setState({ email })}
          value={ this.state.email }
        />
        <Input
          placeholder={ 'Enter your password...' }
          label={ 'Password' }
          secureTextEntry
          onChangeText={ password => this.setState({ password })}
          value={ this.state.password }
        />
        <Button onPress={ () => this.registerUser() }>
          Register
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    flex: 1,
    padding: 20

  },
});

AppRegistry.registerComponent('Profile', () => MyApp);
