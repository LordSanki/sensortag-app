function draw_chart(div_id, data_callback, chart_title, chart_units){
  var obj = '';
  $(div_id).highcharts({
    chart: {
      type: 'area',
      animation: Highcharts.svg, // don't animate in old IE
      marginRight: 10,
      events: {
        load: function () {
          // set up the updating of the chart each second
          var series = this.series[0];
          obj = setInterval(function () {
            var x = (new Date()).getTime(), // current time
            y = data_callback();
            series.addPoint([x, y], true, true);
          }, 1000);
        }
      }
    },
    title: {
      text: chart_title
    },
    xAxis: {
      type: 'datetime',
      tickPixelInterval: 150
    },
    yAxis: {
      title: {
        text: chart_units
      },
      plotLines: [{
        value: 0,
        width: 1,
        color: '#808080'
      }]
    },
    legend: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    series: [{
      name: chart_units,
      data: (function(){
              var data=[];
              for(var i=0; i<100; i++){
                data.push({x:(new Date()).getTime(),y:0});
              }
              return data;
            }())
    }]
  });
  return obj;
};


function destroyChart(div_id) {
  $(div_id).highcharts().destroy();
}

