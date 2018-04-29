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
  Image,
  TouchableOpacity,
} from 'react-native';
import Button from '../global/button';
import { HeaderBackButton } from 'react-navigation';
import firebase from 'firebase';
import axios from 'axios';

var ImagePicker = require('react-native-image-picker');
let app;
let http;

export default class Avatar extends Component {
  static navigationOptions = {
    title: 'Select your avatar',
    headerLeft: <HeaderBackButton onPress={() => { app.showAlert('Logout', 'Are you sure you want to logout?') }} />,
    gesturesEnabled: false,
  };

  constructor() {
    super();
    this.state = {
      avatarSource: '../../images/icons/avatar.png',
    }

    http = axios.create();
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

  _handleButtonPress = () => {
    // More info on all the options is below in the README...just some common use cases shown here
    var options = {
      title: 'Select Avatar',
      // customButtons: [
      //   { name: 'fb', title: 'Choose Photo from Facebook' },
      // ],
      storageOptions: {
        skipBackup: true,
        path: 'images'
      }
    };

    /**
     * The first arg is the options object for customization (it can also be null or omitted for default options),
     * The second arg is the callback which sends object: response (more info below in README)
    */
    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      // else if (response.customButton) {
      //   console.log('User tapped custom button: ', response.customButton);
      // }
      else {
        let source = { uri: response.uri };

        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };


        this.setState({
          avatarSource: source
        });
      }
    });
  };

  async setAvatar() {
    app.props.navigation.navigate('Home');
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          onPress={this._handleButtonPress}>
          {app.state.avatarSource === '../../images/icons/avatar.png' ? 
            <Image style={styles.avatarImageIcon} source={require('../../images/icons/avatar.png')} /> :
            <Image style={styles.avatarImage} source={app.state.avatarSource} />
          }
        </TouchableOpacity>
        <View style={styles.footer}>
          <View style={styles.button}>
          {
              app.state.avatarSource === '../../images/icons/avatar.png' ? 
                <Button
                  background={styles.greyBG}
                  textColor={styles.greyText}
                  onPress={this.setUpNextGame}
                  disabled={true}
                >
                  Set Avatar
                </Button>
                :
                <Button
                  background={styles.whiteBG}
                  textColor={styles.blackText}
                  onPress={this.setUpNextGame}
                >
                  Set Avatar
                </Button>
          }
          </View>
        </View>
     </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  button: {
    marginRight: 10,
    marginLeft: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
  },
  button: {
    marginRight: 10,
    marginLeft: 10,
  },
  whiteBG: {
    backgroundColor: '#FFF',
  },
  greyBG: {
    backgroundColor: '#DCDCDC',
  },
  blackText: {
    color: '#000'
  },
  greyText: {
    color: '#A9A9A9'
  },
  avatarImageIcon: {
    alignSelf: 'center',
    width: 250,
    height: 250,
    marginTop: 100,
  },
  avatarImage : {
    alignSelf: 'center',
    width: 250,
    height: 250,
    marginTop: 100,
    borderRadius: 125,
  }
});

AppRegistry.registerComponent('Avatar', () => MyApp);
