'use strict';
import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  AppRegistry,
  Text,
  View,
  ActivityIndicator,
  Alert
} from 'react-native';
import { StackNavigator } from 'react-navigation';
import Input from '../global/input';
import Button from '../global/button';
import firebase from 'firebase';
import axios from 'axios';
import notifications from '../../services/push-notifications';

let app;

export default class Login extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor() {
    super();

    this.state = {
      email: '',
      password: '',
      warning: '',
      authenticating: false
    }
  }

  componentWillMount() {
    app = this;
    const { navigate } = this.props.navigation;
    app.setState({ authenticating: true });
    firebase.auth().onAuthStateChanged(function(user)
    {
      if (user && app.state.authenticating)
      {
        // Set up axios globally
        firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken)
        {
          axios.defaults.baseURL = 'http://localhost:5000/draw-teams/us-central1/app';// https://us-central1-draw-teams.cloudfunctions.net/app // http://localhost:5000/draw-teams/us-central1/app
          axios.defaults.timeout = 30000;
          axios.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;
        }).catch(function(error)
        {
          console.error(error);
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
      app.setState({ authenticating: false });
    });
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

  onPressSignIn() {
    app.setState({ authenticating: true });
    firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).catch(function(error) {
      app.showAlert(error.code, error.message);
      app.setState({ authenticating: false });
      return;
    });
  }

  onPressSignUp() {
    app.setState({ authenticating: true });
    firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password).catch(function(error) {
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
