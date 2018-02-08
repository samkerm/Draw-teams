/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Input } from '../global/input';

export default class JoinGroup extends Component {
  constructor(props) {
   super(props)
  }

  render() {
    let groups = [];
    if (this.props.children && this.props.children[1] && this.props.children[1].length > 0)
    {
      const results = this.props.children[1];
      results.forEach(
        (res, index) =>
        {
          groups.push(
            <View key={((index + 1)*76374).toString()}>
              <View key={((index + 1)*6746756).toString()}>
                <Text key={((index + 1)*123234).toString()}>{res.name}</Text>
              </View>
              <View key={((index + 1)*32143).toString()}>
                <Text key={((index + 1)*6746756).toString()}>{res.gameType}</Text>
              </View>
            </View>
          );
        });
    }
    else
    {
      groups.push(
        <View key={(784579).toString()}>
        <Text key={(346537).toString()}>No groups...</Text>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <Input
          placeholder={ 'Search a group name...' }
          label={ 'Group Names' }
          returnKeyType={'search'}
          keyboardType={'default'}
          onChangeText={ this.props.onChangeText }
        />
        {groups}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
