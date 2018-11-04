import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AppRegistry,
} from 'react-native';
import firebase from 'react-native-firebase';
import { HeaderBackButton } from 'react-navigation';
import Button from '../global/button';
import LabledSlider from '../global/slider';
import DatePicker from 'react-native-datepicker';
import { CheckBox } from 'react-native-elements';
import _ from 'lodash';
import moment from 'moment';
import { Fetch } from '../../services/network';
import qrcode from '../qr/qr';

let app;

export default class NextGame extends Component {
  static navigationOptions = {
    title: 'Set Up Next Game',
    headerLeft: <HeaderBackButton onPress={() => {app.props.navigation.goBack()}}/>,
    gesturesEnabled: false,
  };

  constructor(props) {
    super(props);
    const user = firebase.auth().currentUser;
    let nextGame = {
      numberOfPlayers: 0,
      gameDate: moment().format('dddd, YYYY-MMM-DD kk:mm'),
      regularsNotification: moment().format('dddd, YYYY-MMM-DD kk:mm'),
      reservesNotification: null,
      weeklyRepeat: false,
      monthlyRepeat: false,
    };
    const group = this.props.navigation.state.params.group
    if (group.nextGame && !_.isEmpty(group.nextGame)) {
      nextGame = group.nextGame;
    }

    this.state = nextGame;
  }

  componentWillMount() {
    app = this;
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
      const response = await Fetch('POST', `/groups/${navigation.state.params.groupId}/nextgame`, app.state);
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
    const { navigate } = this.props.navigation;
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
              left
              title='Every week'
              iconRight
              checkedIcon='dot-circle-o'
              uncheckedIcon='circle-o'
              checked={app.state.weeklyRepeat}
              onPress={() => this._weeklyRepeat()}
            />
            <CheckBox
              right
              title='Every month'
              iconRight
              checkedIcon='dot-circle-o'
              uncheckedIcon='circle-o'
              checked={app.state.monthlyRepeat}
              onPress={() => this._monthlyRepeat()}
            />
          </View>
          <Button
            title="Hello"
            onPress={() =>
              navigate('Qr')
            }
            />

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
