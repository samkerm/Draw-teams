import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AppRegistry,
  TouchableOpacity,
  Image,
} from 'react-native';
import firebase from 'firebase';
import { NavigationActions } from 'react-navigation';
import { StackNavigator } from 'react-navigation';
import { CheckBox } from 'react-native-elements';

import Button from '../global/button';
import Input from '../global/input';
import RatingStars from '../global/ratingstars';
import { Fetch } from '../../services/network';
import { RandomNumberString } from '../../services/network';


let app;

export default class MemberProfile extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    
    return {
      headerLeft: (
        <TouchableOpacity
          onPress={() => { navigation.goBack() }}>
          <Image style={styles.backButtonIcon} source={require('../../images/icons/back-button.png')} /> 
        </TouchableOpacity>
      ),
      headerTitle: (
        <TouchableOpacity
          onPress={() => { }}>
          <Text>{params.displayName}</Text>
        </TouchableOpacity>
      ),
      gesturesEnabled: false,
    }
  };

  constructor(props) {
    super(props);
    const {params} = props.navigation.state;

    this.state = {
      userId: params.userId,
      user: params.user,
      displayName: params.displayName,
      profileImageData: params.user.profileImageData,
      group: params.group,
      isRegular: false,
      isReserve: false
    };
  }

  componentWillMount()
  {
    app = this;
    const {group} = app.state;
    const isRegular = group.regulars ?
      group.regulars.some(member => member.userId === app.state.userId) : false;
    const isReserve = group.reserves ?
      group.reserves.some(member => member.userId === app.state.userId) : false;
    app.setState({
      isRegular,
      isReserve,
    });
  }

  _findOutUserStatus(group)
  {
    const isRegular = group.regulars ?
      group.regulars.some(memberId => memberId === app.state.userId): false;
    const isReserve = group.reserves ?
      group.reserves.some(memberId => memberId === app.state.userId): false;
    app.setState({
      isRegular,
      isReserve,
    });
  }

  async _changeMemberStatusInGroup(status)
  {
    try {
      const group = await Fetch('POST', `/groups/${app.state.user.groupId}/memberStatus?status=${status}`);
      console.log(group);
      app._findOutUserStatus(group);
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    const {ratings} = app.state.user;
    const hasAvatar = app.state.profileImageData !== '';
    return (
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          {
              hasAvatar ?
              <Image style={styles.profilePicture} source={{uri: app.state.profileImageData}} /> : 
              <Image style={styles.profilePicture} source={require('../../images/icons/avatar.png')} />
            }
        </View>
        
        <View style={styles.ratings}>
            <RatingStars
                label={ 'Defence:' }
                value={ ratings.defence }
            />
            <RatingStars
                label={ 'Attack:' }
                value={ ratings.attack }
            />
            <RatingStars
                label={ 'Speed:' }
                value={ ratings.speed }
            />
            <RatingStars
                label={ 'Pass:' }
                value={ ratings.pass }
            />
            <RatingStars
                label={ 'Dribble:' }
                value={ ratings.dribble }
            />
            <RatingStars
                label={ 'Goalie:' }
                value={ ratings.goalie }
            />
        </View>
        <View style={styles.checkboxView}>
            <CheckBox
              title='Regular'
              iconRight
              checkedIcon='dot-circle-o'
              uncheckedIcon='circle-o'
              checked={app.state.isRegular}
              onPress={() => app._changeMemberStatusInGroup('regular')}
            />
            <CheckBox
              title='Reserve'
              iconRight
              checkedIcon='dot-circle-o'
              uncheckedIcon='circle-o'
              checked={app.state.isReserve}
              onPress={() => app._changeMemberStatusInGroup('reserve')}
            />
          </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ratings: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 30, 
    backgroundColor: 'white',
  },
  logoutIcon: {
    width: 20,
    height: 20,
    right: 10,
  },
  profilePicture: {
    width: 100,
    height: 100,
    left: 10,
    borderRadius: 50,
  },
  profileContainer: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonIcon: {
    width: 25,
    height: 25,
    left: 10,
    borderRadius: 12.5,
  },
  checkboxView: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
});

AppRegistry.registerComponent('MemberProfile', () => MyApp);
