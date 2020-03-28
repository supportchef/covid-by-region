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
};

const getData = (thisData) => ({
  labels: thisData.map((row) => row.t),
  datasets: [
    {
      label: 'Confirmed Cases',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(75,192,192,0.4)',
      borderColor: 'rgba(75,192,192,1)',
      borderCapStyle: 'butt',
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter',
      pointBorderColor: 'rgba(75,192,192,1)',
      pointBackgroundColor: '#fff',
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: 'rgba(75,192,192,1)',
      pointHoverBorderColor: 'rgba(220,220,220,1)',
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      spanGaps: false,
      data: thisData.map((row) => ({ y: row.confirm, x: row.t })),
    },
    {
      label: 'Deceased',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(255, 99, 132,0.4)',
      borderColor: 'rgba(255, 99, 132,1)',
      borderCapStyle: 'butt',
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter',
      pointBorderColor: 'rgba(255, 99, 132,1)',
      pointBackgroundColor: '#fff',
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: 'rgba(255, 99, 132,1)',
      pointHoverBorderColor: 'rgba(220,220,220,1)',
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      spanGaps: false,
      data: thisData.map((row) => ({ y: row.dead, x: row.t })),
    },
    {
      label: 'Active',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(247,239,153,0.4)',
      borderColor: 'rgba(247,239,153,1)',
      borderCapStyle: 'butt',
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter',
      pointBorderColor: 'rgba(247,239,153,1)',
      pointBackgroundColor: '#fff',
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: 'rgba(247,239,153,1)',
      pointHoverBorderColor: 'rgba(220,220,220,1)',
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      spanGaps: false,
      data: thisData.map((row) => ({ y: row.act, x: row.t })),
      hidden: true,
    },
    {
      label: 'Recovered',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(171,225,136,0.4)',
      borderColor: 'rgba(171,225,136,1)',
      borderCapStyle: 'butt',
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter',
      pointBorderColor: 'rgba(171,225,136,1)',
      pointBackgroundColor: '#fff',
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: 'rgba(171,225,136,1)',
      pointHoverBorderColor: 'rgba(220,220,220,1)',
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      spanGaps: false,
      data: thisData.map((row) => ({ y: row.rec, x: row.t })),
      hidden: true,
    },
  ],
});

export default class GraphData extends PureComponent {
  // constructor(props) {
  //   super(props);
  //   // this.state = initialState;
  // }

  render() {
    const { series } = this.props;
    const thisData = series.map((row) => {
      return { ...row, t: new Date(row.day) };
    });

    console.log('series', series);

    const data = getData(thisData);

    return <Line data={data} options={options} />;
  }
}
