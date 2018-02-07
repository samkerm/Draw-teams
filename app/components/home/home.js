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
import Groups from '../groups/groups';

let app;

const App = StackNavigator({
  Groups: { screen: Groups },
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
      const groupId = snapshot.child('groupId').val() || '';
      app.setState({
        displayName,
        groupId
      })
      if (groupId === '')
      {
        app.props.navigation.navigate('Groups');
      }
      app.props.navigation.navigate('Groups');
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
