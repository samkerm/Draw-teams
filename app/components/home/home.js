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
  AppState,
  ActivityIndicator,
  Alert
} from 'react-native';
import firebase from 'react-native-firebase';
import { CheckBox } from 'react-native-elements';
import RNFetchBlob from 'react-native-fetch-blob';
import _ from 'lodash';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
import Button from '../global/button';
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
            getGroupInformation: app._getGroupInformation
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
      appState: AppState.currentState,
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
      topSectionHeader: 'Regulars',
      bottomSectionHeader: 'Reserves',
      tableTopSection: [],
      tableBottomSection: [],
      isAlertShowing: false
    };
  }

  componentWillMount()
  {
    app = this;
    AppState.addEventListener('change', app._handleAppStateChange);
    BackHandler.addEventListener('hardwareBackPress', function() {
      return true;
    });
    app._getGroupInformation();
    // app._checkPermission();
    app._createNotificationListeners();
  }

  componentWillUnmount()
  {
    AppState.removeEventListener('change', app._handleAppStateChange);
    BackHandler.removeEventListener('hardwareBackPress', function() {
      return false;
    });
    // app._notificationListener();
    // app._notificationOpenedListener();
  }

  _handleAppStateChange = (nextAppState) => {
    if (app.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      app._getGroupInformation();
      // TODO: set badge count to 0
    }
    app.setState({appState: nextAppState});
  }

  async _createNotificationListeners() {
    /*
    * Triggered when a particular notification has been received in foreground
    * */
    this.notificationListener = firebase.notifications().onNotification((notification) => {
      const {
        title,
        body
      } = notification;
      this.showAlert(title, body);
      app.setState({isAlertShowing: true});
    });

    /*
    * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
    * */
    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
      const {
        title,
        body
      } = notificationOpen.notification;
      this.showAlert(title, body);
      app.setState({isAlertShowing: true});
    });

    /*
    * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
    * */
    const notificationOpen = await firebase.notifications().getInitialNotification();
    if (notificationOpen) {
      const {
        title,
        body
      } = notificationOpen.notification;
      this.showAlert(title, body);
      app.setState({isAlertShowing: true});
    }
    /*
    * Triggered for data only payload in foreground
    * */
    this.messageListener = firebase.messaging().onMessage((message) => {
      if (message && message._data && message._data.groupUpdated && message._data.groupUpdated === '1')
      {
        // Group information was updated. Update UI.
        this.showAlert('Group was updated!', 'Group information has been updated.');
        app.setState({isAlertShowing: true});
      }
    });
  }

  showAlert(title, body) {
    if (!app.state.isAlertShowing)
    {
      Alert.alert(
        title, body,
        [{
          text: 'OK',
          onPress: () => {
            app.setState({
              isAlertShowing: false
            })
            app._getGroupInformation()
          }
        }, ], {
          cancelable: false
        },
      );
    }
  }

  async _getRegularsAndReserves(group)
  {
    app.setState({ isSyncingData: true});
    // put together members by their status and present them in a table where you can click on users
    // and see their status and ranking.
    let tableTopSection = [];
    let tableBottomSection = [];
    if (group.regulars && group.regulars.length > 0) {
      tableTopSection = await app._getInformationForMembers(group.regulars)
    }
    if (group.reserves && group.reserves.length > 0) {
      tableBottomSection = await app._getInformationForMembers(group.reserves)
    }
    app.setState({
      topSectionHeader: 'Regulars',
      bottomSectionHeader: 'Reserves',
      tableTopSection,
      tableBottomSection,
      isSyncingData: false
    });

    if (app.state.isSetNextGame) app._updateIndividualMembersRsvp(group);
  }

  async _getTeams(group) {
    app.setState({ isSyncingData: true});
    const tableTopSection = await app._getInformationForMembers(group.nextGame.teamA);
    const tableBottomSection = await app._getInformationForMembers(group.nextGame.teamB);
    app.setState({
      topSectionHeader: 'Team Color',
      bottomSectionHeader: 'Team White',
      tableTopSection,
      tableBottomSection,
      isSyncingData: false
    });

    if (app.state.isSetNextGame) app._updateIndividualMembersRsvp(group);
  }

  async _getGroupInformation()
  {
    app.setState({isSyncingData: true});
    try {
      const currentUserInfo = await Fetch('GET', `/getUserInfo?userId=${app.state.userId}`);
      const displayName = currentUserInfo && currentUserInfo.displayName || '';
      const groupId = currentUserInfo && currentUserInfo.groupId || '';

      // Asyncronously get image data and store in user
      if (currentUserInfo.photoURL !== '')
      {
        const res = await RNFetchBlob.fetch('GET', currentUserInfo.photoURL);
        currentUserInfo.profileImageData = `data:image/jpeg;base64,${res.base64()}`;
      }

      app.setState({
        displayName,
        groupId,
        user: currentUserInfo
      })
      if (groupId === '')
      {
        app.props.navigation.setParams({otherParam: 'need to join a group'})
        app.props.navigation.navigate('Groups', {
          onNavigateBack: app._getGroupInformation,
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
            const gameDate = moment(group.nextGame.gameDate, 'dddd, YYYY-MMM-DD kk:mm');
            const today = moment();
  
            app._setRsvpTo('NA');
            app._updateReceivedRsvp(group.nextGame);
            app.setState({ isSetNextGame: gameDate.diff(today) >= 0 });
            (group.nextGame.teamA && group.nextGame.teamB && app.state.isSetNextGame) ? app._getTeams(group): app._getRegularsAndReserves(group);
          }
          else
          {
            app._getRegularsAndReserves(group);
          }
          app.setState({group}); // Group exists update UI
        }
      }
      app.setState({isSyncingData: false});// Neet to dismiss activity incidcator regadless of the outcome
    }
    catch (error)
    {
      app._handleError(error);
    }
  }

  _updateIndividualMembersRsvp(group)
  {
    // Add RSVP data to members
    const rsvpYes = group && group.nextGame && group.nextGame.rsvpYes || [];
    const rsvpNo = group && group.nextGame && group.nextGame.rsvpNo || [];
    const tableTopSection = app.state.tableTopSection;
    const tableBottomSection = app.state.tableBottomSection;

    rsvpYes.forEach((userId) => {
      if (app.state.tableTopSection && app.state.tableTopSection.length > 0) {
        app.state.tableTopSection.filter(val => val.userId == userId).map((user) => {
          user.rsvp = 'Going';
          return user;
        });
      }
      if (app.state.tableBottomSection && app.state.tableBottomSection.length > 0) {
        app.state.tableBottomSection.filter(val => val.userId == userId).map((user) => {
          user.rsvp = 'Going';
          return user;
        });
      }
    });
    rsvpNo.forEach((userId) => {
      if (app.state.tableTopSection && app.state.tableTopSection.length > 0) {
        app.state.tableTopSection.filter(val => val.userId == userId).map((user) => {
          user.rsvp = 'Not Going';
          return user;
        });
      }
      if (app.state.tableBottomSection && app.state.tableBottomSection.length > 0) {
        app.state.tableBottomSection.filter(val => val.userId == userId).map((user) => {
          user.rsvp = 'Not Going';
          return user;
        });
      }
    });
    app.setState({
      tableTopSection,
      tableBottomSection
    });
  }

  async _getInformationForMembers(members)
  {
    let updatedMembers;
    try {
      app.setState({isSyncingData: true});
      const promises = members.map(id => Fetch('GET', `/getUserInfo?userId=${id}`));
      updatedMembers = await Promise.all(promises);
    }
    catch (err)
    {
      app._handleError(err)      
      return members
    }
    try {
      const photosPromises = updatedMembers.map(m => RNFetchBlob.fetch('GET', m.photoURL));
      const photos = await Promise.all(photosPromises);
      app.setState({isSyncingData: false});
      return updatedMembers.map((member) =>
      {
        const photo = photos.find(val => val.respInfo.redirects[0] === member.photoURL);
        member.profileImageData = `data:image/jpeg;base64,${photo.base64()}`;
        return member;
      });
    } catch (error) {
      app._handleError(error);
    }
    return members
  }

  _handleError(error) {
    console.log(error);
    app.setState({ isSyncingData: false});
  }

  _setUpNextGame()
  {
    const group = app.state.group;
    const groupId = app.state.groupId;
    app.props.navigation.navigate('NextGame', {
      group,
      groupId,
      nextGameIsSet: app._justSetNextGame
    });
  }

  _justSetNextGame()
  {
    app.setState({ isSetNextGame: true });
    app._getGroupInformation();
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
      const rsvp = await Fetch('POST', `/groups/${app.state.groupId}/rsvp`, {rsvp: status});
      app._setRsvpTo(rsvp.status);
      app._getGroupInformation();
    } catch (error) {
      app._handleError(error);
    }
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
  }

  _openMemberProfile(member)
  {
    app.props.navigation.navigate('MemberProfile', {
      userId: member.userId,
      displayName: member.displayName,
      groupId: member.groupId,
      user: member,
      group: app.state.group,
      getGroupInformation: app._getGroupInformation
    });
  }

  _renderSectionItem(item)
  {
    let members = [];
    if (item && item.length > 0)
    {
      item.forEach(
        (res, index) =>
        {
          const hasAvatar = res.photoURL !== '';
          members.push(
            <TouchableOpacity style={styles.result} key={Random.key}
            onPress={() => { app._openMemberProfile(res)}}>
              <View style={styles.items} key={Random.key}>
                <View key={Random.key}>
                  {
                    hasAvatar ?
                    <Image style={styles.profilePicture} source={{uri: res.profileImageData}} key={Random.key}/> :
                    <Image style={styles.profilePicture} source={require('../../images/icons/avatar.png')} key={Random.key} />
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

  _renderActivityIndicator()
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
              disabled={app.state.isSyncingData}
            />
            <CheckBox
              center
              title='Yes'
              iconRight
              checkedIcon='dot-circle-o'
              uncheckedIcon='circle-o'
              checked={(app.state.rsvpYes)}
              onPress={() => app._rsvp('YES')}
              disabled={app.state.isSyncingData}
            />
            <CheckBox
              right
              title='No'
              iconRight
              checkedIcon='dot-circle-o'
              uncheckedIcon='circle-o'
              checked={(app.state.rsvpNo)}
              onPress={() => app._rsvp('NO')}
              disabled={app.state.isSyncingData}
            />
          </View>
          <View style={styles.button}>
            <Button
              background={styles.whiteBG}
              textColor={styles.textColor}
              onPress={app._setUpNextGame}>
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
            onPress={app._setUpNextGame}>
            Set Next Game
          </Button>
        </View>
      </View>
    );

  }

  render() {
    return (
      <View style={styles.container}
        pointerEvents = {
          app.state.isSyncingData ? 'none' : 'auto'
        } >
        <SectionList
          renderItem={({item}) => app._renderSectionItem(item)}
          renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
          keyExtractor={(item, index) => index}
          sections={[ // homogeneous rendering between sections
            {data: [app.state.tableTopSection], title: app.state.topSectionHeader},
            {data: [app.state.tableBottomSection], title: app.state.bottomSectionHeader},
          ]}
          />
        { app.renderFooter() }
        {app._renderActivityIndicator()}
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
    padding: 8,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftItem: {
    flex: 1,
    paddingLeft: 20,
    flexDirection: 'column',
    justifyContent: 'center',
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
    width: 30,
    height: 30,
    left: 10,
    borderRadius: 15,
  }
});

AppRegistry.registerComponent('Home', () => MyApp);
