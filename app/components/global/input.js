/* @flow */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput
} from 'react-native';

const Input =({ label, value, onChangeText, placeholder, secureTextEntry }) => {
  return (
    <View style={ styles.container }>
      <Text>{ label }</Text>
      <TextInput
        autocCorrect={ false }
        onChangeText={ onChangeText }
        placeholder={ placeholder }
        style={ styles.input }
        secureTextEntry={ secureTextEntry }
        value={ value }
      />
    </View>
  );
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
