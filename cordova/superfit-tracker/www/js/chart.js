var chart = {
  drawActivityChart: function(container, gpsData, clickHandler) {
    var data = prepareData(gpsData);

    var margin = {top: 5, right: 20, bottom: 20, left: 50},
        width = window.screen.width - margin.left - margin.right,
        height = window.screen.height/2 - 100 - margin.top - margin.bottom;

    var formatDate = d3.timeFormat("%M:%S");

    var x = d3.scaleLinear()
        .range([0, width]);

    var y = d3.scaleLinear()
        .range([height, 0]);

    var tickValues = data.map(function(e){
      return e.distance;
    });

    var xAxis = d3.axisBottom().scale(x);

    var yAxis = d3.axisLeft().scale(y);

    var line = d3.line()
        .x(function(d) { return x(d.distance); })
        .y(function(d) { return y(d.speed); });

    var svg = d3.select(container).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x.domain(d3.extent(data, function(d) { return d.distance; }));
      y.domain(d3.extent(data, function(d) { return d.speed; }));

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Speed");

      svg.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", line);

      var sideLength = 25;

      //transparent nodes for each data point, meant for interactivity
      svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.distance) - sideLength/2; })
        .attr("y", function(d) { return y(d.speed) - sideLength/2; })
        .attr("width", sideLength)
        .attr("height", sideLength)
        .attr('fill-opacity', 0.0)
        .style('fill', "steelblue")
        .on("click", clickHandler);

      //axis labels
      svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height - 6)
        .style("font-size","10px")
        .text("Dist (KM)");

      svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .style("font-size","10px")
        .text("Speed (KM/H)");

      //returns scaled down array used to plot data on chart
      function prepareData(gpsData) {
        var data = [];
        //plot no more than 100 data points
        var scaleBy = gpsData.length/100;

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
}
