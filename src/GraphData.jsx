import React, { PureComponent } from 'react';
import {
  getNameFromKey,
  formatNumber,
  formatNumberSuffix,
  getColor,
  categoryNameMapping,
  ensureDataHasFieldName,
} from './dataLib';
import { Line } from 'react-chartjs-2';
import moment from 'moment';

const getOptions = (isLog, startValue, startType) => ({
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
          } ${categoryNameMapping(startType)}`,
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
              if (Math.floor(tick) !== tick) {
                return '';
              }
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

          const casesLbl = categoryNameMapping(startType);

          if (lbl > 0) {
            return `${lbl} ${day} since ${startValueFmt} ${casesLbl}`;
          } else if (lbl < 0) {
            return `${-lbl} ${day} until ${startValueFmt} ${casesLbl}`;
          }
          return `The day ${startValueFmt} ${casesLbl} occured`;
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

// This is a really stupid fix
// We overlay as many points as needed on top of the next point because:
//  - log scales don't properly skip over NaN points
//  - Tooltips actually work by index-into-the array count
//
// Our fix works by just stacking a bunch of points on the nearest value
// as needed. (only in log mode)
const getNextPair = (data, xTick) => {
  let closestPairIdx = -1;
  data.forEach((dataPair, idx) => {
    if (dataPair.x > xTick) {
      if (closestPairIdx === -1 || dataPair.x < data[closestPairIdx].x) {
        closestPairIdx = idx;
      }
    }
  });
  return closestPairIdx;
};

const getDatasetData = (thisData, xAxis, fieldName, isLog) => {
  // Map to x + y cooridinates
  const data = thisData.map((row) => ({ y: row[fieldName], x: row.t }));

  // Add null values to graph ONLY if we're not in log mode
  // Log graphs have a bug where they still show null values
  // But we want to insert null values in general because it helps you
  // find places where data is missing
  // Todo: This is a _horrendous_ implementation - but low in line count :|
  xAxis.forEach((xTick) => {
    if (!data.some((row) => xValsEqual(row.x, xTick))) {
      if (!isLog) {
        data.push({ x: xTick, y: null });
      } else {
        const nextPairIdx = getNextPair(data, xTick);
        if (nextPairIdx !== -1) {
          data.push(data[nextPairIdx]);
        }
      }
    }
  });

  // Sort by time
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
  startValue,
  lastNDays,
  isLog,
  startType,
  graphIndex
) => {
  const cleanedDataKeyed = {};

  const isStartValue = startValue !== null;

  const seriesInfoSafe = seriesInfo.filter(([key, info]) => {
    return !!allData[key];
  });

  seriesInfoSafe.forEach(([key, info]) => {
    if (!allData[key]) {
      return;
    }

    // Normalize the data with timestamps we can interpret
    let cleanedData = allData[key].series
      .map((row) => {
        const [month, day, year] = row.day.split('-');
        return { ...row, t: new Date(year, month - 1, day) };
      })
      .reverse();

    // This also computes relative data (i.e. New Cases per day) so compute those values before
    // trimming by `startDate`.
    ensureDataHasFieldName(cleanedData, fieldName);

    // Filter out results before a certain date
    if (startDate) {
      cleanedData = cleanedData.filter(
        (row) => row.t > startDate.clone().subtract(1, 'days')
      );
    }

    if (lastNDays) {
      cleanedData = cleanedData.filter(
        (row) => row.t > moment().subtract(lastNDays, 'days')
      );
    }

    // Shift things to start from the same Y axis value
    if (isStartValue) {
      const startValueFieldName = startType;
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
  // console.log('xAxis', xAxis);

  const colorIndex = showSingleColor ? 0 : graphIndex;

  // console.log('xAxis', xAxis);
  return {
    labels: xAxis,
    datasets: seriesInfoSafe.map(([key, info]) => ({
      // We need to add the length to this because if we don't, then
      // if the length changes between two sets with multiple points, everything will crash
      // (eg: Santa Clara pined and NZ selected will consistently crash on reload without this)
      label: `${getNameFromKey(key)} len(${xAxis.length})`,
      fill: false,
      lineTension: 0.1,
      backgroundColor: `rgba(${getColor(info.color)[colorIndex]},1)`,
      borderColor: `rgba(${getColor(info.color)[colorIndex]},1)`,
      borderCapStyle: 'butt',
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter',
      hoverBackgroundColor: `rgba(${getColor(info.color)[colorIndex]},1)`,
      pointBorderColor: `rgba(${getColor(info.color)[colorIndex]},1)`,
      pointBackgroundColor: `rgba(${getColor(info.color)[colorIndex]},1)`,
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: `rgba(${getColor(info.color)[colorIndex]},1)`,
      pointHoverBorderColor: `rgba(${getColor(info.color)[colorIndex]},1)`,
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
      startType,
      lastNDays,
      graphIndex,
    } = this.props;

    const safeStartType = startType !== '' ? startType : fieldName;

    const data = getData(
      allData,
      fieldName,
      seriesInfo,
      showSingleColor,
      startDate,
      startValue,
      lastNDays,
      isLog,
      safeStartType,
      graphIndex
    );

    // console.log('data', data);

    return (
      <Line
        data={data}
        options={getOptions(isLog, startValue, safeStartType)}
      />
    );
  }
}
