import React, { PureComponent } from 'react';
import { getNameFromKey, formatNumber, formatNumberSuffix } from './dataLib';
import { Line } from 'react-chartjs-2';
import moment from 'moment';

const getOptions = (isLog, startValue) => ({
  scales: {
    xAxes: [
      {
        type: startValue === null ? 'time' : 'linear',
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
        type: isLog ? 'logarithmic' : 'linear',
        ticks: {
          // stepSize: 100000,
          callback: function (tick) {
            if (!isLog) {
              return formatNumberSuffix(tick);
            }
            var remain = tick / Math.pow(10, Math.floor(Math.log10(tick)));
            if (remain === 1 || remain === 2 || remain === 5) {
              return formatNumberSuffix(tick);
            }
            return '';
          },
        },
      },
    ],
  },
  legend: {
    display: false,
    position: 'bottom',
  },
  tooltips: {
    mode: 'index',
    position: 'nearest',
    intersect: true,
    callbacks: {
      label: (t, d) => {
        let label = '';
        label += d.datasets[t.datasetIndex].label || '';

        if (label) {
          label += ': ';
        }
        label += formatNumber(t.yLabel);
        return label;
      },
      title: (t) => {
        return moment(t[0].xLabel).format('MMM Do YYYY');
      },
    },
  },
});

const getXAxis = (data, isStartValue) => {
  let maxDate = null;
  let minDate = null;
  // console.log('Object.values(data)', Object.values(data));
  Object.values(data).forEach((data) => {
    data.forEach((row) => {
      if (minDate === null || row.t < minDate) {
        minDate = row.t;
      }
      if (maxDate === null || row.t > maxDate) {
        maxDate = row.t;
      }
    });
  });
  // console.log('maxDate', maxDate);
  const allDates = [minDate];
  while (allDates[allDates.length - 1] < maxDate) {
    let nextDate;
    if (isStartValue) {
      nextDate = allDates[allDates.length - 1] + 1;
    } else {
      nextDate = new Date(allDates[allDates.length - 1]);
      nextDate.setDate(nextDate.getDate() + 1);
    }
    allDates.push(nextDate);
  }
  return allDates;
};

const xValsEqual = (x1, x2) => {
  if (x1.getTime && x2.getTime) {
    return x1.getTime() === x2.getTime();
  }
  return x1 === x2;
};

// Todo: This is a horrendous implementation - but low in line count :|
const getDatasetData = (thisData, xAxis, fieldName) => {
  const data = thisData.map((row) => ({ y: row[fieldName], x: row.t }));
  xAxis.forEach((xTick) => {
    if (!data.some((row) => xValsEqual(row.x, xTick))) {
      data.push({ x: xTick, y: null });
      // console.log('Woo!');
    }
  });
  const sortedData = data.sort((date1, date2) => date1.x - date2.x);
  // console.log('sortedData', sortedData);
  return sortedData;
};

const getData = (
  allData,
  fieldName,
  seriesInfo,
  showSingleColor,
  startDate,
  startValue
) => {
  const cleanedDataKeyed = {};

  const isStartValue = startValue !== null;

  seriesInfo.forEach(([key, info]) => {
    // Normalize the data with timestamps we can interpret
    let cleanedData = allData[key].series
      .map((row) => {
        const [month, day, year] = row.day.split('-');
        return { ...row, t: new Date(year, month - 1, day) };
      })
      .reverse();

    if (startDate) {
      cleanedData = cleanedData.filter(
        (row) => row.t > startDate.clone().subtract(1, 'days')
      );
    }

    if (isStartValue) {
      const startValueFieldName = fieldName;
      let firstIndex = cleanedData.findIndex(
        (row) => row[startValueFieldName] > startValue
      );

      if (firstIndex === -1) {
        firstIndex = cleanedData.length - 1;
      }

      const timeStampValue = moment(cleanedData[firstIndex].t);
      cleanedData = cleanedData.map((row) => {
        return { ...row, t: -timeStampValue.diff(row.t, 'days') };
      });
    }

    cleanedDataKeyed[key] = cleanedData;
  });

  const xAxis = getXAxis(cleanedDataKeyed, isStartValue);

  const colorName = showSingleColor ? 'confirm' : fieldName;

  // console.log('xAxis', xAxis);
  return {
    labels: xAxis,
    datasets: seriesInfo.map(([key, info]) => ({
      label: info.label || getNameFromKey(key),
      fill: false,
      lineTension: 0.1,
      backgroundColor: `rgba(${info.color[colorName]},1)`,
      borderColor: `rgba(${info.color[colorName]},1)`,
      borderCapStyle: 'butt',
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter',
      hoverBackgroundColor: `rgba(${info.color[colorName]},1)`,
      pointBorderColor: `rgba(${info.color[colorName]},1)`,
      pointBackgroundColor: `rgba(${info.color[colorName]},1)`,
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: `rgba(${info.color[colorName]},1)`,
      pointHoverBorderColor: `rgba(${info.color[colorName]},1)`,
      pointHoverBorderWidth: 2,
      pointRadius: 2,
      pointHitRadius: 10,
      spanGaps: false,
      data: getDatasetData(cleanedDataKeyed[key], xAxis, fieldName),
    })),
  };
};

export default class GraphData extends PureComponent {
  render() {
    const {
      fieldName,
      allData,
      seriesInfo,
      isLog,
      showSingleColor,
      startDate,
      startValue,
    } = this.props;

    const data = getData(
      allData,
      fieldName,
      seriesInfo,
      showSingleColor,
      startDate,
      startValue
    );
    console.log('data', data);

    return <Line data={data} options={getOptions(isLog, startValue)} />;
  }
}
