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
import { Button } from '../global/button';
import Groups from '../groups/groups';
import NextGame from './nextGame';
import axios from 'axios';
import _ from 'lodash';

let app;
let http;

const App = StackNavigator({
  Groups: { screen: Groups },
});

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
    };

    http = axios.create();
  }

  async componentWillMount() {
    app = this;
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
        app.props.navigation.navigate('Groups');
        app.props.navigation.setParams({otherParam: 'need to join a group'})
      }
      else
      {
        const {data: group} = await http.get(`/groups/${groupId}`);
        app.props.navigation.setParams({otherParam: group.name})

        // put together members by their status and present them in a table where you can click on users
        // and see their status and ranking.

        if (group && group.regulars && group.regulars.length > 0) {group.regulars = await app.getInformationForMembers(group.regulars)}
        if (group && group.reserves && group.reserves.length > 0) {group.reserves = await app.getInformationForMembers(group.reserves)}
        app.setState({group});
      }
    }
    catch (error)
    {
      console.log(error);
    }

    BackHandler.addEventListener('hardwareBackPress', function() {
      return true;
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', function() {
      return false;
    });
  }

  async getInformationForMembers(members)
  {
    const promises = members.map(id => http.get(`/getUserInfo?userId=${id}`));
    const people = await Promise.all(promises);
    return people.map(p => p.data).filter(p => p);
  }

  setUpNextGame()
  {
    app.props.navigation.navigate('NextGame');
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
  }
});

AppRegistry.registerComponent('Home', () => MyApp);
