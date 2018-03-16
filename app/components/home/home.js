import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AppRegistry,
  TouchableOpacity,
  Image,
  BackHandler
} from 'react-native';
import firebase from 'firebase';
import { NavigationActions } from 'react-navigation';
import { StackNavigator } from 'react-navigation';
import Groups from '../groups/groups';
import axios from 'axios';
import _ from 'lodash';

let app;
let http;

const App = StackNavigator({
  Groups: { screen: Groups },
});

export default class Home extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;

    return {
      title: params ? params.otherParam : 'need to join a group',
      headerLeft: null,
      headerRight: (
        <TouchableOpacity>
          <Image source={require('../../images/icons/profile-edit.png')}
                 style={styles.editProfileIcon}
          />
        </TouchableOpacity>
      ),
      gesturesEnabled: false,
    }
  };

  constructor() {
    super();
    const user = firebase.auth().currentUser;
    this.state = {
      userId: user.uid,
      group: {},
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
        const {data} = await http.get(`/groups/${groupId}`);
        app.setState({group: data});
        app.props.navigation.setParams({otherParam: data.name})
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
  editProfileIcon: {
    width: 20,
    height: 20,
    right: 10,
  }
});

AppRegistry.registerComponent('Home', () => MyApp);
