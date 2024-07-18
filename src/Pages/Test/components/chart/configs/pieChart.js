const colors = ['#FF4560', '#775DD0', '#00E396', '#008FFB', '#FEB019', '#FF4560', '#775DD0', '#00E396'];

const pieChart = {
  options: {
    chart: {
      type: 'donut',
    },
    colors: colors,
    labels: ['John Doe', 'Joe Smith', 'Jake Williams', 'Amber', 'Peter Brown', 'Mary Evans', 'David Wilson', 'Lily Roberts'],
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  },
  series: [21, 22, 10, 28, 16, 21, 13, 30],
};

export default pieChart;
