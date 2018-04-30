import React, { Component } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator
} from 'react-native';

export default class Button extends Component {

  constructor(props) {
   super(props)
  }

  renderActivityIndicator() {
    if (this.props.showIndicator === true) {
      return (
        <ActivityIndicator size='small' />
      );
    }
    return (
      <Text style={[styles.text, this.props.textColor]}> {this.props.children}</Text>
    );
  }

  render() {
    return (
      <TouchableOpacity
        {...this.props}
        style={[styles.button, this.props.background]}>

        {this.renderActivityIndicator()}

      </TouchableOpacity>
    );
  };
}

const styles = StyleSheet.create({
  button: {
    marginTop: 10,
    padding: 20,
    width: '100%',
    backgroundColor: '#00aeef',
    borderRadius: 4,
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
});
