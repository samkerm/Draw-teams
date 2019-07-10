import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AppRegistry,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import firebase from 'react-native-firebase';
import { CheckBox } from 'react-native-elements';

import RatingStars from '../global/ratingstars';
import { Fetch } from '../../services/network';
import RNFetchBlob from 'react-native-fetch-blob';

const ImagePicker = require('react-native-image-picker');
const storage = firebase.storage();

let app;

// Temporarly putting this function here for dev
// TODO: needs to be removed later. Can be passed in with navigation
function _logout() {
  firebase.auth().signOut()
    .then(function () {
      app.props.navigation.navigate('Login');
    }, function (error) {
      app.showAlert('Sign Out Error', error.message);
    });
}

export default class Settings extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    
    return {
      headerLeft: (
        <TouchableOpacity
          onPress={() => {
            params.getGroupInformation();
            navigation.goBack();
            }}>
          <Image style={styles.backButtonIcon} source={require('../../images/icons/back-button.png')} /> 
        </TouchableOpacity>
      ),
      headerTitle: (
        <TouchableOpacity
          onPress={() => { }}>
          <Text>{params.displayName}</Text>
        </TouchableOpacity>
      ),
      headerRight: (
        <TouchableOpacity
          onPress={() => { _logout() }}
          >
          <Image 
            style={styles.logoutIcon}
            source={require('../../images/icons/logout.png')}
          />
        </TouchableOpacity>
      ),
      gesturesEnabled: false,
    }
  };

  constructor(props) {
    super(props);
    const { params } = props && props.navigation && props.navigation.state;

    this.state = {
      isUploadingImage: false,
      userId: params && params.userId,
      user: params && params.user,
      displayName: params && params.displayName,
      profileImageData: params && params.user && params.user.profileImageData,
      group: params && params.group,
      isRegular: false,
      isReserve: false
    };
  }

  componentWillMount()
  {
    app = this;
    const {group} = app.state;
    const isRegular = group.regulars ?
      group.regulars.some(member => member.userId === app.state.userId) : false;
    const isReserve = group.reserves ?
      group.reserves.some(member => member.userId === app.state.userId) : false;
    app.setState({
      isRegular,
      isReserve,
    });
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
        // const source = { uri: response.uri };
        // const base64Image = { uri: 'data:image/jpeg;base64,' + response.data };
        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };

        // temporarely save image. If upload was unsuccessful replace the image again.
        const tempImage = app.state.profileImageData;
        app.setState({profileImageData: 'data:image/jpeg;base64,' + response.data})

        // Prepare Blob support
        const {Blob} = RNFetchBlob.polyfill;
        const {fs} = RNFetchBlob;

        window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
        window.Blob = Blob;
        
        app.setState({ isUploadingImage: true});

        const user = firebase.auth().currentUser;
        const storageRef = storage.ref().child('avatars').child(user.uid);
        const {uri} = response;
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
            return storageRef.put(blob, {
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
            app.setState({
              isUploadingImage: false,
              profileImageData: tempImage,
            });
            console.log(error);
          })
          // app.props.navigation.navigate('Home');
      }
    });
  };

  _findOutUserStatus(group)
  {
    const isRegular = group.regulars ?
      group.regulars.some(memberId => memberId === app.state.userId): false;
    const isReserve = group.reserves ?
      group.reserves.some(memberId => memberId === app.state.userId): false;
    app.setState({
      isRegular,
      isReserve,
    });
  }

  async _changeMemberStatusInGroup(status)
  {
    try {
      const {group} = await Fetch('POST', `/groups/${app.state.user.groupId}/memberStatus?status=${status}`);
      console.log(group);
      app._findOutUserStatus(group);
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    const {ratings} = app.state.user;
    const hasAvatar = app.state.profileImageData !== '';
    return (
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          <TouchableOpacity
            onPress={app._handleButtonPress}
            disabled={app.state.isUploadingImage}>
            {
              hasAvatar ?
              <Image style={styles.profilePicture} source={{uri: app.state.profileImageData}} /> : 
              <Image style={styles.profilePicture} source={require('../../images/icons/avatar.png')} />
            }
          </TouchableOpacity>
        </View>
        
        <View style={styles.ratings}>
          <RatingStars
              label={ 'Defence:' }
              value={ ratings.defence }
          />
          <RatingStars
              label={ 'Attack:' }
              value={ ratings.attack }
          />
          <RatingStars
              label={ 'Speed:' }
              value={ ratings.speed }
          />
          <RatingStars
              label={ 'Pass:' }
              value={ ratings.pass }
          />
          <RatingStars
              label={ 'Dribble:' }
              value={ ratings.dribble }
          />
          <RatingStars
              label={ 'Goalie:' }
              value={ ratings.goalie }
          />
        </View>
        <View style={styles.checkboxView}>
          <CheckBox
            title='Regular'
            iconRight
            checkedIcon='dot-circle-o'
            uncheckedIcon='circle-o'
            checked={app.state.isRegular}
            onPress={() => app._changeMemberStatusInGroup('regular')}
          />
          <CheckBox
            title='Reserve'
            iconRight
            checkedIcon='dot-circle-o'
            uncheckedIcon='circle-o'
            checked={app.state.isReserve}
            onPress={() => app._changeMemberStatusInGroup('reserve')}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ratings: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 30, 
    backgroundColor: 'white',
  },
  logoutIcon: {
    width: 20,
    height: 20,
    right: 10,
  },
  profilePicture: {
    width: 100,
    height: 100,
    left: 10,
    borderRadius: 50,
  },
  profileContainer: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonIcon: {
    width: 25,
    height: 25,
    left: 10,
    borderRadius: 12.5,
  },
  checkboxView: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
});

AppRegistry.registerComponent('Settings', () => MyApp);
