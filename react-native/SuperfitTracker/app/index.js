import React, { Component } from 'react';
import { StyleSheet, Navigator, View } from 'react-native';
import ScrollableTabView, {ScrollableTabBar} from 'react-native-scrollable-tab-view';

import ActivityList from './ActivityList';
import ViewActivity from './ViewActivity';
import RecordActivity from './RecordActivity';

//setup DB first
let SQLite = require('react-native-sqlite-storage');
let DB = SQLite.openDatabase({
          name: 'superfit.db',
          location: 'Documents'},
          function() {
            console.log("Successfully opened DB.");
          },
          function() {
            console.log("Failed to open DB.");
          });

// renders a ScrollableTabView with 2 tabs: 'Activies' and 'Record'
class TabView extends Component {
  _onChangeTab(object) {
    if (object.ref.ref === "activities") {
      var activityList = this.refs.activities.refs.activityList;
      activityList.populateActivities(DB);
    }
  }

  render() {
    return (
      <ScrollableTabView
        locked={true}
        scrollWithoutAnimation={true}
        tabBarUnderlineColor='#F5FCFF'
        style={{marginTop: 20, }}
        onChangeTab={this._onChangeTab.bind(this)}
        renderTabBar={() => <ScrollableTabBar />}>
        <Navigator
          tabLabel='Activities'
          ref='activities'
          initialRoute={{id: 'first'}}
          renderScene={this.renderScene.bind(this)} />
        <RecordActivity tabLabel='Record' ref='record' db={DB} />
      </ScrollableTabView>
    );
  }

  renderScene(route, navigator) {
    switch (route.id) {
      case 'ViewActivity':
        return (<ViewActivity navigator={navigator} title="Activity Detail" data={route.data} />);
      default:
        return (<ActivityList navigator={navigator} ref="activityList" db={DB} />);
    }
  }
}

// The 'main' class of the application, simply renders the TabView component
export default class SuperfitTracker extends Component {
  render() {
    return (
      <View style={styles.container}>
        <TabView/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    flexDirection: 'column'
  }
});
