var map = {
  polyline: null,
  marker: null,
  googleMap: null,
  initMapContainer: function(gpsData) {
    var mapContainer = document.getElementById("activityMap");
    mapContainer.innerHTML = "";
    mapContainer.style.height = (window.screen.height/2 - 44) + "px";

    // Initialize the map view
    this.googleMap = plugin.google.maps.Map.getMap(mapContainer, {
      'controls': {
        'zoom': true
      },
      'gestures': {
        'scroll': true,
        'tilt': false,
        'rotate': false,
        'zoom': true
      }
    });

    this.googleMap.moveCamera({
      'target': new plugin.google.maps.LatLng(gpsData[0].lat, gpsData[0].lng),
      'zoom': 12
    });
    this.drawPolyline(gpsData);
  },
  drawPolyline: function(gpsData) {
    var self = this;

    var latLngs = gpsData.map(function(e) {
      return new plugin.google.maps.LatLng(e.lat, e.lng);
    });

    if (this.polyline != null) {
      this.polyline.remove();
    }

    this.googleMap.addPolyline({
      points: latLngs,
      'color' : '#FF0000',
      'width': 3,
      'geodesic': true
    }, function(polyline) {
      self.polyline = polyline;
    });
  },
  placeMarkerAt: function(lat, lng) {
    var self = this;
    var loc = new plugin.google.maps.LatLng(lat, lng);

    if (this.marker == null) {
      this.googleMap.addMarker({
        'position': loc
      }, function(marker) {
        self.marker = marker;
      });
    } else {
      this.marker.setPosition(loc);
    }
  },
  clearAllMapItems: function() {
    if (this.googleMap != null) {
      this.googleMap.clear();
      this.marker = null;
    }
  }
}
