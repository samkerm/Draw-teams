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
    if (this.props.children && this.props.children[1])
    {
      const results = this.props.children[1];
      results.forEach(
        res =>
        {
          groups.push(
            <View>
              <View>
                <Text>{res.name}</Text>
              </View>
              <View>
                <Text>{res.gameType}</Text>
              </View>
            </View>
          );
        });
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
