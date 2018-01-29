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

  createGroup()
  {
    console.log(app.state.groupName, app.state.groupGameType);
  }

  initiateJoiningGroup()
  {
    app.setState({ creatingGroup: false });
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
        <Button style={styles.button} onPress={this.joinGroup}>Hey</Button>
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
