var app = {
    db: null,
    recordContainer: document.getElementById("record"),
    activitiesContainer: document.getElementById("activities"),
    activityDetailContainer: document.getElementById("activityDetail"),
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
      document.addEventListener('deviceready', this.onDeviceReady, false);

      var activitiesButton = document.getElementById("activitiesButton");
      activitiesButton.addEventListener('click', function(){
        map.clearAllMapItems();
        app.populateActivities();
        app.recordContainer.style.display = "none";
        app.activitiesContainer.style.display = "block";
        app.activityDetailContainer.style.display = "none";
      }, false);

      var recordButton = document.getElementById("recordButton");
      recordButton.addEventListener('click', function(){
        map.clearAllMapItems();
        app.recordContainer.style.display = "block";
        app.activitiesContainer.style.display = "none";
        app.activityDetailContainer.style.display = "none";
      }, false);

      var recordActivityButton = document.getElementById("recordActivityButton");
      recordActivityButton.addEventListener('click', function(){
        recorder.startRecording();
      }, false);

      var stopActivityButton = document.getElementById("stopActivityButton");
      stopActivityButton.addEventListener('click', function(){
        recorder.stopRecording(app.db);
      }, false);
  },
  // deviceready Event Handler
  //
  // The scope of 'this' is the event. In order to call the 'receivedEvent'
  // function, we must explicitly call 'app.receivedEvent(...);'
  onDeviceReady: function() {
    app.receivedEvent('deviceready');

    window.sqlitePlugin.echoTest(function() {
      console.log('ECHO test OK');
    });

    // initialize the DB and the app
    app.db = window.sqlitePlugin.openDatabase({
      name: 'superfit.db',
      iosDatabaseLocation: 'Documents'},
      function() {
        console.log("Successfully opened DB.");
        initDB();
      },
      function() {
        console.log("Failed to open DB.");
      });

      function initDB() {
        if (app.db != undefined) {
          app.db.sqlBatch([
            'CREATE TABLE IF NOT EXISTS activity (id, type, dt, gps_data)'
          ], function() {
            app.db.executeSql('SELECT * FROM activity', [], function (resultSet) {
              // insert test data if no data exists
              if (resultSet.rows.length == 0) {
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

                app.db.sqlBatch([
                  [ 'INSERT INTO activity VALUES (?, ?, ?, ?)', [1, 'Run', '2016-08-01', JSON.stringify(testGpsDataRun)]],
                  [ 'INSERT INTO activity VALUES (?, ?, ?, ?)', [2, 'Walk', '2016-08-02', JSON.stringify(testGpsDataWalk)]]
                ], function() {
                  app.populateActivities();
                  console.log('inserted test data');
                }, function(error) {
                  console.log('Error populating table: ' + error.message);
                });
              } else {
                app.populateActivities();
              }
            });
          }, function(error) {
            console.log('Error with initDB sequence: ' + error.message);
          });
        }
      }
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
      console.log('Received Event: ' + id);
    },
    populateActivities: function() {
      if (app.db == null) {
        return;
      }

      app.db.executeSql("SELECT * FROM activity", [], function (resultSet) {
        function buildTableRow(item) {
          var id = item.id;
          return "<tr id='view-activity-" + id + "'><td class='delete' id='delete-activity-" + id + "'>[X]</td><td>" + item.type + "</td><td>" + item.dt + "</td><td>&gt;&gt;</td></tr>";
        };

        var activityTable = document.getElementById("activityTable");
        var trContents = "";

        // build new table contents from query results
        for (var i=0; i<resultSet.rows.length; i++) {
          var item = resultSet.rows.item(i);

          trContents += buildTableRow(item);
        }

        // replace table contents with new data
        activityTable.innerHTML = trContents;

        // add click event listners to delete buttons to handle deletes
        var divs = document.querySelectorAll("#activityTable tr td.delete");
        for (var i = 0; i < divs.length; ++i) {
          divs[i].addEventListener('click', function(e){
            e.stopPropagation();
            app.deleteActivity(this.id);
          });
        }

        // add click event listeners to table rows view activity detail
        divs = document.querySelectorAll("#activityTable tr");
        for (var i = 0; i < divs.length; ++i) {
          divs[i].addEventListener('click', function(){
            app.viewActivity(this.id);
          });
        }
      });
    },
    viewActivity: function(id) {
      app.recordContainer.style.display = "none";
      app.activitiesContainer.style.display = "none";
      app.activityDetailContainer.style.display = "block";

      if (app.db == null) {
        return;
      }

      var idPrefix = "view-activity-";
      var activityId = parseInt(id.substring(idPrefix.length));

      app.db.executeSql("SELECT * FROM activity where id = ?", [activityId], function (resultSet) {
        var activityTitle = document.getElementById("activityTitle");
        var item = resultSet.rows.item(0);
        activityTitle.innerHTML = item.type + " - " + item.dt;

        var gpsData = JSON.parse(item.gps_data);

        var activityData = document.getElementById("activityData");
        activityData.innerHTML = "";

        // d3 click handler, adds interactivity to chart
        var handleClick = function(d, i) {
          //put marker on map for selected node
          map.placeMarkerAt(d.lat, d.lng);
        };

        // draw chart and initialize map
        chart.drawActivityChart(activityData, gpsData, handleClick);
        map.initMapContainer(gpsData);
      });
    },
    deleteActivity: function(id) {
      if (app.db == null) {
        return;
      }

      var activityId = parseInt(id.substring(16));

      app.db.executeSql("DELETE FROM activity where id = ?", [activityId], function (resultSet) {
        document.getElementById("activitiesButton").click();
      });
    }
};

app.initialize();
