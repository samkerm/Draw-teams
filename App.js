import React, { Component } from 'react';
import {
  AppRegistry,
} from 'react-native';
import { StackNavigator } from 'react-navigation';
import firebase from './app/services/firebase';
import Home from './app/components/home/home';
import NextGame from './app/components/home/nextGame';
import Login from './app/components/login/login';
import Profile from './app/components/profile/profile';
import MemberProfile from './app/components/profile/memberProfile';
import Avatar from './app/components/avatar/avatar';
import Groups from './app/components/groups/groups';
import Settings from './app/components/settings/settings';

const App = StackNavigator({
  Login: { screen: Login },
  Profile: { screen: Profile },
  Avatar: { screen: Avatar },
  Groups: { screen: Groups },
  Home: { screen: Home },
  NextGame: { screen: NextGame },
  Settings: { screen: Settings },
  MemberProfile: {screen: MemberProfile},
});

// Link to Clubhouse


export default class MyApp extends Component {
  componentWillMount() {
  }
  render() {
    return <App />;
  }
}

AppRegistry.registerComponent('MyApp', () => MyApp);
