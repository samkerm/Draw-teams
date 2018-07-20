/* @flow */

import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  AppRegistry,
} from 'react-native';
import Button from '../global/button';
import CreateGroup from './create-group';
import JoinGroup from './join-group';
import firebase from 'firebase';
import { Fetch } from '../../services/network';

let app;

export default class Groups extends Component {

  static navigationOptions = () => {
    return {
      title: 'Join a group',
    headerLeft: (
      <TouchableOpacity
        onPress={() => { app.alet('You need a group', 'Its mandatory to be part of a group.')}}>
        <Image style={styles.backButtonIcon} source={require('../../images/icons/back-button.png')} /> 
      </TouchableOpacity>
    ),
    gesturesEnabled: false,
    };
  };

  constructor() {
    super();
    const user = firebase.auth().currentUser;
    this.state = {
      userId: user.uid,
      creatingGroup: null,
      groupName: '',
      groupGameType: '',
      foundGroups: [],
    };
  }

  componentWillMount() {
    app = this;
  }

  alet(title, message) {
    Alert.alert(
      title,
      message,
      [
        {text: 'Join', style: 'cancel'},
      ],
      { cancelable: false }
    )
  }

  initiateCreatingGroup()
  {
    app.setState({ creatingGroup: true });
  }

  initiateJoiningGroup()
  {
    app.setState({ creatingGroup: false });
  }

  toggleGroup()
  {
    app.setState({ creatingGroup: !app.state.creatingGroup });
  }

  showFirebaseAlert(title, message) {
    Alert.alert(
      title,
      message,
      [
        {text: 'Ok', style: 'cancel'},
      ],
      { cancelable: false }
    )
  }

  async createGroup()
  {
    console.log(app.state.groupName, app.state.groupGameType);
    // Make sure the display name is filled but its not important if the ratings are not filled
    if (app.state.groupName !== '' && app.state.groupGameType !== '')
    {
      const groupData = {
        name: app.state.groupName,
        gameType: app.state.groupGameType,
        regulars: [app.state.userId],
      };

      try
      {
        const callBack = await Fetch('POST', '/groups/create', groupData);
        console.log(callBack);
        app.showFirebaseAlert('Group creation succeeded!');
        app.props.navigation.state.params.onNavigateBack();
        app.props.navigation.goBack();
      }
      catch (error)
      {
        app.showFirebaseAlert('Group creation failed', error.message);
        console.error(error);
      }
    }
    else
    {
      app.showFirebaseAlert('Incomplete!', 'Make sure you at least have filled up the group name and game type.');
    }
  }

  async searchGroupNames(string)
  {
    if (string === '')
    {
      app.setState({ foundGroups: []});
    }
    else
    {
      try
      {
        const groups = await Fetch('GET', `/groups/search?string=${string}`);
        app.setState({ foundGroups: groups});
      }
      catch (e)
      {
        console.error(e);
      }
    }
  }

  async joinGroup(groupId)
  {
    try
    {
      console.log('Trying to join');
      const res = await Fetch('POST', `/groups/${groupId}/join`);
      console.log(res);
      app.props.navigation.state.params.onNavigateBack();
      app.props.navigation.goBack();
    }
    catch (error)
    {
      if (error.response && error.response.status === 500)
      {
        console.log(error);
      }
      else if (error.response && error.response.data && error.response.status === 403)
      {
        app.showFirebaseAlert('Can\'t join group', error.response.data)
      }
      else
      {
        app.showFirebaseAlert('Can\'t join group', 'Failed to join this group')
      }
    }
  }

  renderCurrentState() {
    if (this.state.creatingGroup === null )
    {
      return (
        <View>
          <View style={styles.button}>
            <Button onPress={this.initiateCreatingGroup}>Create a group</Button>
          </View>
          <View style={styles.button}>
            <Button onPress={this.initiateJoiningGroup}>Join a group</Button>
          </View>
        </View>
      );
    }
    else if (this.state.creatingGroup === false )
    {
      return (
        <JoinGroup
          onChangeText={name => app.searchGroupNames(name)}
          results={app.state.foundGroups}
          selectedGroup={groupId => app.joinGroup(groupId)}
          toggleGroup={app.toggleGroup}
          navigation={this.props.navigation}
          >
        </JoinGroup>
      );
    }
    else if (this.state.creatingGroup === true)
    {
      return (
        <CreateGroup
          onChangeText={name => app.setState({ groupName: name.trim() })}
          onChangeDropdown={type => app.setState({ groupGameType: type })}
          onCreationRequest={this.createGroup}
          toggleGroup={app.toggleGroup}
          >
        </CreateGroup>
      );
    }
  }

  render() {
    return (
      <View style={styles.container}>
        { this.renderCurrentState() }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    marginRight: 10,
    marginLeft: 10,
  },
  backButtonIcon: {
    width: 25,
    height: 25,
    left: 10,
    borderRadius: 12.5,
  }
});
AppRegistry.registerComponent('Groups', () => MyApp);