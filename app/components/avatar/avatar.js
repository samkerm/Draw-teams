/* eslint-disable */

'use strict';

import React, { Component } from 'react';
import {
  View,
  Platform,
  StyleSheet,
  AppRegistry,
  BackHandler,
  Alert,
  Image,
  TouchableOpacity
} from 'react-native';
import Button from '../global/button';
import { HeaderBackButton } from 'react-navigation';
import firebase from 'react-native-firebase';
import RNFetchBlob from 'react-native-fetch-blob';

const ImagePicker = require('react-native-image-picker');
const storage = firebase.storage();
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
      avatarSource: '../../images/icons/avatar.png',
      selectedAvatar: '',
      isUploadingImage: false
    }
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
      app.showAlert('Sign Out Error', error.message);
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
    const options = {
        title: 'Select Avatar',
        // customButtons: [
        //   { name: 'fb', title: 'Choose Photo from Facebook' },
        // ],
        maxWidth: '1000',
        maxHeight: '1000',
        quality: 0.1,
        storageOptions: {
          skipBackup: true,
          path: 'images',
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
        const source = { uri: response.uri };
        const base64Image = { uri: 'data:image/jpeg;base64,' + response.data };
        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };


        app.setState({
          avatarSource: source,
          selectedAvatar: base64Image
        });
      }
    });
  };

  async _setAvatar() {
    // Prepare Blob support
    const {Blob} = RNFetchBlob.polyfill;
    const {fs} = RNFetchBlob;

    window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
    window.Blob = Blob;
    
    app.setState({ isUploadingImage: true});

    const user = firebase.auth().currentUser;
    const storageRef = storage.ref().child('avatars').child(user.uid);
    const {uri} = app.state.avatarSource;
    const mime = 'application/octet-stream';

    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
    let uploadBlob = null;

    fs.readFile(uploadUri, 'base64')
      .then((data) => {
        return Blob.build(data, {
          type: `${mime};BASE64`
        });
      })
      .then((blob) => {
        uploadBlob = blob;
        return storageRef.put(blob._ref, {
          contentType: mime
        });
      })
      .then(() => {
        uploadBlob.close();
        return storageRef.getDownloadURL();
      })
      .then((url) => {
        return user.updateProfile({
          photoURL: url
        });
      })
      .catch((error) => {
        app.setState({ isUploadingImage: false });
        console.error(error);
      })
      app.props.navigation.navigate('Home');
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          onPress={app._handleButtonPress}
          disabled={app.state.isUploadingImage}>
          {
            app.state.avatarSource === '../../images/icons/avatar.png' ? 
            <Image style={styles.avatarImageIcon} source={require('../../images/icons/avatar.png')} /> :
            <Image style={styles.avatarImage} source={app.state.selectedAvatar} />
          }
        </TouchableOpacity>
        <View style={styles.footer}>
          <View style={styles.button}>
          {
              app.state.avatarSource === '../../images/icons/avatar.png' || this.state.isUploadingImage ? 
                <Button
                  background={styles.greyBG}
                  textColor={styles.greyText}
                  onPress={app._setAvatar}
                  disabled={true}
                  showIndicator={this.state.isUploadingImage}
                >
                  Set Avatar
                </Button>
                :
                <Button
                  background={styles.whiteBG}
                  textColor={styles.blackText}
                  onPress={app._setAvatar}
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
