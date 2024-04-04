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

// Converts speeds to Mbps from bps
function speedConversion(speeds) {
  for (let i = 0; i < speeds.length; i++) {
    speeds[i] = (speeds[i] / 1000000).toFixed(2);
  }
}

function setupChart(lineData, labels, chartTitle) {
  var lineChartOptions = {
    series: [{
      name: "Mbps",
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
        opacity: 0.1
      },
    },
    xaxis: {
      categories: labels,
      labels: {
        style: {
          colors: "#000000"
        }
      }
    }
  };

  return lineChartOptions;
}

// Updates charts for speeds of past 24 hours
function updateChart() {
  fetch('speeds.json')
    .then(response => response.text())
    .then(text => {

      const lines = text.split('\n');

      let time = [];
      let down = [];
      let up = [];

      lines.forEach(line => {
        try {
          const jsonObject = JSON.parse(line);

          time.push(jsonObject.timestamp);
          down.push(jsonObject.download);
          up.push(jsonObject.upload);

        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      });

      const formattedTimes = time.map(timestamp => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      console.log(formattedTimes);

      let hourlyDownload = [];
      let hourlyUpload = [];
      let hourly = [];

      // stores 24 hours worth of data into 3 arrays
      function getHourly(upload, download, hour) {
        for (let i = hour.length - 1; i > (hour.length - 25); i--) {
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

      speedConversion(down);
      speedConversion(up);
      getHourly(up, down, formattedTimes);
      console.log(formattedTimes);
      console.log(down);
      console.log(up);

      var downloadChart = new ApexCharts(document.querySelector("#download-chart"), setupChart(hourlyDownload, hourly, "Download Speeds"));
      var uploadChart = new ApexCharts(document.querySelector("#upload-chart"), setupChart(hourlyUpload, hourly, "Upload Speeds"));
      downloadChart.render();
      uploadChart.render();

    }).catch(error => console.error('Error fetching JSON:', error));
}

// Update charts for speeds of past 7 days
function updateWeekChart() {
  fetch('speeds.json')
    .then(response => response.text())
    .then(text => {

      const lines = text.split('\n');

      let time = [];
      let down = [];
      let up = [];

      lines.forEach(line => {
        try {
          const jsonObject = JSON.parse(line);

          time.push(jsonObject.timestamp);
          down.push(jsonObject.download);
          up.push(jsonObject.upload);

        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      });

      const timestamps = time.map(timestamp => new Date(timestamp));

      // Find the most recent timestamp
      var mostRecentTimestamp = new Date(Math.max(...timestamps));

      speedConversion(down);
      speedConversion(up);

      // Function to calculate daily averages for the past 7 days
      function getPastWeekAverages(text, timestamps, mostRecentTimestamp) {
        let dailyDownload = [];
        let dailyUpload = [];
        let days = [];
        let currentDate = new Date(mostRecentTimestamp); // Start from the most recent timestamp

        for (let i = 0; i < 7; i++) {
          let sumDownload = 0;
          let sumUpload = 0;
          let count = 0;

          for (let j = 0; j < timestamps.length; j++) {
            const timestampDate = new Date(timestamps[j]);
            console.log(currentDate);
            console.log(timestampDate);
            if (
              timestampDate.getDate() === currentDate.getDate() &&
              timestampDate.getMonth() === currentDate.getMonth() &&
              timestampDate.getFullYear() === currentDate.getFullYear()
            ) {
              sumDownload += parseFloat(down[j]);
              sumUpload += parseFloat(up[j]);
              count++;
            }
          }

          if (count > 0) {
            dailyDownload.push((sumDownload / count).toFixed(2));
            dailyUpload.push((sumUpload / count).toFixed(2));
            days.push(currentDate.toLocaleDateString('en', { weekday: 'short', month: 'short', day: '2-digit' })); // Get 3-letter abbreviation of the day
          } else {
            // If no data available for the day, push NaN
            dailyDownload.push(NaN);
            dailyUpload.push(NaN);
            days.push(currentDate.toLocaleDateString('en', { weekday: 'short' })); // Get 3-letter abbreviation of the day
          }

          currentDate.setDate(currentDate.getDate() - 1); // Move to previous day
        }

        return {
          dailyDownload: dailyDownload.reverse(), // Reverse to maintain chronological order
          dailyUpload: dailyUpload.reverse(),
          days: days.reverse()
        };
      }

      let { dailyDownload, dailyUpload, days } = getPastWeekAverages(text, time, mostRecentTimestamp);

      // Create charts
      var downloadChart = new ApexCharts(document.querySelector("#download-chart"), setupChart(dailyDownload, days, "Average Download Speeds (Mbps)"));
      var uploadChart = new ApexCharts(document.querySelector("#upload-chart"), setupChart(dailyUpload, days, "Average Upload Speeds (Mbps)"));
      downloadChart.render();
      uploadChart.render();

    }).catch(error => console.error('Error fetching JSON:', error));
}

// Updates charts for speeds of current month
function updateMonthChart() {
  fetch('speeds.json')
    .then(response => response.text())
    .then(text => {

      const lines = text.split('\n');

      let time = [];
      let down = [];
      let up = [];

      lines.forEach(line => {
        try {
          const jsonObject = JSON.parse(line);

          time.push(jsonObject.timestamp);
          down.push(jsonObject.download);
          up.push(jsonObject.upload);

        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      });

      const timestamps = time.map(timestamp => new Date(timestamp));

      // Filter data for the current month
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      const currentMonthData = lines
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (error) {
            console.error('Error parsing JSON:', error);
            return null;
          }
        })
        .filter(entry => {
          if (!entry) return false;
          const entryDate = new Date(entry.timestamp);
          return entryDate.getFullYear() === currentYear && entryDate.getMonth() + 1 === currentMonth;
        });

      // Extract relevant information

      // Function to calculate daily averages for the month
      function getMonthAverages(text, timestamps) {
        let dailyDownload = [];
        let dailyUpload = [];
        let days = [];

        for (let i = 1; i <= new Date(currentYear, currentMonth, 0).getDate(); i++) {
          let sumDownload = 0;
          let sumUpload = 0;
          let count = 0;

          for (let j = 0; j < timestamps.length; j++) {
            if (timestamps[j].getDate() === i) {
              sumDownload += parseFloat(down[j]);
              sumUpload += parseFloat(up[j]);
              count++;
            }
          }

          if (count > 0) {
            dailyDownload.push((sumDownload / count).toFixed(2));
            dailyUpload.push((sumUpload / count).toFixed(2));
            days.push(timestamps[i].toLocaleDateString('en', { month: 'short' }) + " " + i);
          } else {
            // If no data available for the day, push NaN
            dailyDownload.push(NaN);
            dailyUpload.push(NaN);
            days.push(timestamps[i].toLocaleDateString('en', { month: 'short' }) + " " + i);
          }
        }

        speedConversion(dailyDownload);
        speedConversion(dailyUpload);

        return {
          dailyDownload: dailyDownload,
          dailyUpload: dailyUpload,
          days: days
        };
      }

      let { dailyDownload, dailyUpload, days } = getMonthAverages(currentMonthData, timestamps);

      // Create charts
      var downloadChart = new ApexCharts(document.querySelector("#download-chart"), setupChart(dailyDownload, days, "Average Download Speeds (Mbps)"));
      var uploadChart = new ApexCharts(document.querySelector("#upload-chart"), setupChart(dailyUpload, days, "Average Upload Speeds (Mbps)"));
      downloadChart.render();
      uploadChart.render();

    }).catch(error => console.error('Error fetching JSON:', error));
}

function updateReportPast24() {
  fetch('speeds.json')
    .then(response => response.text())
    .then(text => {
      const lines = text.split('\n');

      let time = [];
      let down = [];
      let up = [];

      lines.forEach(line => {
        try {
          const jsonObject = JSON.parse(line);
          // Assuming each line is a JSON object with properties 'timestamp', 'download', and 'upload'
          time.push(jsonObject.timestamp);
          down.push(jsonObject.download);
          up.push(jsonObject.upload);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      });

      const formattedTimes = time.map(timestamp => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      speedConversion(down);
      speedConversion(up);

      let hourlyDownload = [];
      let hourlyUpload = [];

      let sumUpload = 0;
      let sumDownload = 0;

      // stores 24 hours worth of data into 2 arrays
      function getSumHourly(upload, download, hour) {
        for (let i = hour.length - 1; i > (hour.length - 25); i--) {
          hourlyUpload.push(parseFloat(upload[i]));
          hourlyDownload.push(parseFloat(download[i]));
        };

        //sum all hourly upload and hourlydownload
        for (let i = 0; i < hourlyUpload.length; i++) {
          sumUpload += (hourlyUpload[i])
          sumDownload += (hourlyDownload[i])
        };
      }

      getSumHourly(up, down, formattedTimes);

      const avgUpload = (sumUpload / 24).toFixed(2);
      const avgDownload = (sumDownload / 24).toFixed(2);

      const upTD = document.getElementById("dayUploadAverages");
      upTD.textContent = avgUpload + " Mbps";

      const downTD = document.getElementById("dayDownloadAverages");
      downTD.textContent = avgDownload + " Mbps";

    }).catch(error => console.error('Error fetching JSON:', error));
}

// Update Report for Past Week Averages
function updateReportPastWeek() {
  fetch('speeds.json')
    .then(response => response.text())
    .then(text => {

      const lines = text.split('\n');

      let time = [];
      let down = [];
      let up = [];

      lines.forEach(line => {
        try {
          const jsonObject = JSON.parse(line);

          time.push(jsonObject.timestamp);
          down.push(jsonObject.download);
          up.push(jsonObject.upload);

        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      });

      const timestamps = time.map(timestamp => new Date(timestamp));

      // Find the most recent timestamp
      var mostRecentTimestamp = new Date(Math.max(...timestamps));

      speedConversion(down);
      speedConversion(up);

      // Function to calculate daily averages for the past 7 days
      function getPastWeekAverages(timestamps, mostRecentTimestamp) {
        let currentDate = new Date(mostRecentTimestamp); // Start from the most recent timestamp

        let sumUpAverage = 0;
        let sumDownAverage = 0;
        let count = 0;

        for (let i = 0; i < 7; i++) {

          for (let j = 0; j < timestamps.length; j++) {
            const timestampDate = new Date(timestamps[j]);
            if (
              timestampDate.getDate() === currentDate.getDate() &&
              timestampDate.getMonth() === currentDate.getMonth() &&
              timestampDate.getFullYear() === currentDate.getFullYear()
            ) {
              sumDownAverage += parseFloat(down[j]);
              sumUpAverage += parseFloat(up[j]);
              count++;
            }
          }
          currentDate.setDate(currentDate.getDate() - 1); // Move to previous day
        }

        const avgUpload = (sumUpAverage / count).toFixed(2);
        const avgDownload = (sumDownAverage / count).toFixed(2);

        const upTD = document.getElementById("weekUploadAverages");
        upTD.textContent = avgUpload + " Mbps";

        const downTD = document.getElementById("weekDownloadAverages");
        downTD.textContent = avgDownload + " Mbps";
      }

      getPastWeekAverages(timestamps, mostRecentTimestamp);

    }).catch(error => console.error('Error fetching JSON:', error));
}

function updateReportMonth() {
  fetch('speeds.json')
    .then(response => response.text())
    .then(text => {

      const lines = text.split('\n');

      let time = [];
      let down = [];
      let up = [];

      lines.forEach(line => {
        try {
          const jsonObject = JSON.parse(line);

          time.push(jsonObject.timestamp);
          down.push(jsonObject.download);
          up.push(jsonObject.upload);

        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      });

      const timestamps = time.map(timestamp => new Date(timestamp));

      // Filter data for the current month
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      const currentMonthData = lines
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (error) {
            console.error('Error parsing JSON:', error);
            return null;
          }
        })
        .filter(entry => {
          if (!entry) return false;
          const entryDate = new Date(entry.timestamp);
          return entryDate.getFullYear() === currentYear && entryDate.getMonth() + 1 === currentMonth;
        });

      // Extract relevant information

      speedConversion(up);
      speedConversion(down);

      let sumDownAverage = 0;
      let sumUpAverage = 0;
      let count = 0;

      // Function to calculate daily averages for the month
      function getMonthAverages(text, timestamps) {

        for (let i = 1; i <= new Date(currentYear, currentMonth, 0).getDate(); i++) {

          for (let j = 0; j < timestamps.length; j++) {
            if (timestamps[j].getDate() === i) {
              sumDownAverage += parseFloat(down[j]);
              sumUpAverage += parseFloat(up[j]);
              count++;
            }
          }
        }
      }

      getMonthAverages(currentMonthData, timestamps);

      const avgUpload = (sumUpAverage / count).toFixed(2);
      const avgDownload = (sumDownAverage / count).toFixed(2);

      const upTD = document.getElementById("monthUploadAverages");
      upTD.textContent = avgUpload + " Mbps";

      const downTD = document.getElementById("monthDownloadAverages");
      downTD.textContent = avgDownload + " Mbps";

    }).catch(error => console.error('Error fetching JSON:', error));
}
