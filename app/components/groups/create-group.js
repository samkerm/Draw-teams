/* @flow */

import React, { Component } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { Input } from '../global/input';
import { Button } from '../global/button';
import { Dropdown } from 'react-native-material-dropdown';

export default class CreateGroup extends Component {
  constructor(props) {
   super(props)
  }

  render() {
    let data = [{
      value: '5 vs 5 soccer',
    }];
    return (
      <View style={styles.container}>
        <Input
          placeholder={ 'Enter the name of your group...' }
          label={ 'Group Name' }
          returnKeyType={'next'}
          keyboardType={'default'}
          // onSubmitEditing={this.focusGroupGameType}
          onChangeText={ this.props.onChangeText }
          // value={ this.state.name }
        />
        <Dropdown
          label='Game type'
          labelFontSize={12}
          data={data}
          onChangeText={this.props.onChangeDropdown}
        />
        <View style={styles.footer}>
          <Button
            onPress={ this.props.onCreationRequest }>
            Create
          </Button>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  footer: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
  }
});
