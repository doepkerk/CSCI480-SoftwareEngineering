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
        for(let i=0; i<24;i++) {
          hourlyUpload.push(upload[i]);
          hourlyDownload.push(download[i]);
          hourly.push(hour[i]);
        };

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
              colors: ['whitesmoke', 'transparent'], // takes an array which will be repeated on columns
              opacity: 0.5
            },
          },
          colors: ["#f38654"],
          xaxis: {
            categories: labels,
            labels: {
              style: {
                colors: "#black"
              }
            }
          }
        };

        return lineChartOptions;
      }

      var downloadChart = new ApexCharts(document.querySelector("#download-chart"), setupChart(hourlyDownload, hourly, "Download Speeds (Mbps)"));
      var uploadChart = new ApexCharts(document.querySelector("#upload-chart"), setupChart(hourlyUpload, hourly, "Upload Speeds (Mbps)"));
      downloadChart.render();
      uploadChart.render();

    }).catch(error => console.error('Error fetching JSON:', error));
}
