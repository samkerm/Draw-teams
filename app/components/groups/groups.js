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

let app;

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

  createGroup()
  {
    console.log(app.state.groupName, app.state.groupGameType);
    // Make sure the display name is filled but its not important if the ratings are not filled
    if (app.state.groupName !== '' && app.state.groupGameType !== '')
    {
      const groupData = {
        name: app.state.groupName,
        gameType: app.state.groupGameType,
        members: [
          { regular: app.state.userId }
        ],
      };

      const groupsRef = firebase.database().ref('groups/');
      const newGroupKey = groupsRef.push().key;

      // Write the new post's data simultaneously in the posts list and the user's post list.
      let updates = {};
      updates['/groups/' + newGroupKey] = groupData;
      updates['/users/' + app.state.userId + '/groupId'] = newGroupKey;

      firebase.database().ref().update(updates)
      .then(function() {
        app.showFirebaseAlert('Group creation succeeded!');
        app.props.navigation.goBack();
      })
      .catch(function(error) {
        app.showFirebaseAlert('Group creation failed', error.message);
      });
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

  searchGroupNames(string)
  {
    if (string === '')
    {
      app.setState({ foundGroups: []});
    }
    else
    {
      const groupsRef = firebase.database().ref('groups/');
      groupsRef.orderByChild('name')
               .startAt(string)
               .endAt(string + '\uf8ff')
               .on('value', (dataSnapshot) =>
       {
         const data = dataSnapshot.val();
         let groups = [];
         for (let key in data) {
           groups.push(data[key]);
         }
         app.setState({ foundGroups: groups});
       });
    }
  }

  joinGroup()
  {

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
          onChangeText={name => app.searchGroupNames(name)}>
          results={app.state.foundGroups}
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
