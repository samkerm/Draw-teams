import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AppRegistry,
} from 'react-native';
import firebase from 'firebase';
import { HeaderBackButton } from 'react-navigation';
import { StackNavigator } from 'react-navigation';
import { Button } from '../global/button';
import LabledSlider from '../global/slider';
import DatePicker from 'react-native-datepicker';
import CheckBox from 'react-native-check-box';
import axios from 'axios';
import _ from 'lodash';

let app;
let http;

export default class NextGame extends Component {
  static navigationOptions = {
    title: 'Set Up Next Game',
    headerLeft: <HeaderBackButton onPress={() => {app.props.navigation.goBack()}}/>,
    gesturesEnabled: false,
  };

  constructor() {
    super();
    const user = firebase.auth().currentUser;
    this.state = {
      numberOfPlayers: 0,
      date: new Date(),
      regularsNotification: new Date(),
      notifyReserves: null,
      weeklyRepeat: false,
      monthlyRepeat: false,
    };

    http = axios.create();

    // Load last game settings
  }

  async componentWillMount() {
    app = this;
  }

  render() {
    return (
      <View style={styles.container}>
        <LabledSlider
          label={ 'Players' }
          maximumValue={ 22 }
          onSlidingComplete={ value => this.setState({ numberOfPlayers: value }) }
        />
        <View style={styles.item}>
          <Text>Game time/date</Text>
          <DatePicker
            style={{width: '100%'}}
            date={this.state.date}
            mode="datetime"
            placeholder="select date"
            format="dddd, MMM-DD HH:mm"
            minDate={new Date()}
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            customStyles={{
              dateIcon: {
                position: 'absolute',
                left: 0,
                top: 15,
              },
              dateInput: {
                top: 10,
                borderColor: 'white',
                borderRadius: 5,
                marginLeft: 50,
              }
            }}
            onDateChange={(date) => {this.setState({date: date})}}
          />
        </View>
        <View style={styles.item}>
          <Text>Remind Regulars</Text>
          <DatePicker
            style={{width: '100%'}}
            date={this.state.regularsNotification}
            mode="datetime"
            placeholder="select date"
            format="dddd, MMM-DD HH:mm"
            minDate={new Date()}
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            customStyles={{
              dateIcon: {
                position: 'absolute',
                left: 0,
                top: 15,
              },
              dateInput: {
                top: 10,
                borderColor: 'white',
                borderRadius: 5,
                marginLeft: 50,
              }
            }}
            onDateChange={(date) => {this.setState({regularsNotification: date})}}
          />
        </View>
        <View style={styles.item}>
          <Text>Notify Reserves</Text>
          <Text style={{fontSize: 8, margin: 5}}>if this value is set the group RSVP will open up to reserves and players are picked on first-come, firse-serve basis</Text>
          <DatePicker
            style={{width: '100%'}}
            date={this.state.notifyReserves}
            mode="datetime"
            placeholder="select date"
            format="dddd, MMM-DD HH:mm"
            minDate={new Date()}
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            customStyles={{
              dateIcon: {
                position: 'absolute',
                left: 0,
                top: 15,
              },
              dateInput: {
                top: 10,
                borderColor: 'white',
                borderRadius: 5,
                marginLeft: 50,
              }
            }}
            onDateChange={(date) => {this.setState({notifyReserves: date})}}
          />
        </View>
        <View style={styles.item}>
          <Text>Repeat</Text>
          <View style={styles.checkboxView}>
            <CheckBox
              style={styles.checkbox}
              onClick={(val)=>this.setState({weeklyRepeat: val})}
              isChecked={this.state.weeklyRepeat}
              leftText={'Every week'}
              checkBoxColor={'grey'}
            />
            <CheckBox
              style={styles.checkbox}
              onClick={(val)=>this.setState({monthlyRepeat: val})}
              isChecked={this.state.monthlyRepeat}
              leftText={'Every month'}
              checkBoxColor={'grey'}
            />
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
  item: {
    margin: 10,
  },
  checkboxView: {
    flexDirection: 'row',
  },
  checkbox: {
    padding: 10,
    width: '50%',
  }
});

AppRegistry.registerComponent('NextGame', () => MyApp);
