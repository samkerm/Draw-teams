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
  ActivityIndicator
} from 'react-native';
import firebase from 'firebase';
import { NavigationActions } from 'react-navigation';
import { StackNavigator } from 'react-navigation';
import { CheckBox } from 'react-native-elements';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';

import Button from '../global/button';
import Groups from '../groups/groups';
import NextGame from './nextGame';
import { Fetch } from '../../services/network';
import { Random } from '../../services/utilities';


let app;

export default class Home extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      title: params ? params.otherParam : '',
      headerLeft: null,
      headerRight: (
        <TouchableOpacity
          onPress={() => { app.props.navigation.navigate('Settings', 
          { 
            group: app.state.group,
            userId: app.state.userId,
            displayName: app.state.displayName,
            groupId: app.state.groupId,
            user: app.state.user,
          });}}>
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
      user: null,
      groupId: '',
      isSetNextGame: false,
      isSyncingData: false,
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
    app.setState({isSyncingData: true});
    try {
      const currentUserInfo = await Fetch('GET', `/getUserInfo?userId=${app.state.userId}`);
      const displayName = currentUserInfo.displayName || '';
      const groupId = currentUserInfo.groupId || '';

      // Asyncronously get image data and store in user
      // if (currentUserInfo.photoURL !== '')
      // {
      //   const imageDataResponse = await fetch(currentUserInfo.photoURL);
      //   currentUserInfo.profileImagePath = await imageDataResponse.path();
      // }

      app.setState({
        displayName,
        groupId,
        user: currentUserInfo
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

          // put together members by their status and present them in a table where you can click on users
          // and see their status and ranking.
          if (group.regulars && group.regulars.length > 0) {group.regulars = await app.getInformationForMembers(group.regulars)}
          if (group.reserves && group.reserves.length > 0) {group.reserves = await app.getInformationForMembers(group.reserves)}

          // If group's next game is set and game date is in future update UI
          if (group.nextGame)
          {
            group.nextGame = group.nextGame;
            const date = new Date(group.nextGame.gameDate);
            const gameDate = moment(date);
            const today = moment();
            if (gameDate.diff(today) > 0) // Game is not in the past so show its details vvvv
            {
              app.setState({ isSetNextGame: true });
              app._updateReceivedRsvp(group.nextGame);

              // Add RSVP data to members
              const rsvpYes = group.nextGame.rsvpYes || [];
              const rsvpNo = group.nextGame.rsvpNo || [];
              rsvpYes.forEach((yesUser) =>
              {
                if (group.regulars && group.regulars.length > 0)
                {
                  group.regulars.filter(val => val.userId == yesUser).map((user) =>
                  {
                    user.rsvp = 'Going';
                    return user;
                  });
                } 
                else if (group.reserves && group.reserves.length > 0)
                {
                  group.reserves.filter(val => val.userId == yesUser).map((user) => {
                    user.rsvp = 'Going';
                    return user;
                  });
                }
              });
              rsvpNo.forEach((noUser) =>
              {
                if (group.regulars && group.regulars.length > 0)
                {
                  group.regulars.filter(val => val.userId == noUser).map((user) =>
                  {
                    user.rsvp = 'Not Going';
                    return user;
                  });
                } 
                else if (group.reserves && group.reserves.length > 0)
                {
                  group.reserves.filter(val => val.userId == noUser).map((user) => {
                    user.rsvp = 'Not Going';
                    return user;
                  });
                }
              });
            }
          }
          app.setState({group}); // Group exists update UI
        }
      }
      app.setState({isSyncingData: false});// Neet to dismiss activity incidcator regadless of the outcome
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
    app.setState({ isSyncingData: true});
    try {
      const rsvp = await Fetch('POST', `/groups/${this.state.groupId}/rsvp`, {rsvp: status});
      app._setRsvpTo(rsvp.status);
      app.getGroupInformation();
    } catch (error) {
      console.error(error);
      // TODO: Show alert
    }
    app.setState({ isSyncingData: false});
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
          const hasAvatar = res.photoURL !== '';
          members.push(
            <TouchableOpacity style={styles.result} key={Random.key}>
              <View style={styles.items} key={Random.key}>
                <View key={Random.key}>
                  {
                    hasAvatar ?
                    <Image style={styles.profilePicture} source={require('../../images/icons/avatar.png')} key={Random.key} /> :
                    <Image style={styles.profilePicture} source={{uri: params.user.photoURL}} key={Random.key}/>
                  }
                </View>
                <View style={styles.leftItem} key={Random.key}>
                  <Text key={Random.key} >{res.displayName}</Text>
                </View>
                <View style={styles.rightItem} key={Random.key}>
                  <Text style={res.rsvp === 'Going' ? {color: 'green'} : {color: 'red'}} key={Random.key} >{res.rsvp}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        });
    }
    else
    {
      members.push(
        <View key={Random.key}>
          <Text style={styles.items} key={Random.key}>No members...</Text>
        </View>
      );
    }
    return (
      <View style={styles.results}>
        {members}
      </View>
    );
  }

  renderActivityIndicator()
  {
    if (app.state.isSyncingData) 
    {
      return(
        <View style={styles.activityIndicator}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }
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
              disabled={this.state.isSyncingData}
            />
            <CheckBox
              center
              title='Yes'
              iconRight
              checkedIcon='dot-circle-o'
              uncheckedIcon='circle-o'
              checked={(app.state.rsvpYes)}
              onPress={() => app._rsvp('YES')}
              disabled={this.state.isSyncingData}
            />
            <CheckBox
              right
              title='No'
              iconRight
              checkedIcon='dot-circle-o'
              uncheckedIcon='circle-o'
              checked={(app.state.rsvpNo)}
              onPress={() => app._rsvp('NO')}
              disabled={this.state.isSyncingData}
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
        {app.renderActivityIndicator()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20
  },
  activityIndicator: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
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
  items: {
    height: 44,
    padding: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftItem: {
    flex: 1,
    paddingLeft: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  rightItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
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
  profilePicture: {
    width: 20,
    height: 20,
    left: 10,
    borderRadius: 10,
  }
});

AppRegistry.registerComponent('Home', () => MyApp);
