import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import MapView from 'react-native-maps';

// child of ActivityDetail
export default class ActivityMap extends Component {
  constructor(props) {
    super(props);
    this.activityData = props.data;
  }

  render() {
    var data = JSON.parse(this.activityData.gps_data);
    var latLngs = data.map(function(e) {
        return {
          latitude: e.lat,
          longitude: e.lng,
        };
    });

    return (
      <MapView style={styles.map}
        initialRegion={{
          latitude: latLngs[0].latitude,
          longitude: latLngs[0].longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        <MapView.Polyline
            key="activityPolygon"
            coordinates={latLngs}
            strokeColor="#F00"
            fillColor="rgba(255,0,0,0.5)"
            strokeWidth={3}
            geodesic={true}
          />
          <MapView.Marker ref="mapMarker"
            coordinate={this.props.parent.state.coordinate} />
      </MapView>
    );
  }
}

const styles = StyleSheet.create({
  map: {
    flex: .5
  }
});
