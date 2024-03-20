"use strict"

// SIDEBAR TOGGLE

var sidebarOpen = false;
var sidebar = document.getElementById("sidebar");

function openSidebar() {
  if (!sidebarOpen) {
    sidebar.classList.add("sidebar-responsive");
    sidebarOpen = true;
  }
}

function closeSidebar() {
  if (sidebarOpen) {
    sidebar.classList.remove("sidebar-responsive")
    sidebarOpen = false;
  }
}

// REPORT DOWNLOAD PDF
function downloadPDFWithBrowserPrint() {
  window.print();
}
document.querySelector('#browserPrint').addEventListener('click', downloadPDFWithBrowserPrint);

// Data for Previous 24 Hours for Chart.js
function updateChart() {
  fetch('speeds.json')
    .then(response => response.json())
    .then(data => {
      // Extract relevant information
      var timestamps = data.map(entry => new Date(entry.timestamp).toLocaleTimeString());
      var downloadSpeeds = data.map(entry => entry.download);
      var uploadSpeeds = data.map(entry => entry.upload);

      //converts speeds from bits to Mb to 2 decimals
      function speedConversion(speeds){
        for(let i=0;i<speeds.length;i++){
          speeds[i]= speeds[i]/1000000;
          speeds[i]= speeds[i].toFixed(2);
        }
      }

      let hourlyDownload = [];
      let hourlyUpload = [];
      let hourly = [];

      // stores 24 hours worth of data into 3 arrays
      function getHourly(upload, download, hour) {
        for(let i=hour.length-1; i>(hour.length - 25);i--) {
          hourlyUpload.push(upload[i]);
          hourlyDownload.push(download[i]);
          hourly.push(hour[i]);
        };

        hourlyUpload.reverse();
        hourlyDownload.reverse();
        hourly.reverse();

        console.log(hourlyDownload);
        console.log(hourly);
      }

      speedConversion(downloadSpeeds);
      speedConversion(uploadSpeeds);
      getHourly(uploadSpeeds, downloadSpeeds, timestamps);
      console.log(timestamps);
      console.log(downloadSpeeds);
      console.log(uploadSpeeds);



      // CHARTS

      // line chart

      function setupChart(lineData, labels, chartTitle){
        var lineChartOptions = {
          series: [{
            name: "MBps",
            data: lineData
          }],
          chart: {
            height: 350,
            type: 'line',
            zoom: {
              enabled: false
            }
          },
          dataLabels: {
            enabled: false
          },
          stroke: {
            curve: 'smooth',
          },
          title: {
            text: chartTitle,
            align: 'left'
          },
          grid: {
            row: {
              colors: ['#212121', 'transparent'], // takes an array which will be repeated on columns
              opacity: 0.5
            },
          },
          xaxis: {
            categories: labels,
            labels: {
              style: {
                colors: "#FFFFFF"
              }
            }
          }
        };

        return lineChartOptions;
      }

      var downloadChart = new ApexCharts(document.querySelector("#download-chart"), setupChart(hourlyDownload, hourly, "Download Speeds"));
      var uploadChart = new ApexCharts(document.querySelector("#upload-chart"), setupChart(hourlyUpload, hourly, "Upload Speeds"));
      downloadChart.render();
      uploadChart.render();

    }).catch(error => console.error('Error fetching JSON:', error));
}

// Update charts for week.html
function updateWeekChart() {
  fetch('speeds.json')
    .then(response => response.json())
    .then(data => {
      // Reorder the data so that the most recent data is at the bottom
      data.reverse();

      // Extract relevant information
      var timestamps = data.map(entry => new Date(entry.timestamp));
      var downloadSpeeds = data.map(entry => entry.download);
      var uploadSpeeds = data.map(entry => entry.upload);

      // Find the most recent timestamp
      var mostRecentTimestamp = new Date(Math.max(...timestamps));
      console.log(mostRecentTimestamp);

      function speedConversion(speeds) {
        for (let i = 0; i < speeds.length; i++) {
          speeds[i] = speeds[i] / 1000000;
          speeds[i] = speeds[i].toFixed(2);
        }
      }

      // Function to calculate daily averages for the past 7 days
      function getPastWeekAverages(data, timestamps, mostRecentTimestamp) {
        let dailyDownload = [];
        let dailyUpload = [];
        let days = [];
        let currentDate = new Date(mostRecentTimestamp); // Start from the most recent timestamp

        for (let i = 0; i < 7; i++) {
          let sumDownload = 0;
          let sumUpload = 0;
          let count = 0;

          for (let j = 0; j < timestamps.length; j++) {
            if (timestamps[j].getDate() === currentDate.getDate()) {
              sumDownload += parseFloat(downloadSpeeds[j]);
              sumUpload += parseFloat(uploadSpeeds[j]);
              count++;
            }
          }

          if (count > 0) {
            dailyDownload.push((sumDownload / count).toFixed(2));
            dailyUpload.push((sumUpload / count).toFixed(2));
            days.push(currentDate.toLocaleDateString('en', { weekday: 'short' })); // Get 3-letter abbreviation of the day
          } else {
            // If no data available for the day, push NaN
            dailyDownload.push(NaN);
            dailyUpload.push(NaN);
            days.push(currentDate.toLocaleDateString('en', { weekday: 'short' })); // Get 3-letter abbreviation of the day
          }

          currentDate.setDate(currentDate.getDate() - 1); // Move to previous day
        }

        speedConversion(dailyDownload);
        speedConversion(dailyUpload);
        
        return {
          dailyDownload: dailyDownload.reverse(), // Reverse to maintain chronological order
          dailyUpload: dailyUpload.reverse(),
          days: days.reverse()
        };
      }

      let { dailyDownload, dailyUpload, days } = getPastWeekAverages(data, timestamps, mostRecentTimestamp);

      // CHARTS

      // Line chart setup
      function setupChart(lineData, labels, chartTitle) {
        var lineChartOptions = {
          series: [{
            name: "MBps",
            data: lineData
          }],
          chart: {
            height: 350,
            type: 'line',
            zoom: {
              enabled: false
            }
          },
          dataLabels: {
            enabled: false
          },
          stroke: {
            curve: 'smooth',
          },
          title: {
            text: chartTitle,
            align: 'left'
          },
          grid: {
            row: {
              colors: ['#212121', 'transparent'],
              opacity: 0.5
            },
          },
          xaxis: {
            categories: labels,
            labels: {
              style: {
                colors: "#FFFFFF"
              }
            }
          }
        };

        return lineChartOptions;
      }

      // Create charts
      var downloadChart = new ApexCharts(document.querySelector("#download-chart"), setupChart(dailyDownload, days, "Average Download Speeds (Mbps)"));
      var uploadChart = new ApexCharts(document.querySelector("#upload-chart"), setupChart(dailyUpload, days, "Average Upload Speeds (Mbps)"));
      downloadChart.render();
      uploadChart.render();

    }).catch(error => console.error('Error fetching JSON:', error));
}
