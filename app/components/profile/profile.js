/* @flow */

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
    headerLeft: <HeaderBackButton onPress={() => { app.showAlert('Logout', 'Are you sure you want to logout?') }} />,
    gesturesEnabled: false,
  };

  state = {
    email: '',
    password: '',
    userId: ''
  }

  constructor(props) {
    super(props);
    var user = firebase.auth().currentUser;
    this.state = {
      user: user.uid,
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

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', function() {
      return false;
    });
  }

  goBack() {
    firebase.auth().signOut()
    .then(function() {
      app.props.navigation.goBack(null);
    }, function(error) {
      console.error(error);
    });
  }

  // Double check for back buttonn logout.
  showAlert(title, message) {
    Alert.alert(
      title,
      message,
      [
        {text: 'Stay', style: 'cancel'},
        {text: 'Go back', onPress: () => app.goBack()},
      ],
      { cancelable: false }
    )
  }

  registerUser() {
    firebase.database().ref('users/' + this.state.userId).set({
    username: name,
    email: email,
    profile_picture : imageUrl
  });
  }

  render() {
    return (
      <View style={ styles.title }>
        <Input
          placeholder={ 'Enter your display name...' }
          label={ 'Display Name' }
          onChangeText={ email => this.setState({ email })}
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
