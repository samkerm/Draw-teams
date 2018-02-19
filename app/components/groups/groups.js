/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Spacer
} from 'react-native';
import { HeaderBackButton } from 'react-navigation';
import { Button } from '../global/button';
import CreateGroup from './create-group';
import JoinGroup from './join-group';
import firebase from 'firebase';
import axios from 'axios';

let app;
let http;

export default class Groups extends Component {
  static navigationOptions = {
    title: 'Join a group',
    headerLeft: <HeaderBackButton onPress={() => { app.alet('You need a group', 'Its mandatory to be part of a group.') }} />,
    gesturesEnabled: false,
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

    firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
      http = axios.create({
        baseURL: 'http://localhost:5000/draw-teams/us-central1/app',
        timeout: 6000,
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
    }).catch(function(error) {
      console.error(error);
    });
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
        members: [{regular: app.state.userId}],
      };

      try
      {
        const {data: callBack} = await http.post('/groups/create', groupData);
        console.log(callBack);
        app.showFirebaseAlert('Group creation succeeded!');
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

  initiateJoiningGroup()
  {
    app.setState({ creatingGroup: false });
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
        const {data: groups} = await http.get(`/groups/search?string=${string}`);
        console.log(groups);
        app.setState({ foundGroups: groups});
      }
      catch (e)
      {
        console.error(e);
      }
    }
  }

  joinGroup = (groupId) =>
  {
    const groupsRef = firebase.database().ref('groups/' + groupId + '/members');
    groupsRef.once('value').then((snapshot) =>
    {
      const data = snapshot.val();
      let members = [];
      for (const key in data) {
        members.push(data[key].regular);
      }
      const found = members.find(el => el === app.state.userId);
      if (!found)
      {
        data.push({regular: app.state.userId});
        groupsRef.update(data);
      }
      console.log(members, 'something');
    });
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
          selectedGroup={groupId => app.joinGroup(groupId)}>
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
  }
});
