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
import Avatar from './app/components/avatar/avatar';
import Teams from './app/components/teams/teams';

const App = StackNavigator({
  Login: { screen: Login },
  Profile: { screen: Profile },
  Avatar: { screen: Avatar },
  Teams: { screen: Teams },
  Home: { screen: Home }
});

export default class MyApp extends Component<{}> {
  componentWillMount() {
    // Initialize Firebase
    const firebaseConfig = {
      apiKey: "AIzaSyApyr_GVy-5rC4s0laqcPb-SKdAtU70FBU",
      authDomain: "draw-teams.firebaseapp.com",
      databaseURL: "https://draw-teams.firebaseio.com",
      projectId: "draw-teams",
      storageBucket: "draw-teams.appspot.com",
      messagingSenderId: "853780675945"
    };
    const firebaseApp = firebase.initializeApp(firebaseConfig);
  }
  render() {
    return (
      <App/>
    );
  }
};

AppRegistry.registerComponent('MyApp', () => MyApp);
// AppRegistry.registerComponent('App', () => MyApp);
