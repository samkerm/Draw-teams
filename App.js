import React, { Component } from 'react';
import {
  AppRegistry,
} from 'react-native';
import { StackNavigator } from 'react-navigation';
import firebase from 'firebase';
import Home from './app/components/home/home';
import Login from './app/components/login/login';
import Profile from './app/components/profile/profile';
import Avatar from './app/components/avatar/avatar';
import Groups from './app/components/groups/groups';

const App = StackNavigator({
  Login: { screen: Login },
  Profile: { screen: Profile },
  Avatar: { screen: Avatar },
  Groups: { screen: Groups },
  Home: { screen: Home },
});

export default class MyApp extends Component {
  componentWillMount() {
    // Initialize Firebase
    const firebaseConfig = {
      apiKey: 'AIzaSyApyr_GVy-5rC4s0laqcPb-SKdAtU70FBU',
      authDomain: 'draw-groups.firebaseapp.com',
      databaseURL: 'https://draw-teams.firebaseio.com',
      projectId: 'draw-teams',
      storageBucket: 'draw-teams.appspot.com',
      messagingSenderId: '853780675945',
    };
    firebase.initializeApp(firebaseConfig);
  }
  render() {
    return <App />;
  }
}

AppRegistry.registerComponent('MyApp', () => MyApp);
