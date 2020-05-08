//
// perf.js
//
// 2020 H. Dahle
//

// Create color array for charts
// 'color' is base color, 'num' is how many colors to create
// Resulting colors have hues evenly spaced in HSL color space
function mkColorArray(num, color) {
  // Color array for #222c3c: Use #db7f67 (coolors red in the palette)
  // Alternatively a little bit darker c8745e
  let c = d3.hsl(color === undefined ? '#c8745e' : color);
  let r = [];
  for (i = 0; i < num; i++) {
    r.push(c + "");
    c.h += (360 / num);
  }
  return r;
}
function colorArrayToAlpha(arr, alpha) {
  return arr.map(x => x.replace('rgb', 'rgba').replace(')', ',' + alpha + ')'));
}
function colorArrayMix(arr) {
  let res = [];
  for (let i = 0; i < arr.length; i++) {
    if (i % 2) {
      res.push(arr[i])
    } else {
      res.unshift(arr[i])
    }
  }
  return res;
}

// Chart.js global settings
Chart.defaults.global.defaultFontFamily = "'Roboto', sans-serif";
Chart.defaults.global.defaultFontColor = '#aaa';
Chart.defaults.global.elements.point.radius = 0;
Chart.defaults.global.elements.line.borderWidth = 1;
Chart.defaults.global.animation.duration = 0;
Chart.defaults.global.tooltips.backgroundColor = 'rgba(63,82,112,0.75)';//'#3f5270';// '#5e79a5';//'#222c3c';
Chart.defaults.global.tooltips.intersect = false;
Chart.defaults.global.tooltips.axis = 'x';
Chart.defaults.global.legend.labels.boxWidth = 6;
Chart.defaults.global.legend.labels.fontSize = 11;
Chart.defaults.global.legend.labels.fontColor = '#ddd';
Chart.defaults.global.legend.labels.padding = 6;
Chart.defaults.global.title.fontColor = '#ddd';
Chart.defaults.global.title.fontStyle = 'normal';
Chart.defaults.global.title.display = true;
Chart.defaults.global.legend.display = true;
Chart.defaults.global.aspectRatio = 1;
Chart.defaults.global.responsive = true;

// standard fetch helpers
function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response)
  } else {
    return Promise.reject(new Error(response.statusText))
  }
}
function json(response) {
  return response.json()
}


//
// Performance
//
function plotIsItUp(elmt, elmtSmall, url, testType = 'GET') {
  let myChart = [makeMultiLineChart(elmt, false), makeMultiLineChart(elmtSmall, true)];
  fetch(url)
    .then(status)
    .then(json)
    .then(results => {
      console.log('results:', results);
      let colors = mkColorArray(results.data.length);
      while (results.data.length) {
        let d = results.data.pop();
        let col = colors.pop();
        let dataset = {
          data: d.data.map(x => {
            if (testType === 'GET') return { t: x.time, y: x.transfer };
            return { t: x.time, y: x.connect }
          }),
          fill: false,
          borderColor: col,
          backgroundColor: col,
          showLine: true,
          label: d.loc
        };
        // JSON.parse(JSON.stringify(object)) makes a copy of the dataset
        // This should work for objects that do not contain functions
        // We need to have a separate copy of dataset for small and large displays
        // Otherwise we are not able to use different city names for small displays
        myChart.forEach(ch => ch.data.datasets.push(JSON.parse(JSON.stringify(dataset))));
      }
      // For the mobile chart, change names to short names
      myChart[1].data.datasets.forEach(x => {
        if (shortCityName[x.label] === undefined) return;
        x.label = shortCityName[x.label];
      });
      myChart.forEach(ch => ch.options.title.text = `${testType} in milliseconds`);
      myChart.forEach(ch => ch.update());
    })
    .catch(err => console.log(err))
}

const shortCityName = {
  tokyo: 'Tokyo',
  sydney: 'SYD',
  stockholm: 'STO',
  singapore: 'SGP',
  bangkok: 'BKK',
  newyork: 'NYC',
  oslo: 'OSL',
  frankfurt: 'FRA',
  seattle: 'SEA',
  bogota: 'Bogota',
  bangalore: 'Bangalore',
  london: 'LON'
};

function makeMultiLineChart(canvas, small) {
  return new Chart(document.getElementById(canvas), {
    type: 'line',
    options: {
      tooltips: {
        enabled: small ? false : true
      },
      aspectRatio: small ? 1 : 2.4,
      legend: {
        display: true,
        position: small ? 'top' : 'right',
      },
      scales: {
        yAxes: [{
          gridLines: {
            color: '#444'
          },
          ticks: {
            fontColor: '#888',
            //callback: v => v ? v + 'ms' : v
          },
        }],
        xAxes: [{
          gridLines: {
            color: '#333'
          },
          type: 'time',
          time: {
            unit: 'hour',
            displayFormats: {
              hour: 'dd HH'
            }
          },
          ticks: {
            fontColor: '#888'
          }
        }]
      }
    }
  })
}




