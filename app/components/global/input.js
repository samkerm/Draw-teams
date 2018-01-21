/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput
} from 'react-native';

export default class Input extends Component {
  constructor(props) {
   super(props)
  }

  focus() {
    this.refs.textInput.focus();
  }

  render() {
    return (
      <View style={ styles.container }>
        <Text>{ this.props.label }</Text>
        <TextInput
          {...this.props}
          style={ styles.input }
          ref={'textInput'}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    width: '100%',
    borderColor: '#eee',
    borderBottomWidth: 2
  },
  label: {
    padding: 5,
    paddingBottom: 0,
    color: '#333',
    fontSize: 17,
    fontWeight: '700',
    width: '100%'
  },
  input: {
    paddingTop: 5,
    paddingRight: 5,
    paddingLeft: 5,
    paddingBottom: 2,
    color: '#333',
    fontSize: 15,
    fontWeight: '700',
    width: '100%'
  }
});

export { Input };
