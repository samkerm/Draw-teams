/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Input from '../global/input';
import Button from '../global/button';

export default class JoinGroup extends Component {
  constructor(props) {
   super(props);
  }

  render() {

    let groups = [];
    if (this.props.results.length > 0)
    {
      const results = this.props.results;
      results.forEach(
        (res, index) =>
        {
          groups.push(
            <TouchableOpacity style={styles.result} key={((index + 1)*76374).toString()}
              onPress={() => this.props.selectedGroup(res.id)}>
              <View
                style={styles.groupName}
                key={((index + 1)*6746756).toString()}>
                <Text style={{fontWeight: 'bold'}} key={((index + 1)*123234).toString()}>{res.name}</Text>
              </View>
              <View
                style={styles.gameType}
                key={((index + 1)*32143).toString()}>
                <Text style={{color: 'grey', textAlign: 'right'}} key={((index + 1)*6746756).toString()}>{res.gameType}</Text>
              </View>
            </TouchableOpacity>
          );
        });
    }
    else
    {
      groups.push(
        <View key={(784579).toString()}>
          <Text style={styles.noResult} key={(346537).toString()}>No groups...</Text>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <View style={styles.container}>
        <Button
          title="Hello"
          onPress={() => this.props.navigation.navigate('Qr')}
          />
          <Input
            placeholder={ 'Search a group name...' }
            label={ 'Group Names' }
            returnKeyType={'search'}
            keyboardType={'default'}
            onChangeText={ this.props.onChangeText }
          />
          <View style={styles.results}>
            {groups}
          </View>
        </View>
        <View style={styles.button}>
          <Button
            onPress={this.props.toggleGroup }
            background={styles.whiteBG}
            textColor={styles.textColor}>Create a new group
          </Button>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  results: {
    padding: 10,
  },
  groupName: {
    width: '70%',
    paddingLeft: 5,
  },
  gameType: {
    width: '30%',
    paddingRight: 5
  },
  result: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: 'cornsilk',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  noResult: {
    color: 'coral',
  },
  button: {
    marginRight: 10,
    marginLeft: 10,
    height: 80
  },
  whiteBG: {
    backgroundColor: '#FFF',
  },
  textColor: {
    color: '#000'
  }
});
