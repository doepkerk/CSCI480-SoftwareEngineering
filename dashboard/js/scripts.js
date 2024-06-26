// JS File
// Filename: scripts.js
// Authors: Reilly Cozette, Keith Doepker
// For more information on ApexCharts.js go to: https://apexcharts.com/docs/creating-first-javascript-chart/

"use strict"

// Sidebar Toggle
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

// Report download pdf
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

// Sets Format of Charts using ApexCharts.js
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

      // Formats times into: HH:MM 
      const formattedTimes = time.map(timestamp => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      let hourlyDownload = [];
      let hourlyUpload = [];
      let hourly = [];

      // Stores 24 hours worth of data into 3 arrays
      function getHourly(upload, download, hour) {
        for (let i = hour.length - 1; i > (hour.length - 25); i--) {
          hourlyUpload.push(upload[i]);
          hourlyDownload.push(download[i]);
          hourly.push(hour[i]);
        };

        hourlyUpload.reverse();
        hourlyDownload.reverse();
        hourly.reverse();
      }

      speedConversion(down);
      speedConversion(up);
      getHourly(up, down, formattedTimes);

      var downloadChart = new ApexCharts(document.querySelector("#download-chart"), setupChart(hourlyDownload, hourly, "Download Speeds"));
      var uploadChart = new ApexCharts(document.querySelector("#upload-chart"), setupChart(hourlyUpload, hourly, "Upload Speeds"));
      downloadChart.render();
      uploadChart.render();

    }).catch(error => console.error('Error fetching JSON:', error));
}

// Updates charts for speeds of past 7 days
function updateWeekChart() {
  // Parses data from JSON file into json object format.
  // Needed to convert into text because data was in format of one JSON object
  // per line instead of array of JSON objects.
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

      // Finds the most recent timestamp
      var mostRecentTimestamp = new Date(Math.max(...timestamps));

      speedConversion(down);
      speedConversion(up);

      // Calculates daily averages for the past 7 days
      function getPastWeekAverages(text, timestamps, mostRecentTimestamp) {
        let dailyDownload = [];
        let dailyUpload = [];
        let days = [];
        let currentDate = new Date(mostRecentTimestamp); // Starts from the most recent timestamp

        // Loop through each of the 7 days in week
        for (let i = 0; i < 7; i++) {
          let sumDownload = 0;
          let sumUpload = 0;
          let count = 0;

          // Gets the average speeds for each 24 hours
          for (let j = 0; j < timestamps.length; j++) {
            const timestampDate = new Date(timestamps[j]);
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

          // Averages are stored in appropriate arrays
          // Count should always equal 24
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

        // Reverse to maintain chronological order
        return {
          dailyDownload: dailyDownload.reverse(), 
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

      // Inserting data into the table
      const tableBody = document.getElementById("tableData");

      // Inserting data into the table body
      for (let i = 0; i < days.length; i++) {
        const newRow = document.createElement("tr");
        const newTimeStamp = document.createElement("td");
        const newUpload = document.createElement("td");
        const newDownload = document.createElement("td");

        newTimeStamp.textContent = days[i];
        newUpload.textContent = parseFloat(dailyUpload[i]) + " Mbps";
        newDownload.textContent = parseFloat(dailyDownload[i]) + " Mbps";

        [newTimeStamp, newUpload, newDownload].forEach(cell => {
          cell.style.border = "3px solid #212121";
          cell.style.textAlign = "center";
          cell.style.backgroundColor = "white";
          cell.style.boxShadow = "0 6px 7px -3px rgb(21,21,21)";
        });

        newRow.appendChild(newTimeStamp);
        newRow.appendChild(newUpload);
        newRow.appendChild(newDownload);

        tableBody.appendChild(newRow);
      }

      // Formatting/Styles for table
      const table = document.querySelector("tableData");
      table.style.border = "3px solid #212121";
      table.style.borderCollapse = "collapse";

    }).catch(error => console.error('Error fetching JSON:', error));
}

// Updates charts for speeds of current month
function updateMonthChart() {
  // JSON data is converted to text and parsed to JSON format
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

      if (currentMonthData.length === 0) {
        console.log('No data available for the current month.');
        return; // Exit function if no data for the current month
      }

      // Extract relevant information

      // Function to calculate daily averages for the month
      function getMonthAverages(text, timestamps) {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        let dailyDownload = [];
        let dailyUpload = [];
        let days = [];

        // Loop through each day of the month
        for (let i = 1; i <= new Date(currentYear, currentMonth, 0).getDate(); i++) {
          let sumDownload = 0;
          let sumUpload = 0;
          let count = 0;

          // Loop through 24 hours of each day and add to sum
          for (let j = 0; j < timestamps.length; j++) {
            const entryDate = new Date(timestamps[j]);
            if (entryDate.getFullYear() === currentYear && entryDate.getMonth() + 1 === currentMonth && entryDate.getDate() === i) {
              sumDownload += parseFloat(down[j]);
              sumUpload += parseFloat(up[j]);
              count++;
            }
          }
          // Calculate average of each day
          if (count > 0) {
            dailyDownload.push((sumDownload / count).toFixed(2));
            dailyUpload.push((sumUpload / count).toFixed(2));
            days.push(currentDate.toLocaleDateString('en', { month: 'short' }) + " " + i);
          } else {
            // If no data available for the day, push NaN
            dailyDownload.push(NaN);
            dailyUpload.push(NaN);
            days.push(currentDate.toLocaleDateString('en', { month: 'short' }) + " " + i);
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

      // Inserting data into the table
      const tableBody = document.getElementById("tableData");

      // Inserting data into the table body
      for (let i = 0; i < dailyUpload.length; i++) {
        if (!isNaN(dailyUpload[i]) && !isNaN(dailyDownload[i])) {
          const newRow = document.createElement("tr");
          const newTimeStamp = document.createElement("td");
          const newUpload = document.createElement("td");
          const newDownload = document.createElement("td");

          newTimeStamp.textContent = days[i];
          newUpload.textContent = parseFloat(dailyUpload[i]) + " Mbps";
          newDownload.textContent = parseFloat(dailyDownload[i]) + " Mbps";

          [newTimeStamp, newUpload, newDownload].forEach(cell => {
            cell.style.border = "3px solid #212121";
            cell.style.textAlign = "center";
            cell.style.backgroundColor = "white";
            cell.style.boxShadow = "0 6px 7px -3px rgb(21,21,21)";
          });

          newRow.appendChild(newTimeStamp);
          newRow.appendChild(newUpload);
          newRow.appendChild(newDownload);

          tableBody.appendChild(newRow);
        }
      }

      // Table styles
      const table = document.querySelector("tableData");
      table.style.border = "3px solid #212121";
      table.style.borderCollapse = "collapse";

    }).catch(error => console.error('Error fetching JSON:', error));
}

// Updates charts for Past 24 Hours
function updateReportPast24() {
  // JSON data is converted to text and parsed to JSON format
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

      // Inserting data into the table
      const tableBody = document.getElementById("tableData");

      // Inserting data into the table body
      for (let i = 0; i < hourlyUpload.length; i++) {
        const newRow = document.createElement("tr");
        const newTimeStamp = document.createElement("td");
        const newUpload = document.createElement("td");
        const newDownload = document.createElement("td");

        newTimeStamp.textContent = formattedTimes[i];
        newUpload.textContent = hourlyUpload[i] + " Mbps";
        newDownload.textContent = hourlyDownload[i] + " Mbps";

        [newTimeStamp, newUpload, newDownload].forEach(cell => {
          cell.style.border = "3px solid #212121";
          cell.style.textAlign = "center";
          cell.style.backgroundColor = "white";
          cell.style.boxShadow = "0 6px 7px -3px rgb(21,21,21)";
        });

        newRow.appendChild(newTimeStamp);
        newRow.appendChild(newUpload);
        newRow.appendChild(newDownload);

        tableBody.appendChild(newRow);
      }

      const table = document.querySelector("tableData");
      table.style.border = "3px solid #212121";
      table.style.borderCollapse = "collapse";

    }).catch(error => console.error('Error fetching JSON:', error));
}

// Update report tables for Past Week Averages
// Very similar to the updateWeekChart() function
function updateReportPastWeek() {
  // JSON data is converted to text and parsed to JSON format
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

// Updates report table for Past Month
function updateReportMonth() {
  // JSON data is converted to text and parsed to JSON format
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

      // Calculates daily averages for the month
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

      const downTD = documentj.getElementById("monthDownloadAverages");
      downTD.textContent = avgDownload + " Mbps";

    }).catch(error => console.error('Error fetching JSON:', error));
}
