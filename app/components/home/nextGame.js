import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AppRegistry,
} from 'react-native';
import firebase from 'firebase';
import { HeaderBackButton } from 'react-navigation';
import Button from '../global/button';
import LabledSlider from '../global/slider';
import DatePicker from 'react-native-datepicker';
import CheckBox from 'react-native-check-box';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';

let app;
let http;

export default class NextGame extends Component {
  static navigationOptions = {
    title: 'Set Up Next Game',
    headerLeft: <HeaderBackButton onPress={() => {app.props.navigation.goBack()}}/>,
    gesturesEnabled: false,
  };

  constructor(props) {
    super(props);
    const user = firebase.auth().currentUser;
    this.state = {
      numberOfPlayers: 0,
      gameDate: moment().format('dddd, YYYY-MMM-DD kk:mm'),
      regularsNotification: moment().format('dddd, YYYY-MMM-DD kk:mm'),
      reservesNotification: null,
      weeklyRepeat: false,
      monthlyRepeat: false,
    };

    http = axios.create();
  }

  async componentWillMount() {
    app = this;
    // Get nextGame if already existing
    // If gameDate is in the past only update none gameDate related parameters
    const group = app.props.navigation.state.params.group
    console.log(group);
    if (group.nextGame && !_.isEmpty(group.nextGame))
    {
      app.setState({
        numberOfPlayers: group.nextGame.numberOfPlayers,
        gameDate: group.nextGame.gameDate,
        regularsNotification: group.nextGame.regularsNotification,
        reservesNotification: group.nextGame.reservesNotification,
        weeklyRepeat: group.nextGame.weeklyRepeat,
        monthlyRepeat: group.nextGame.monthlyRepeat,
      });
    }
  }

  componentDidUpdate()
  {
    console.log(app.state, 'Debug');
  }

  _weeklyRepeat()
  {
    app.setState({ weeklyRepeat: !app.state.weeklyRepeat});
  }

  _monthlyRepeat() {
    app.setState({ monthlyRepeat: !app.state.monthlyRepeat });
  }

  async setUpNextGame()
  {
    const {navigation} = app.props;
    try {
      const {data: response} = await http.post(`/groups/${navigation.state.params.groupId}/nextgame`, app.state);
      console.log(response);
      if (response)
      {
        console.log('goBack');
        navigation.state.params.nextGameIsSet();
        navigation.goBack();
      }
    } catch (e) {
      console.log('Error');
      console.log(e)
    }
  }

  render() {
    return (
      <View style={ styles.container }>
        <LabledSlider
          label={ 'Players' }
          maximumValue={ 22 }
          value={ app.state.numberOfPlayers }
          onSlidingComplete={ value => app.setState({ numberOfPlayers: value }) }
        />
        <View style={ styles.item }>
          <Text>Game time/date</Text>
          <DatePicker
            style={{width: '100%'}}
            date={ app.state.gameDate }
            mode="datetime"
            placeholder="select date"
            format="dddd, YYYY-MMM-DD kk:mm"
            minDate={ new Date() }
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
            onDateChange={(date) => { app.setState({ gameDate: date }) } }
          />
        </View>
        <View style={ styles.item }>
          <Text>Remind Regulars</Text>
          <DatePicker
            style={{width: '100%'}}
            date={ app.state.regularsNotification }
            mode="datetime"
            placeholder="select date"
            format="dddd, YYYY-MMM-DD kk:mm"
            maxDate={ app.state.gameDate }
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
            onDateChange={(date) => { app.setState({ regularsNotification: date })} }
          />
        </View>
        <View style={ styles.item }>
          <Text>Notify Reserves</Text>
          <Text style={{fontSize: 8, margin: 5}}>if this value is set the group RSVP will open up to reserves and players are picked on first-come, firse-serve basis</Text>
          <DatePicker
            style={{width: '100%'}}
            date={ app.state.reservesNotification }
            mode="datetime"
            placeholder="select date"
            format="dddd, YYYY-MMM-DD kk:mm"
            maxDate={ app.state.gameDate }
            minDate={ app.state.regularsNotification }
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
            onDateChange={(date) => { app.setState({reservesNotification: date })} }
          />
        </View>
        <View style={ styles.item }>
          <Text>Repeat</Text>
          <View style={styles.checkboxView}>
            <CheckBox
              style={ styles.checkbox }
              onClick={() => this._weeklyRepeat()}
              isChecked={ app.state.weeklyRepeat }
              leftText={'Every week'}
              checkBoxColor={'grey'}
            />
            <CheckBox
              style={ styles.checkbox }
              onClick={() => this._monthlyRepeat()}
              isChecked={ app.state.monthlyRepeat }
              leftText={'Every month'}
              checkBoxColor={'grey'}
            />
          </View>
        </View>
        <View style={ styles.footer }>
          <View style={ styles.button }>
            <Button
              background={ styles.whiteBG }
              textColor={ styles.textColor }
              onPress={ this.setUpNextGame} >
              Set
            </Button>
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
  textColor: {
    color: '#000'
  }
});

AppRegistry.registerComponent('NextGame', () => MyApp);
