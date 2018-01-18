/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Slider
} from 'react-native';

class LabledSlider extends Component {
  state = {
    value: 0
  }

  setvalue(value) {
    console.log(value);
  }

  constructor(props) {
   super(props)
  }

  render() {
    return (
      <View style={ styles.container }>
        <Text style={ styles.label }>{ this.props.label }</Text>
        <Slider
          style={ styles.slider }
          value={ this.props.value }
          maximumValue={ 10 }
          onValueChange={ value => this.setState({value}) }
          onSlidingComplete={ this.props.onSlidingComplete }
          step={ 1 }
        />
        <Text style={ styles.value }>{ this.state.value }</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    flexDirection: 'row'
  },
  label: {
    width: '20%',
    height: 15
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

export default LabledSlider;
