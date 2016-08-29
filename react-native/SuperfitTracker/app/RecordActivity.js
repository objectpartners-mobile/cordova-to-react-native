import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  DeviceEventEmitter
} from 'react-native';
import { RNLocation as Location } from 'NativeModules'

import ActivityTypePicker from './ActivityTypePicker';

export default class RecordActivity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activityType: 'Run',
      progress: 'Stopped',
      buttonImage: require('../images/record-button.png'),
      currentActivityData: [],
      prevTimestamp: 0,
      watchID: null
    };
  }

  setActivityType(activityType) {
    this.setState({
      activityType: activityType
    });
  }

  // uses the react-native-location plugin for iOS, otherwise the built-in
  // React Native Geolocation API is used. The same function is used to handle
  // incoming location data
  startRecording() {
    if (Platform.OS === 'ios') {
      Location.requestAlwaysAuthorization();
      Location.setAllowsBackgroundLocationUpdates(true);
      Location.startUpdatingLocation();
      Location.setDistanceFilter(5.0);
      DeviceEventEmitter.addListener('locationUpdated', (location) => {
        this.onSuccess(location);
      });
    } else {
      var watchID = navigator.geolocation.watchPosition(this.onSuccess.bind(this), this.onError.bind(this), {
        enableHighAccuracy: true
      });

      this.setState({
        watchID: watchID
      });
    }
  }

  _onPressButton() {
    var isStopped = this.state.progress === 'Stopped';
    var progress = isStopped ? 'Recording...' : 'Stopped';
    var imagePath = isStopped ? require('../images/stop-button.png') : require('../images/record-button.png');

    this.setState({
      progress: progress,
      buttonImage: imagePath
    });

    if (isStopped) {
      this.startRecording();
    } else {
      this.stopRecording();
    }
  }

  onSuccess(position) {
    // only record data if the timestamp
    // is at least 3 seconds later than the previous one
    if ((position.timestamp - this.state.prevTimestamp)/1000 >= 3) {
      var currentActivityData = this.state.currentActivityData;

      currentActivityData.push(
        {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          alt: position.coords.altitude,
          timestamp: position.timestamp
        }
      );

      var prevTimestamp = position.timestamp;

      this.setState({
        currentActivityData: currentActivityData,
        prevTimestamp: prevTimestamp
      });
    }
  }

  onError(error) {
    console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
  }

  stopRecording() {
    // stop the device from tracking the location
    // react-native-location plugin for iOS, Geolocation API for other platforms
    if (Platform.OS === 'ios') {
      Location.stopUpdatingLocation();
    } else {
      navigator.geolocation.clearWatch(this.state.watchID);
    }

    var self = this;
    let db = this.props.db;

    if (!db) {
      console.log("Cannot save geolocation data.");
      return;
    }

    //save recorded activity data
    db.executeSql("SELECT MAX(id) as max_id from activity", [], function (resultSet) {
      // increment the value to be used for the ID 
      var id = resultSet.rows.item(0).max_id + 1;
      var date = new Date();

      // format the date as YYYY-MM-DD
      var dateStr = date.getFullYear() + "-" + pad((date.getMonth() + 1)) + "-" + pad(date.getDate());

      db.executeSql('INSERT INTO activity VALUES (?, ?, ?, ?)',
        [id, self.state.activityType,
          dateStr,
          JSON.stringify(self.state.currentActivityData)],
          function (resultSet) {
            console.log('Saved new activity');
          }, function(error) {
            console.log('INSERT error: ' + error.message);
          });
    }, function(error) {
      console.log('SELECT error: ' + error.message);
    });

    function pad(val) {
      return val.toString().length == 1 ? ("0" + val) : ("" + val);
    }
  }

  render() {
    var width = Dimensions.get('window').width;
    var self = this;

    return (
      <View style={styles.recordActivityContainer}>
        <ActivityTypePicker parent={this} setActivityType={this.setActivityType.bind(this)} />
        <TouchableOpacity style={{
            position: 'absolute',
            top: 80,
            marginTop: 20,
            left: width/2 - 64
          }}
          onPress={this._onPressButton.bind(this)}>
          <Image
            style={styles.button}
            source={this.state.buttonImage} />
				</TouchableOpacity>
        <Text style={{
          position: 'absolute',
          top: 260,
          left: width/2 - 32
        }}>{this.state.progress}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  recordActivityContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignSelf: 'stretch'
  }
});
