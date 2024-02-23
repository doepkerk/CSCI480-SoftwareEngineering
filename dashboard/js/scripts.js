// SIDEBAR TOGGLE

var sidebarOpen = false;
var sidebar = document.getElementById("sidebar");

function openSidebar() {
    if(!sidebarOpen) {
        sidebar.classList.add("sidebar-responsive");
        sidebarOpen = true;
    }
}

function closeSidebar() {
    if(sidebarOpen) {
        sidebar.classList.remove("sidebar-responsive")
        sidebarOpen = false;
    }
}

// CHARTS

// line chart
var lineChartOptions = {
    series: [{
      name: "MBps",
      data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
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
    text: 'Internet Speeds',
    align: 'left'
  },
  grid: {
    row: {
      colors: ['#212121', 'transparent'], // takes an array which will be repeated on columns
      opacity: 0.5
    },
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    labels: {
        style: {
            colors: "#FFFFFF"
        }
    }
}
  };

  var chart = new ApexCharts(document.querySelector("#line-chart"), lineChartOptions);
  chart.render();