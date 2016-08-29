import React, { Component } from 'react';
import { View } from 'react-native';

import ActivityGraph from './ActivityGraph';
import ActivityMap from './ActivityMap';

export default class ActivityDetail extends Component {
  constructor(props) {
    super(props);
    this.activityData = props.data;
    this.state = {
      coordinate: {
        latitude: 0,
        longitude: 0
      }
    }
  }

  // child components share the coordinate of this component
  // it is used to determine the position of the marker on the map
  setCoordinate(coord, ref) {
    ref.setState({
       coordinate: coord
    });
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <ActivityGraph data={this.activityData} setCoordinate={this.setCoordinate} parent={this} />
        <ActivityMap data={this.activityData} parent={this} />
      </View>
    );
  }
}
