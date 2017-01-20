import React, { Component } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Chart from 'react-native-chart';

// child of ActivityDetail
export default class ActivityGraph extends Component {
  constructor(props) {
    super(props);
    this.activityData = props.data;
    this.yScale = 100;
  }

  buildActivityChartData(yScale) {
    return prepareData(JSON.parse(this.activityData.gps_data), yScale);

    //returns scaled down array used to plot data on chart
    function prepareData(gpsData, maxDataPoints) {
      var data = [];

      //plot no more than max data points
      var scaleBy = gpsData.length/maxDataPoints;

      if (scaleBy < 1) {
        scaleBy = 1;
      }

      var scaleCount = 0;
      var scaleIndex = 0;

      for (var i=0; i<gpsData.length; i++) {
        scaleCount++;

        if (scaleCount >= scaleBy) {
          var curr = gpsData[i];
          var dist = 0;
          var speed = 0;

          if (scaleIndex > 0) {
            var prev = data[scaleIndex-1];
            var dateDiff = new Date(curr.timestamp).getTime() - prev.date.getTime();
            if (dateDiff > 0) {
              var secondsBetween = Math.abs(dateDiff / 1000);

              dist = distanceBetween(curr.lat, curr.lng, prev.lat, prev.lng); //KM
              speed = dist/secondsBetween*3600; //KPH
              dist = dist + prev.distance;
            }
          }

          data.push({distance: dist, speed: speed, lat: curr.lat, lng: curr.lng, date: new Date(curr.timestamp)});
          scaleCount = 0;
          scaleIndex++;
        }
      }

      return data;
    }

    //returns distance in KM
    //See http://www.geodatasource.com/developers/javascript
    function distanceBetween(lat1, lon1, lat2, lon2) {
      var radlat1 = Math.PI * lat1/180;
    	var radlat2 = Math.PI * lat2/180;
    	var theta = lon1-lon2;
    	var radtheta = Math.PI * theta/180;
    	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    	dist = Math.acos(dist);
    	dist = dist * 180/Math.PI;
    	dist = dist * 60 * 1.1515;
    	dist = dist * 1.609344;

    	return dist;
    }
  }

  render() {
    var self = this;
    var preparedData = this.buildActivityChartData(self.yScale);

    //round distance off to nearest hundreths
    var roundDistance = function(arr) {
      return arr.map(function(e){
        return [(Math.round(e.distance * 100)/100), e.speed];
      });
    }

    var data = roundDistance(preparedData);

    var {height, width} = Dimensions.get('window');
    var chartWidth = width - 40;
    var chartHeight = height/2 - 120;

    // handler for when the line chart is pressed
    // the forked version of react-native-chart allows this
    var dataPointPressed = function(e) {
      var y = e.nativeEvent.locationY;
      var x = e.nativeEvent.locationX;

      console.log("Datapoint Pressed: (" + x + ", " + y + ")");

      var segmentWidth = chartWidth/(data.length + 1);

      // moves the coordinate used by the marker on the map
      var moveCoordinate = function(index) {
        var d = preparedData[index];
        self.props.setCoordinate({
          latitude: d.lat,
          longitude: d.lng
        }, self.props.parent);
      };

      //divide the line chart view into vertical segments
      //the index of the segment clicked corresponds to the index of the charted data
      for(var i=0; i<data.length; i++) {
        if (x >= i*segmentWidth && x < (i+1) * segmentWidth) {
          if (i < data.length) {
            moveCoordinate(i);
          }

          break;
        }
      }
    };

    // transformX avoids overcrowding on the x-axis labels
    var transIndex = 0;
    var segments = Math.round(data.length/10);

    function transformX(d) {
      transIndex++;
      if (data.length < 10) {
        return d;
      }

      return transIndex % segments == 0 ? d : "";
    }

    return (
      <View style={styles.chartContainer}>
          <Text style={styles.yAxisLabel}>Speed (KM/H)</Text>
          <Chart
              style={{height: chartHeight,
                      width: chartWidth}}
              data={data}
              showGrid={false}
              tightBounds={true}
              dataPointRadius={0}
              dataPointColor="#4DC4E6"
              dataPointFillColor="#4DC4E6"
              color="#4DC4E6"
              type="line"
              onLineChartPress={dataPointPressed}
              showDataPoint={true}
              xAxisTransform={transformX}
           />
           <Text>Dist (KM)</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  chartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingTop: 20,
    paddingBottom: 20,
    flex: .5
  },
  yAxisLabel: {
    position: 'absolute',
    left: -30,
    top: 70,
    transform: [{rotate: '270deg'}]
  }
});
