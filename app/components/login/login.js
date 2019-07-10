'use strict';
import React, { Component } from 'react';
import {
  StyleSheet,
  AppRegistry,
  Text,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Input from '../global/input';
import Button from '../global/button';
import firebase from 'react-native-firebase';
import { Fetch } from '../../services/network';
import { RegisterWithToken } from '../../services/network';

let app;

export default class Login extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor() {
    super();
    this.unsubscriber = null;
    this.state = {
      email: '',
      password: '',
      warning: '',
      authenticating: false,
    }
  }

  componentWillMount() {
    app = this;
    const { navigate } = app.props.navigation;
    app.setState({ authenticating: true });
    this.unsubscriber = firebase.auth().onAuthStateChanged(async (user) =>
    {
      if (user && app.state.authenticating)
      {
        app.setState({ authenticating: false});
        await RegisterWithToken();
        // Request users permissions to send push notifications.
        const enabled = await firebase.messaging().hasPermission();
        if (enabled) {
          // user has permissions
        } else {
          // user doesn't have permission
          try {
            await firebase.messaging().requestPermission();
            // User has authorised
          } catch (error) {
            // User has rejected permissions
          }
        }
        this.onTokenRefreshListener = firebase.messaging().onTokenRefresh( async fcmToken => {
          console.log('Received fcmToken from device: ', fcmToken);
          try {
            const response = await Fetch('POST', `/users/receivedNewDeviceToken`, fcmToken);
            console.log(response);
            if (response) {
              console.log('Successfully uploaded the token to firebase storage');
            }
          } catch (e) {
            console.log('Error');
            console.log(e)
          }
        });

        if (user.displayName && user.photoURL)
        {
          navigate('Home');
        }
        else if (!user.displayName)
        {
          navigate('Profile');
        }
        else if (!user.photoURL)
        {
          navigate('Avatar');
        }
      }
      app.setState({ authenticating: false});
    });
  }

  componentWillUnmount() {
    if (this.unsubscriber) {
      this.unsubscriber();
    }
  }

  onPressSignIn() {
    app.setState({ authenticating: true });
    firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).catch(function (error) {
      app.showAlert(error.code, error.message);
      app.setState({ authenticating: false });
      return;
    });
  }

  onPressSignUp() {
    app.setState({ authenticating: true });
    firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password).catch(function (error) {
      app.showAlert(error.code, error.message);
      app.setState({ authenticating: false });
    });
  }

  showAlert(title, message) {
    Alert.alert(
      title,
      message,
      [
        {text: 'OK', style: 'cancel'},
        {text: 'Create new account', onPress: () => app.onPressSignUp()},
      ],
      { cancelable: false }
    )
  }

  focusPasswordInput() {
    app.refs.PasswordInput.focus();
  }

  renderCurrentState() {
    if (this.state.authenticating) {
      return (
        <View style={styles.form}>
          <ActivityIndicator size='large'/>
        </View>
      );
    }

    return (
      <View style={ styles.form }>
        <Input
          placeholder={ 'Enter your email...' }
          label={ 'Email' }
          returnKeyType={'next'}
          keyboardType={'email-address'}
          onSubmitEditing={this.focusPasswordInput}
          onChangeText={ email => this.setState({ email: email.trim() })}
          value={ this.state.email }
        />
        <Input
          ref='PasswordInput'
          placeholder={ 'Enter your password...' }
          label={ 'Password' }
          returnKeyType={'send'}
          secureTextEntry
          onChangeText={ password => this.setState({ password: password.trim() })}
          value={ this.state.password }
          onSubmitEditing={ () => this.onPressSignIn() }
        />
        <Button onPress={ () => this.onPressSignIn() }>
          Login
        </Button>
        <Text>{ this.state.warning }</Text>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        { this.renderCurrentState() }
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5FCFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  form: {
    flex: 1
  }
});

AppRegistry.registerComponent('Login', () => MyApp);
