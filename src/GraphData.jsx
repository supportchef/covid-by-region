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
        scaleLabel: {
          display: startValue !== null,
          labelString: `Days since ${
            startValue && formatNumber(startValue)
          } cases`,
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
        const lbl = t[0].xLabel;
        if (typeof lbl === 'number') {
          const day = Math.abs(lbl) <= 1 ? 'day' : 'days';
          const startValueFmt = formatNumber(startValue);

          if (lbl > 0) {
            return `${lbl} ${day} since ${startValueFmt} cases`;
          } else if (lbl < 0) {
            return `${-lbl} ${day} until ${startValueFmt} cases`;
          }
          return `The day ${startValueFmt} cases occured`;
        }
        return moment(lbl).format('MMM Do YYYY');
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

const getDatasetData = (thisData, xAxis, fieldName, isLog) => {
  // Map to x + y cooridinates
  const data = thisData.map((row) => ({ y: row[fieldName], x: row.t }));

  // Add null values to graph ONLY if we're not in log mode
  // Log graphs have a bug where they still show null values
  // But we want to insert null values in general because it helps you
  // find places where data is missing
  // Todo: This is a _horrendous_ implementation - but low in line count :|
  if (!isLog) {
    xAxis.forEach((xTick) => {
      if (!data.some((row) => xValsEqual(row.x, xTick))) {
        data.push({ x: xTick, y: null });
      }
    });
  }

  // Sort by time
  const sortedData = data.sort((date1, date2) => date1.x - date2.x);
  return sortedData;
};

const getData = (
  allData,
  fieldName,
  seriesInfo,
  showSingleColor,
  startDate,
  startValue,
  isLog
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
        (row) => row[startValueFieldName] >= startValue
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
      data: getDatasetData(cleanedDataKeyed[key], xAxis, fieldName, isLog),
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
      startValue,
      isLog
    );
    console.log('data', data);

    return <Line data={data} options={getOptions(isLog, startValue)} />;
  }
}
