import React, { PureComponent } from 'react';
import { Line } from 'react-chartjs-2';

const options = {
  scales: {
    xAxes: [
      {
        type: 'time',
        time: {
          displayFormats: {
            quarter: 'MMM YYYY',
          },
          unit: 'day',
        },
      },
    ],
    yAxes: [
      {
        // type: 'logarithmic',
        ticks: {
          // stepSize: 100000,
          callback: function (value) {
            var ranges = [
              { divider: 1e6, suffix: 'M' },
              { divider: 1e3, suffix: 'k' },
            ];
            function formatNumber(n) {
              for (var i = 0; i < ranges.length; i++) {
                if (n >= ranges[i].divider) {
                  return (n / ranges[i].divider).toString() + ranges[i].suffix;
                }
              }
              return n;
            }
            return formatNumber(value);
          },
        },
      },
    ],
  },
  legend: {
    display: false,
    position: 'bottom',
  },
};

const getData = (thisData, label, fieldName, rgb) => ({
  labels: thisData.map((row) => row.t),
  datasets: [
    {
      label: label,
      fill: false,
      lineTension: 0.1,
      backgroundColor: `rgba(${rgb},.4)`,
      borderColor: `rgba(${rgb},1)`,
      borderCapStyle: 'butt',
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter',
      pointBorderColor: `rgba(${rgb},1)`,
      pointBackgroundColor: '#fff',
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: `rgba(${rgb},1)`,
      pointHoverBorderColor: `rgba(${rgb},1)`,
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      spanGaps: false,
      data: thisData.map((row) => ({ y: row[fieldName], x: row.t })),
    },
  ],
});

export default class GraphData extends PureComponent {
  // constructor(props) {
  //   super(props);
  //   // this.state = initialState;
  // }

  render() {
    const { series, label, fieldName, rgb } = this.props;
    const thisData = series.map((row) => {
      return { ...row, t: new Date(row.day) };
    });

    console.log('series', series);

    const data = getData(thisData, label, fieldName, rgb);

    return <Line data={data} options={options} />;
  }
}
