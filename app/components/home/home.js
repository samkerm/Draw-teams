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
import { StackNavigator } from 'react-navigation';
import Teams from '../teams/teams';

let app;

const App = StackNavigator({
  Teams: { screen: Teams },
});

export default class Home extends Component {
  static navigationOptions = {
    headerLeft: null,
    gesturesEnabled: false,
  };

  constructor() {
    super();
    const user = firebase.auth().currentUser;
    this.state = {
      userId: user.uid
    };
  }

  componentWillMount() {
    app = this;
    const userRef = firebase.database().ref('users/' + app.state.userId);
    userRef.once('value')
    .then(function(snapshot) {
      const displayName = snapshot.child('displayName').val() || '';
      const teamId = snapshot.child('team').val() || '';
      app.setState({
        displayName,
        teamId
      })
      if (teamId === '')
      {
        app.props.navigation.navigate('Teams');
      }
    });

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
