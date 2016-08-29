var recorder = {
  currentActivityData: null,
  watchID: null,
  startRecording: function() {
    document.getElementById("recordActivityButton").style.display = "none";
    document.getElementById("stopActivityButton").style.display = "block";
    document.getElementById("activityProgress").innerHTML = "Recording...";
    this.currentActivityData = [];
    var prevTimestamp = 0;
    var self = this;

    function onSuccess(position) {
      // only record data if the timestamp
      // is at least 3 seconds later than the previous one
      if ((position.timestamp - prevTimestamp)/1000 >= 3) {
        self.currentActivityData.push(
          {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            alt: position.coords.altitude,
            timestamp: position.timestamp
          }
        );

        prevTimestamp = position.timestamp;
      }
    }

    function onError(error) {
        console.error('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }

    this.watchID = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true
    });
  },
  stopRecording: function(db) {
    navigator.geolocation.clearWatch(this.watchID);
    document.getElementById("recordActivityButton").style.display = "block";
    document.getElementById("stopActivityButton").style.display = "none";
    document.getElementById("activityProgress").innerHTML = "Stopped";
    var activityTypes = document.getElementById("activityType");
    var selectedActivityType = activityTypes.options[activityTypes.selectedIndex].value;
    var self = this;

    //save recorded activity data
    db.executeSql("SELECT MAX(id) as max_id from activity", [], function (resultSet) {
      var id = resultSet.rows.item(0).max_id + 1;
      var date = new Date();
      var dateStr = date.getFullYear() + "-" + pad((date.getMonth() + 1)) + "-" + pad(date.getDate());

      db.executeSql('INSERT INTO activity VALUES (?, ?, ?, ?)', [id, selectedActivityType, dateStr, JSON.stringify(self.currentActivityData)], function (resultSet) {
        console.log('saved new activity');
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
}
