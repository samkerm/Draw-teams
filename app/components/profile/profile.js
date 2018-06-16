'use strict';

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AppRegistry,
  Alert,
  BackHandler,
  TouchableOpacity,
  Image
} from 'react-native';
import firebase from 'firebase';
import Input from '../global/input';
import Button from '../global/button';
import LabledSlider from '../global/slider';
import { Fetch } from '../../services/network';

let app;

export default class Profile extends Component {

  static navigationOptions = () => {
    return {
      title: 'Setup Your Profile',
      headerLeft: (
        <TouchableOpacity
          onPress={() => { app.logoutAlert('Logout', 'Are you sure you want to logout?') }}>
          <Image style={styles.backButtonIcon} source={require('../../images/icons/back-button.png')} /> 
        </TouchableOpacity>
      ),
      gesturesEnabled: false,
    };
  };

  constructor(props) {
    super(props);

    const user = firebase.auth().currentUser;
    this.state = {
      userId: user.uid,
      displayName: user.displayName,
      ratings: {
        sport: 'Soccer',
        defence: 0,
        speed: 0,
        attack: 0,
        pass: 0,
        dribble: 0,
        goalie: 0
      }
    };
  }

  componentWillMount() {
    app = this;
    BackHandler.addEventListener('hardwareBackPress', function() {
      this.showAlert('Logout', 'Are you sure you want to logout?');
      return true;
    });
  }

  componentDidMount() {
    this.refs.DisplayInput.focus();
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

  logoutAlert(title, message) {
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

  showDisplayNameAlert(title, message) {
    Alert.alert(
      title,
      message,
      [
        {text: 'Ok', style: 'cancel', onPress: () => this.refs.DisplayInput.focus()},
      ],
      { cancelable: false }
    )
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

  async registerUser() {
    // Make sure the display name is filled but its not important if the ratings are not filled
    if (this.state.displayName && this.state.displayName !== '')
    {
      try {
        const createdUser = await Fetch('POST', '/users/initializeUserWithRatings', {
          ratings: app.state.ratings,
          displayName: app.state.displayName
        });
        if (createdUser.photoURL)
        {
          app.props.navigation.navigate('Home');
        }
        else {
          app.props.navigation.navigate('Avatar');
        }
      }
      catch (error)
      {
        if (error.response && error.response.data && error.response.data === 'Update failed')
        {
          app.showFirebaseAlert('User synchronization failed', 'Failed to update user profile name');
        }
        else if (error.response && error.response.data && error.response.data === 'Initialization failed')
        {
          app.showFirebaseAlert('Ratings synchronization failed', 'Failed to update user ratings');
        }
        else if (error.status === 400)
        {
          app.showDisplayNameAlert('Incomplete!', error.message);
        }
        else
        {
          app.showFirebaseAlert('Synchronization failed', error.message);
        }
      }
    }
    else
    {
      app.showDisplayNameAlert('Incomplete!', 'Make sure you at least have filled up the display name before proceeding.');
    }
  }

  render() {
    return (
      <View style={ styles.title }>
        <Input
          ref='DisplayInput'
          placeholder={ 'Enter your display name...' }
          label={ 'Display Name' }
          onChangeText={ name => this.setState({ displayName: name.trim() })}
          value={ this.state.email }
        />
        <View style={ styles.ratings }>
          <Text style={ styles.skills }>
            Skills:
          </Text>
          <LabledSlider
            style={styles.slider}
            label={ 'Defence' }
            onSlidingComplete={ value => this.setState({ ratings: Object.assign({}, this.state.ratings, {defence: value} )}) }
          />
          <LabledSlider
            style={styles.slider}
            label={ 'Attack' }
            onSlidingComplete={ value => this.setState({ ratings: Object.assign({}, this.state.ratings, {attack: value} )}) }
          />
          <LabledSlider
            style={styles.slider}
            label={ 'Speed' }
            onSlidingComplete={ value => this.setState({ ratings: Object.assign({}, this.state.ratings, {speed: value} )}) }
          />
          <LabledSlider
            style={styles.slider}
            label={ 'Pass' }
            onSlidingComplete={ value => this.setState({ ratings: Object.assign({}, this.state.ratings, {pass: value} )}) }
          />
          <LabledSlider
            style={styles.slider}
            label={ 'Dribble' }
            onSlidingComplete={ value => this.setState({ ratings: Object.assign({}, this.state.ratings, {dribble: value} )}) }
          />
          <LabledSlider
            style={styles.slider}
            label={ 'Goalie' }
            onSlidingComplete={ value => this.setState({ ratings: Object.assign({}, this.state.ratings, {goalie: value} )}) }
          />
        </View>
        <Button onPress={ () => this.registerUser() }>
          Register
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    flex: 1,
    padding: 20
  },
  skills: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20
  },
  ratings: {
    marginTop: 10,
    flex: 1,
    flexDirection: 'column'
  },
  slider: {
    borderColor: '#AAA',
    borderWidth: 2,
    height: 30
  },
  backButtonIcon: {
    width: 25,
    height: 25,
    left: 10,
    borderRadius: 12.5,
  }
});

AppRegistry.registerComponent('Profile', () => MyApp);
