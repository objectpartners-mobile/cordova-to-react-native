import React, { Component } from 'react';
import { StyleSheet, ListView, View, Text, TouchableHighlight, Platform } from 'react-native';
import Swipeout from 'react-native-swipeout';

export default class ActivityList extends Component {
  constructor(props) {
      super(props);
      const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      this.state = {
        dataSource: ds.cloneWithRows([]),
        scrollEnabled: true
      };
      this.initDB();
      this.navigator = props.navigator;
  }

  // creates activity table if necessary and populates it with test data
  // if none exists
  // after data is loaded, the datasource for the ListView is updated with
  // whatever data is in the table
  initDB() {
    let self = this;
    initTables(this.props.db);

    function initTables(db) {
      if (db != undefined) {
        db.sqlBatch([
          'CREATE TABLE IF NOT EXISTS activity (id, type, dt, gps_data)'
        ], function() {
          db.executeSql('SELECT * FROM activity', [], function (resultSet) {
            if (resultSet.rows != null && resultSet.rows.length == 0) {
              var testGpsDataRun = [
                {lat: 38.603734, lng: -122.864112, alt: 5, timestamp: 1470248725288},
                {lat: 38.608798, lng: -122.867714, alt: 6, timestamp: 1470249710222},
                {lat: 38.604691, lng: -122.88178, alt: 6, timestamp: 1470250543000},
                {lat: 38.611249, lng: -122.890977, alt: 5, timestamp: 1470251083000}
              ];

              var testGpsDataWalk = [
                {lat: 38.634357, lng: -122.874144, alt: 5, timestamp: 1470248725288},
                {lat: 38.62268, lng: -122.872756, alt: 7, timestamp: 1470249710222},
                {lat: 38.611205, lng: -122.870848, alt: 9, timestamp: 1470250543000},
                {lat: 38.603579, lng: -122.863891, alt: 10, timestamp: 1470251083000}
              ];

              db.sqlBatch([
                [ 'INSERT INTO activity VALUES (?, ?, ?, ?)', [1, 'Run', '2016-08-01', JSON.stringify(testGpsDataRun)]],
                [ 'INSERT INTO activity VALUES (?, ?, ?, ?)', [2, 'Walk', '2016-08-02', JSON.stringify(testGpsDataWalk)]]
              ], function() {
                self.populateActivities(db);
                console.log('inserted test data');
              }, function(error) {
                console.log('Error populating table: ' + error.message);
              });
            } else {
              self.populateActivities(db);
            }
          }, function(error){ console.log("Error inserting seed data.") });
        }, function(error) {
          console.log('Error with initDB sequence: ' + error.message);
        });
      }
    }
  }

  // update data for the ListView from the activity table
  populateActivities(db) {
    if (db == null) {
      return;
    }

    console.log('Populating Activities...');

    var self = this;

    db.executeSql("SELECT * FROM activity", [], function (resultSet) {
      var items = [];

      if (resultSet.rows != null && resultSet.rows.length > 0) {
        for (var i=0; i<resultSet.rows.length; i++) {
          var item = Platform.OS == "windows" ? resultSet.rows[i] : resultSet.rows.item(i);

          items.push(item);
        }
      }

      self.setState({dataSource: self.state.dataSource.cloneWithRows(items)});
    }, function(error) {console.log("error fetching activities")} );
  }

  allowScroll(scrollEnabled) {
    this.setState({ scrollEnabled: scrollEnabled });
  }

  // delete an activity from the activity table and reload the ListView
  deleteActivity(rowData) {
    var db = this.props.db;
    var self = this;

    if (db == null) {
      return;
    }

    db.executeSql("DELETE FROM activity where id = ?", [rowData.id], function (resultSet) {
     //reload data
     self.populateActivities(db);
   }, function(error){ console.log("error deleting activity"); });
  }

  // navigate to ViewActivity
  viewActivity(rowData) {
    this.props.navigator.push({
      id: 'ViewActivity',
      data: rowData
    });
  }

  // each row in the ListView responds to touches and swipes
  renderRow(rowData) {
    var swipeoutButtons = [
      {
        text: 'Delete',
        backgroundColor: 'red',
        underlayColor: 'rgba(0, 0, 0, 0.6)',
        onPress: () => { this.deleteActivity(rowData) }
      }
    ];

    return (
      <Swipeout right={swipeoutButtons}
        autoClose={true}
        backgroundColor= 'transparent'>
        <TouchableHighlight
          underlayColor='rgba(192,192,192,0.6)'
          onPress={this.viewActivity.bind(this, rowData)} >
          <View style={styles.liContainer}>
            <Text style={styles.li}>{rowData.type} - {rowData.dt} </Text>
          </View>
        </TouchableHighlight>
      </Swipeout>
    );
 }

 render() {
    return (
      <ListView
         dataSource={this.state.dataSource}
         enableEmptySections={true}
         renderRow={this.renderRow.bind(this)}
         style={styles.listview}
         renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator}/>}
       />
    );
  }
}

const styles = StyleSheet.create({
  listview: {
    flex: 1,
    alignSelf: 'stretch'
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
  },
  li: {
    backgroundColor: '#fff',
    borderBottomColor: '#eee',
    borderColor: 'transparent',
    borderWidth: 1,
    paddingLeft: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  liContainer: {
    flex: 2,
  }
});
