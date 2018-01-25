/* eslint-disable */

'use strict';

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AppRegistry,
  BackHandler,
  Alert,
  ImagePickerIOS,
  Image
} from 'react-native';
import { Button } from '../global/button';
import { HeaderBackButton } from 'react-navigation';
import firebase from 'firebase';

let app;

export default class Avatar extends Component {
  static navigationOptions = {
    title: 'Select your avatar',
    headerLeft: <HeaderBackButton onPress={() => { app.showAlert('Logout', 'Are you sure you want to logout?') }} />,
    gesturesEnabled: false,
  };

  constructor() {
    super();

    this.state = {
      imageURL: null
    }

    this.pickImage = this.pickImage.bind(this);
  }

  componentWillMount() {
    app = this;
    BackHandler.addEventListener('hardwareBackPress', function() {
      this.showAlert('Logout', 'Are you sure you want to logout?');
      return true;
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', function() {
      return false;
    });
  }

  logout() {
    firebase.auth().signOut()
    .then(function() {
      app.props.navigation.navigate('Login');
    }, function(error) {
      this.showAlert('Sign Out Error', error.message);
    });
  }

  showAlert(title, message) {
    Alert.alert(
      title,
      message,
      [
        {text: 'Stay', style: 'cancel'},
        {text: 'Logout', style: 'destructive', onPress: () => app.logout()},
      ],
      { cancelable: false }
    )
  }

  componentDidMount() {
    // this.pickImage();
  }

  pickImage() {
    // openSelectDialog(config, successCallback, errorCallback);
    ImagePickerIOS.openSelectDialog({}, imageUri => {
      this.setState({ image: imageUri });
    }, error => console.error(error));
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
      <Button onPress={this.pickImage}>
        Pick image
      </Button>
        {this.state.image?
          <Image style={{ flex: 1 }} source={{ uri: this.state.image }} /> :
          null
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

AppRegistry.registerComponent('Avatar', () => MyApp);
