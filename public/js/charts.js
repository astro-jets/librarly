
const reportsPage = document.getElementById('books-borrowed');
const dashboardPage = document.getElementById('todays-stats');

if(reportsPage)
{
  function makeLineChart(elementId, data)
  {
    console.log(data);
    // Line chart
    const graphElement = document.getElementById(`${elementId}`);
    if(graphElement)
    {
      new Chart(graphElement, {
            type: "bar",
            data: {
              labels: [
                "Analysis & Design",
                "Networks",
                "Programming",
                "Business"
              ],
              datasets: [
                {
                  label: "This Week",
                  backgroundColor: window.theme.primary,
                  borderColor: window.theme.primary,
                  hoverBackgroundColor: window.theme.primary,
                  hoverBorderColor: window.theme.primary,
                  data: [data.analysis,data.networks,data.programming,data.business],
                  barPercentage: 0.75,
                  categoryPercentage: 0.5,
                },
              ],
            },
            options: {
              maintainAspectRatio: false,
              legend: {
                display: false,
              },
              scales: {
                yAxes: [
                  {
                    gridLines: {
                      display: false,
                    },
                    stacked: false,
                    ticks: {
                      stepSize: 20,
                    },
                  },
                ],
                xAxes: [
                  {
                    stacked: false,
                    gridLines: {
                      color: "transparent",
                    },
                  },
                ],
              },
            },
    });
    }
    // Line Chart
  }

    
  function getAllReports() {
    let http = new XMLHttpRequest()
      http.open('get','/reports/reports.json',true)
      http.send()
      http.onload = function(){
          if(this.readyState == 4 && this.status ==200)
          {
            let data = JSON.parse(this.responseText);
            makeLineChart('books-borrowed',data.loans);
            makeLineChart('books-created',data.books);
            makeLineChart('reservations',data.reservations);
            
          }
        }
  }

  getAllReports();
}

if(dashboardPage)
{
  function getDashboardReport() {
  let http = new XMLHttpRequest()
    http.open('get','/reports/dashboard.json',true)
    http.send()
    http.onload = function(){
        if(this.readyState == 4 && this.status ==200)
        {
          let data = JSON.parse(this.responseText);
          dashboardReport(data);
          
        }
      }
  }
  function dashboardReport(data)
  {
    new Chart(document.getElementById("todays-stats"), {
            type: "bar",
            data: {
              labels: [
                "Books Created",
                "Reservations",
                "Loans"
              ],
              datasets: [
                {
                  label: "Today",
                  backgroundColor: window.theme.primary,
                  borderColor: window.theme.primary,
                  hoverBackgroundColor: window.theme.primary,
                  hoverBorderColor: window.theme.primary,
                  data: [data.today.books,data.today.reservations,data.today.loans],
                  barPercentage: 0.75,
                  categoryPercentage: 0.5,
                },
              ],
            },
            options: {
              maintainAspectRatio: false,
              legend: {
                display: false,
              },
              scales: {
                yAxes: [
                  {
                    gridLines: {
                      display: false,
                    },
                    stacked: false,
                    ticks: {
                      stepSize: 20,
                    },
                  },
                ],
                xAxes: [
                  {
                    stacked: false,
                    gridLines: {
                      color: "transparent",
                    },
                  },
                ],
              },
            },
    });

    new Chart(document.getElementById("week-stats"), {
            type: "bar",
            data: {
              labels: [
                "Books Created",
                "Reservations",
                "Loans"
              ],
              datasets: [
                {
                  label: "This Week",
                  backgroundColor: window.theme.primary,
                  borderColor: window.theme.primary,
                  hoverBackgroundColor: window.theme.primary,
                  hoverBorderColor: window.theme.primary,
                  data: [data.today.week,data.week.reservations,data.week.loans],
                  barPercentage: 0.75,
                  categoryPercentage: 0.5,
                },
              ],
            },
            options: {
              maintainAspectRatio: false,
              legend: {
                display: false,
              },
              scales: {
                yAxes: [
                  {
                    gridLines: {
                      display: false,
                    },
                    stacked: false,
                    ticks: {
                      stepSize: 20,
                    },
                  },
                ],
                xAxes: [
                  {
                    stacked: false,
                    gridLines: {
                      color: "transparent",
                    },
                  },
                ],
              },
            },
    });

    
    new Chart(document.getElementById("month-stats"), {
            type: "bar",
            data: {
              labels: [
                "Books Created",
                "Reservations",
                "Loans"
              ],
              datasets: [
                {
                  label: "This Month",
                  backgroundColor: window.theme.primary,
                  borderColor: window.theme.primary,
                  hoverBackgroundColor: window.theme.primary,
                  hoverBorderColor: window.theme.primary,
                  data: [data.month.books,data.month.reservations,data.month.loans],
                  barPercentage: 0.75,
                  categoryPercentage: 0.5,
                },
              ],
            },
            options: {
              maintainAspectRatio: false,
              legend: {
                display: false,
              },
              scales: {
                yAxes: [
                  {
                    gridLines: {
                      display: false,
                    },
                    stacked: false,
                    ticks: {
                      stepSize: 20,
                    },
                  },
                ],
                xAxes: [
                  {
                    stacked: false,
                    gridLines: {
                      color: "transparent",
                    },
                  },
                ],
              },
            },
    });
  }
  getDashboardReport();
}

    