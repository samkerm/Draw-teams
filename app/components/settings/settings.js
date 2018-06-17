import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AppRegistry,
  TouchableOpacity,
  Image,
//   BackHandler,
//   SectionList,
//   ListItem,
//   AsyncStorage,
//   ActivityIndicator
} from 'react-native';
import firebase from 'firebase';
import { NavigationActions } from 'react-navigation';
import { StackNavigator } from 'react-navigation';

import Button from '../global/button';
import Input from '../global/input';
import RatingStars from '../global/ratingstars';
import { Fetch } from '../../services/network';
import { RandomNumberString } from '../../services/network';


let app;

// Temporarly putting this function here for dev
// TODO: needs to be removed later
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
          onPress={() => { navigation.goBack() }}>
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
          onPress={() => { _logout() }}>
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
    const {params} = props.navigation.state;

    this.state = {
      userId: params.userId,
      user: params.user,
      displayName: params.displayName,
      profileImageData: params.user.profileImageData
    };
  }

  componentWillMount()
  {
    app = this;
  }

  render() {
    const {ratings} = app.state.user;
    const hasAvatar = app.state.profileImageData !== '';
    return (
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          <TouchableOpacity
            onPress={() => {  }}>
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
  }
});

AppRegistry.registerComponent('Settings', () => MyApp);
