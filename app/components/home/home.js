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
} from 'react-native';
import firebase from 'firebase';
import { NavigationActions } from 'react-navigation';
import { StackNavigator } from 'react-navigation';
import Button from '../global/button';
import CheckBox from 'react-native-check-box';
import Groups from '../groups/groups';
import NextGame from './nextGame';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';

let app;
let http;

export default class Home extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;

    return {
      title: params ? params.otherParam : '',
      headerLeft: null,
      headerRight: (
        <TouchableOpacity>
          <Image source={require('../../images/icons/profile-edit.png')}
                 style={styles.editProfileIcon}
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
      rsvp: undefined,
    };

    http = axios.create();
  }

  componentWillMount() {
    app = this;
    app.getGroupInformation();
    BackHandler.addEventListener('hardwareBackPress', function() {
      return true;
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', function() {
      return false;
    });
  }

  async getGroupInformation()
  {
    try {
      const {data: currentUserInfo} = await http.get(`/getUserInfo?userId=${app.state.userId}`);
      console.log(currentUserInfo);
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
        const {data: group} = await http.get(`/groups/${groupId}`);
        if (group)
        {
          app.props.navigation.setParams({otherParam: group.name});

          // If group's next game is set and game date is in future update UI
          if (group.nextGame)
          {
            const date = new Date(group.nextGame.gameDate);
            const gameDate = moment(date);
            const today = moment();
            if (gameDate.diff(today) > 0) app.setState({ isSetNextGame: true });
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
      console.log(error);
    }
  }

  async getInformationForMembers(members)
  {
    const promises = members.map(id => http.get(`/getUserInfo?userId=${id}`));
    const people = await Promise.all(promises);
    return people.map(p => p.data).filter(p => p);
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
              style={ styles.checkbox }
              onClick={() => app.setState({ rsvp: undefined })}
              isChecked={ app.state.rsvp === undefined }
              leftText={'Undecided'}
              checkBoxColor={'grey'}
            />
            <CheckBox
              style={ styles.checkbox }
              onClick={() => app.setState({ rsvp: true })}
              isChecked={ app.state.rsvp === true }
              leftText={'Yes'}
              checkBoxColor={'grey'}
            />
            <CheckBox
              style={ styles.checkbox }
              onClick={() => app.setState({ rsvp: false })}
              isChecked={ app.state.rsvp === false }
              leftText={'No'}
              checkBoxColor={'grey'}
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
  checkbox: {
    padding: 10,
    width: '33%',
  },
});

AppRegistry.registerComponent('Home', () => MyApp);
