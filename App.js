'use strict';
import React, { Component } from 'react';
import {
  AppRegistry,
  View
} from 'react-native';
import { StackNavigator } from 'react-navigation';
import firebase from 'firebase';
import Home from './app/components/home/home';
import Login from './app/components/login/login';
import Profile from './app/components/profile/profile';

const App = StackNavigator({
  Login: { screen: Login },
  Profile: { screen: Profile },
  Home: { screen: Home }
});

export default class MyApp extends Component<{}> {
  render() {
    return (
      <App/>
    );
  }
};

AppRegistry.registerComponent('MyApp', () => MyApp);
// AppRegistry.registerComponent('App', () => MyApp);
