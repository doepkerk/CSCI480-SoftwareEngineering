

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

// Data for Previous 24 Hours for Chart.js
function updateChart() {
  async function fetchData() {
    const path = "/home/csci/speeds.json"
    const response = await fetch(path);

    const datapoints = await response.json();
    console.log(datapoints);
    return datapoints;
  };

  fetchData().then(datapoints => {
    const uploadData = datapoints[0].map(function (index) {
      return index.upload;
    })

    const downloadData = datapoints.map(function (index) {
      return index.download;
    })

    console.log(uploadData)
    console.log(downloadData)
    lineChart.config.data.labels = uploadData;
    lineChart.config.data.datasets[0].data = downloadData;
    lineChart.update();
  });
}

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
