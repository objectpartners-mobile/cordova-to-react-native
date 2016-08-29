import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableHighlight } from 'react-native';

import ActivityDetail from './ActivityDetail';

export default class ViewActivity extends Component {
  constructor(props) {
    super(props);
    this.activityData = props.data;
  }

  // navigate back to the ActivityList
  goBack() {
    this.props.navigator.pop();
  }

  render() {
    return (
      <View style={styles.activityDetailContainer}>
        <View style={styles.activityDetailHeader}>
          <TouchableHighlight
            underlayColor='rgba(192,192,192,0.6)'
            onPress={this.goBack.bind(this)} >
            <View>
              <Text style={{marginLeft: 10, fontSize: 25}}>&lt;</Text>
            </View>
          </TouchableHighlight>
          <Text style={{fontSize: 18, marginRight: 0, marginTop: 5}}>{this.activityData.type} - {this.activityData.dt}</Text>
          <Text>&nbsp;</Text>
        </View>
        <View style={styles.activityDetailBody}>
          <ActivityDetail data={this.activityData} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  activityDetailHeader: {
    flex: .1,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  activityDetailBody: {
    flex: .9
  },
  activityDetailContainer: {
    flex: 1,
    flexDirection: 'column'
  }
});
