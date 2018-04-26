/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Slider
} from 'react-native';

export default class LabledSlider extends Component {

  constructor(props) {
   super(props);
    this.state = {
      value: 0
    };
  }

  render() {
    return (
      <View style={ styles.container }>
        <Text style={ styles.label }>{ this.props.label }</Text>
        <Slider
          style={ styles.slider }
          value={ this.props.value }
          maximumValue={ this.props.maximumValue || 10 }
          onValueChange={ value => this.setState({value}) }
          onSlidingComplete={ this.props.onSlidingComplete }
          step={ 1 }
        />
        <Text style={ styles.value }>{ this.state.value || this.props.value }</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    height: 50
  },
  label: {
    width: '20%',
    height: 15,
    left: 5,
  },
  slider: {
    width: '70%',
    height: 15
  },
  value: {
    width: '10%',
    height: 15,
    paddingLeft: 5
  }
});
