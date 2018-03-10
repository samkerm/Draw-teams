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
  CameraRoll,
  Image,
  ScrollView
} from 'react-native';
import { Button } from '../global/button';
import { HeaderBackButton } from 'react-navigation';
import firebase from 'firebase';
import axios from 'axios';

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
      photos: []
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
   CameraRoll.getPhotos({
       first: 20,
       assetType: 'Photos',
     })
     .then(r => {
       this.setState({ photos: r.edges });
     })
     .catch((err) => {
        //Error Loading Images
     });
  };

  async setAvatar() {
    try {
      const {data: response} = await http.get('/addMessage?original=Heythere');
      console.log(response);
    } catch (e) {
      console.error(e);
    }
    app.props.navigation.navigate('Home');
  }

  render() {
    return (
      <View>
        <View style={styles.button}>
          <Button onPress={this._handleButtonPress}>Load Images</Button>
        </View>
       <ScrollView>
         {this.state.photos.map((p, i) => {
         return (
           <Image
             key={i}
             style={{
               width: 300,
               height: 100,
             }}
             source={{ uri: p.node.image.uri }}
           />
         );
       })}
       </ScrollView>
       <View style={styles.button}>
         <Button onPress={this.setAvatar}>Set Avatar</Button>
       </View>
     </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    marginRight: 10,
    marginLeft: 10,
  }
});

AppRegistry.registerComponent('Avatar', () => MyApp);
