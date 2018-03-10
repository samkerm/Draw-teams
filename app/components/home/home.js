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
import axios from 'axios';

let app;
let http;

const App = StackNavigator({
  Groups: { screen: Groups },
});

export default class Home extends Component {
  static navigationOptions = {
    title: 'need to join a group',
    headerLeft: null,
    gesturesEnabled: false,
  };

  constructor() {
    super();
    const user = firebase.auth().currentUser;
    this.state = {
      userId: user.uid
    };

    http = axios.create();
  }

  async componentWillMount() {
    app = this;
    try {
      const {data} = await http.get(`/getUserInfo?userId=${app.state.userId}`);
      console.log(data);
      const displayName = data.displayName || '';
      const groupId = data.groupId || '';
      app.setState({
        displayName,
        groupId
      })
      if (groupId === '')
      {
        app.props.navigation.navigate('Groups');
      }
      else
      {
        const {data: {name}} = await http.get(`/groups?groupId=${groupId}`);
        console.log(name);
        app.props.navigation.state.params.title = name;
      }
    }
    catch (error)
    {
      console.log(error);
    }

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
