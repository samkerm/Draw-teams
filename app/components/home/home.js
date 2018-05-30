import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AppRegistry,
  TouchableOpacity,
  Image,
  BackHandler,
  SectionList,
  ListItem,
  AsyncStorage,
} from 'react-native';
import firebase from 'firebase';
import { NavigationActions } from 'react-navigation';
import { StackNavigator } from 'react-navigation';
import Button from '../global/button';
import { CheckBox } from 'react-native-elements';
import Groups from '../groups/groups';
import NextGame from './nextGame';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import { Fetch } from '../../services/network';

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

export default class Home extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      title: params ? params.otherParam : '',
      headerLeft: null,
      headerRight: (
        <TouchableOpacity
          onPress={() => { _logout() }}>
          <Image 
            style={styles.editProfileIcon}
            source={require('../../images/icons/profile-edit.png')}
          />
        </TouchableOpacity>
      ),
      gesturesEnabled: false,
    }
  };

  constructor() {
    super();
    const user = firebase.auth().currentUser;
    this.state = {
      userId: user.uid,
      group: {},
      displayName: '',
      groupId: '',
      isSetNextGame: false,
      isUploadingData: false,
      rsvpNA: true,
      rsvpNo: false,
      rsvpYes: false,
    };
  }

  componentWillMount()
  {
    app = this;
    app.getGroupInformation();
    BackHandler.addEventListener('hardwareBackPress', function() {
      return true;
    });
  }

  componentWillUnmount()
  {
    BackHandler.removeEventListener('hardwareBackPress', function() {
      return false;
    });
  }

  async getGroupInformation()
  {
    try {
      const currentUserInfo = await Fetch('GET', `/getUserInfo?userId=${app.state.userId}`);
      const displayName = currentUserInfo.displayName || '';
      const groupId = currentUserInfo.groupId || '';
      app.setState({
        displayName,
        groupId
      })
      if (groupId === '')
      {
        app.props.navigation.setParams({otherParam: 'need to join a group'})
        app.props.navigation.navigate('Groups', {
          onNavigateBack: app.getGroupInformation,
          currentUserInfo,
        });
      }
      else
      {
        const group = await Fetch('GET', `/groups/${groupId}`);
        
        if (group)
        {
          app.props.navigation.setParams({otherParam: group.name});

          // If group's next game is set and game date is in future update UI
          if (group.nextGame)
          {
            group.nextGame = group.nextGame;
            const date = new Date(group.nextGame.gameDate);
            const gameDate = moment(date);
            const today = moment();
            if (gameDate.diff(today) > 0)
            {
              app.setState({ isSetNextGame: true });
              app._updateReceivedRsvp(group.nextGame);
            }
          }


          // put together members by their status and present them in a table where you can click on users
          // and see their status and ranking.

          if (group && group.regulars && group.regulars.length > 0) {group.regulars = await app.getInformationForMembers(group.regulars)}
          if (group && group.reserves && group.reserves.length > 0) {group.reserves = await app.getInformationForMembers(group.reserves)}
          app.setState({group});
        }
      }
    }
    catch (error)
    {
      console.error(error);
      _logout();
    }
  }

  async getInformationForMembers(members)
  {
    const promises = members.map(id => Fetch('GET', `/getUserInfo?userId=${id}`));
    return await Promise.all(promises);
  }

  setUpNextGame()
  {
    const group = app.state.group;
    const groupId = app.state.groupId;
    app.props.navigation.navigate('NextGame', {
      group,
      groupId,
      nextGameIsSet: app.justSetNextGame
    });
  }

  justSetNextGame()
  {
    app.setState({ isSetNextGame: true });
    app.getGroupInformation();
  }

  _updateReceivedRsvp(nextGame)
  {
    const rsvpYeses = nextGame.rsvpYes || [];
    const rsvpNos = nextGame.rsvpNo || [];
    if (rsvpYeses.some((val) => val === app.state.userId)) app._setRsvpTo('YES');
    if (rsvpNos.some((val) => val === app.state.userId)) app._setRsvpTo('NO');
  }

  async _rsvp(status)
  {
    app.setState({ isUploadingData: true});
    try {
      const rsvp = await Fetch('POST', `/groups/${this.state.groupId}/rsvp`, {rsvp: status});
      app._setRsvpTo(rsvp.status)
    } catch (error) {
      console.error(error);
      // TODO: Show alert
    }
    app.setState({ isUploadingData: false});
  }

  _setRsvpTo(status) {
    switch (status) {
      case 'NA':
        app.setState({
          rsvpNA: true,
          rsvpNo: false,
          rsvpYes: false
        });
        break;
      case 'NO':
        app.setState({
          rsvpNA: false,
          rsvpNo: true,
          rsvpYes: false
        });
        break;
      case 'YES':
        app.setState({
          rsvpNA: false,
          rsvpNo: false,
          rsvpYes: true
        });
        break;
      default:
        break;
    }
    // app.setState({ rsvp });
  }

  renderSectionItem(item)
  {
    let members = [];
    if (item && item.length > 0)
    {
      item.forEach(
        (res, index) =>
        {
          members.push(
            <TouchableOpacity style={styles.result} key={((index + 1)*76374).toString()}>
              <View style={styles.item} key={((index + 2)*22374).toString()}>
                <Text key={((index + 3)*26574).toString()} >{res.displayName}</Text>
              </View>
            </TouchableOpacity>
          );
        });
    }
    else
    {
      members.push(
        <View key={(784579).toString()}>
          <Text style={styles.item} key={(346537).toString()}>No members...</Text>
        </View>
      );
    }
    return (
      <View style={styles.results}>
        {members}
      </View>
    );
  }

  renderFooter()
  {
    if (app.state.isSetNextGame)
    {
      return (
        <View style={styles.footer}>
          <Text style={{ left: 10 }}>RSVP: </Text>
          <View style={styles.checkboxView}>
            <CheckBox
              left
              title='Undecided'
              iconRight
              checkedIcon='dot-circle-o'
              uncheckedIcon='circle-o'
              checked={(app.state.rsvpNA)}
              onPress={() => app._rsvp('NA')}
              disabled={this.state.isUploadingData}
            />
            <CheckBox
              center
              title='Yes'
              iconRight
              checkedIcon='dot-circle-o'
              uncheckedIcon='circle-o'
              checked={(app.state.rsvpYes)}
              onPress={() => app._rsvp('YES')}
              disabled={this.state.isUploadingData}
            />
            <CheckBox
              right
              title='No'
              iconRight
              checkedIcon='dot-circle-o'
              uncheckedIcon='circle-o'
              checked={(app.state.rsvpNo)}
              onPress={() => app._rsvp('NO')}
              disabled={this.state.isUploadingData}
            />
          </View>
          <View style={styles.button}>
            <Button
              background={styles.whiteBG}
              textColor={styles.textColor}
              onPress={this.setUpNextGame}>
              Update Next Game
            </Button>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.footer}>
        <View style={styles.button}>
          <Button
            background={styles.whiteBG}
            textColor={styles.textColor}
            onPress={this.setUpNextGame}>
            Set Next Game
          </Button>
        </View>
      </View>
    );

  }

  render() {
    return (
      <View style={styles.container}>
        <SectionList
          renderItem={({item}) => this.renderSectionItem(item)}
          renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
          keyExtractor={(item, index) => index}
          sections={[ // homogeneous rendering between sections
            {data: [app.state.group.regulars], title: 'Regulars'},
            {data: [app.state.group.reserves], title: 'Reserves'},
          ]}
          />
        { app.renderFooter() }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20
  },
  editProfileIcon: {
    width: 20,
    height: 20,
    right: 10,
  },
  sectionHeader: {
    paddingTop: 2,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 2,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(247,247,247,1.0)',
  },
  item: {
    padding: 10,
    height: 44,
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
  },
  checkboxView: {
    flexDirection: 'row',
  },
});

AppRegistry.registerComponent('Home', () => MyApp);
