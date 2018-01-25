'use strict';

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AppRegistry,
  Alert,
  BackHandler
} from 'react-native';
import firebase from 'firebase';
import { StackNavigator, HeaderBackButton } from 'react-navigation';
import { Input } from '../global/input';
import { Button } from '../global/button';
import LabledSlider from '../global/slider';

let app = Object;

export default class Profile extends Component {

  static navigationOptions = {
    title: 'Setup Your Profile',
    headerLeft: <HeaderBackButton onPress={() => { app.logoutAlert('Logout', 'Are you sure you want to logout?') }} />,
    gesturesEnabled: false,
  };

  constructor(props) {
    super(props);

    const user = firebase.auth().currentUser;
    this.state = {
      userId: user.uid,
      displayeName: user.displayeName,
      ratings: {
        sport: '5 vs 5 soccer',
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

  registerUser() {
    // Make sure the display name is filled but its not important if the ratings are not filled
    if (this.state.displayeName && this.state.displayeName !== '')
    {
      firebase.auth().currentUser.updateProfile({
        displayName: app.state.displayeName,
      }).then(function() {
        firebase.database().ref('users/' + app.state.userId).set({
          displayeName: app.state.displayeName,
          ratings: app.state.ratings,
        })
        .then(function() {
          console.log('User synchronization succeeded3');
          const ratingsRef = firebase.database().ref('ratings/');
          const newRatingRef = ratingsRef.push();
          newRatingRef.set({
            userId: app.state.userId,
            ratedBy: app.state.userId,
            date: new Date().toUTCString(),
            sport: '5 vs 5 soccer',
            defence: app.state.ratings.defence,
            speed: app.state.ratings.speed,
            attack: app.state.ratings.attack,
            pass: app.state.ratings.pass,
            dribble: app.state.ratings.dribble,
            goalie: app.state.ratings.goalie
          })
          .then(function() {
            app.showFirebaseAlert('Ratings synchronization succeeded!');
            if (firebase.auth().currentUser.photoURL)
            {
              app.props.navigation.navigate('Home');
            }
            else {
              app.props.navigation.navigate('Avatar');
            }
          })
          .catch(function(error) {
            app.showFirebaseAlert('Ratings synchronization failed', error.message);
          });
        })
        .catch(function(error) {
          app.showFirebaseAlert('User synchronization failed', error.message);
        });
      }, function(error) {
        app.showFirebaseAlert('Failed updating user info', error.message);
      });
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
          onChangeText={ name => this.setState({ displayeName: name.trim() })}
          value={ this.state.email }
        />
        <View style={ styles.ratings }>
          <Text style={ styles.skills }>
            Skills:
          </Text>
          <LabledSlider
            label={ 'Defence' }
            onSlidingComplete={ value => this.setState({ ratings: Object.assign({}, this.state.ratings, {defence: value} )}) }
          />
          <LabledSlider
            label={ 'Attack' }
            onSlidingComplete={ value => this.setState({ ratings: Object.assign({}, this.state.ratings, {attack: value} )}) }
          />
          <LabledSlider
            label={ 'Speed' }
            onSlidingComplete={ value => this.setState({ ratings: Object.assign({}, this.state.ratings, {speed: value} )}) }
          />
          <LabledSlider
            label={ 'Pass' }
            onSlidingComplete={ value => this.setState({ ratings: Object.assign({}, this.state.ratings, {pass: value} )}) }
          />
          <LabledSlider
            label={ 'Dribble' }
            onSlidingComplete={ value => this.setState({ ratings: Object.assign({}, this.state.ratings, {dribble: value} )}) }
          />
          <LabledSlider
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
    borderWidth: 2
  }
});

AppRegistry.registerComponent('Profile', () => MyApp);
