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
    // TODO: need to set a maximum number of characters
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
        <View style={styles.button}>
          <Button
            onPress={ this.props.onCreationRequest }>
            Create and join new group
          </Button>
        </View>

        <View style={styles.footer}>
          <View style={styles.button}>
            <Button
              background={styles.whiteBG}
              textColor={styles.textColor}
              onPress={ this.props.toggleGroup }>
              Join existing
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
    flexDirection: 'column',
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
