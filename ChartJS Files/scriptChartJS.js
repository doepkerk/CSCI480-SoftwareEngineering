"use strict"

// imports the local file to use on local server
import netSpeeds from "./speeds.json" assert {type: "json"};

// view the results in console of developer mode (F12) in browser
console.log(netSpeeds);

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

/* Data for Previous 24 Hours for Chart.js
function updateChart() {
  async function fetchData() {
    const path = "speeds.json"
    const response = await fetch(path);

    const datapoints = await response.json();
    console.log(datapoints);
    return datapoints;
  };

  fetchData().then(datapoints => {
    const uploadData = datapoints.map(function (index) {
      return index.upload;
    })

    const downloadData = datapoints.map(function (index) {
      return index.download;
    })

    const timeStampData = datapoints.map(function(index) {
      return index.timestamp;
    })

    console.log(uploadData);
    console.log(downloadData);
    console.log(timeStampData);
    lineChart.config.data.labels = timeStampData;
    lineChart.config.data.datasets[0].data = downloadData;
    lineChart.update();
  });
}*/

// CHARTS

// line chart
// setup 
const data = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [{
    label: 'Upload/Download Speeds',
    data: [18, 12, 6, 9, 12, 3, 9],
    backgroundColor: "#fdb94e",
    borderColor: "black",
    borderWidth: 1
  }]
};

// config 
const config = {
  type: 'line',
  data,
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
};

// render init block
const lineChart = new Chart(
  document.getElementById('line-chart'),
  config
);

// Instantly assign Chart.js version
const chartVersion = document.getElementById('chartVersion');
chartVersion.innerText = Chart.version;
