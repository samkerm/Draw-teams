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
    const hasAvatar = params && params.user && params.user.photoURL === '';
    return {
      title: params.displayName,
      headerLeft: null,
      headerRight: (
        <TouchableOpacity
          onPress={() => { _logout() }}>
          <Image 
            style={styles.logoutIcon}
            source={require('../../images/icons/logout.png')}
          />
        </TouchableOpacity>
      ),
      headerLeft: (
        <TouchableOpacity
          onPress={() => {  }}>
          {
            hasAvatar ?
            <Image style={styles.profilePicture} source={require('../../images/icons/avatar.png')} /> :
            <Image style={styles.profilePicture} source={{uri: params.user.photoURL}} />
          }
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
    };
  }

  componentWillMount()
  {
    app = this;
  }

  render() {
    const {ratings} = app.state.user;
    return (
      <View style={styles.container}>
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
    // paddingTop: 20
  },
  ratings: {
    flex: 1,
    backgroundColor: 'white',
  },
  logoutIcon: {
    width: 20,
    height: 20,
    right: 10,
  },
  profilePicture: {
    width: 40,
    height: 40,
    left: 10,
    borderRadius: 20,
  }
});

AppRegistry.registerComponent('Settings', () => MyApp);
