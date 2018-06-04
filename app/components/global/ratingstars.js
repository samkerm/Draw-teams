/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Rating } from 'react-native-elements';

export default class RatingStars extends Component {

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
        <Rating
            type = 'custom'
            fractions={1}
            startingValue={this.state.value || this.props.value}
            readonly
            ratingBackgroundColor=""
            style={{backgroundColor: 'white'}}
            showReadOnlyText={false}
            ratingCount={10}
            imageSize={18}
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
    paddingTop: 5,
    paddingBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    width: '25%',
    height: 20,
    fontSize: 16,
  },
  starts: {
    width: '60%',
    height: 15,
  },
  value: {
    width: '15%',
    height: 20,
    fontSize: 16,
    paddingLeft: 15,
  }
});
