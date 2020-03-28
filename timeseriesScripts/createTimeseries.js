const fs = require('fs');
const csv = require('csv-parser');
const { countryMapping, stateMapping } = require('./nameMapping');

const rawDataPath =
  '../COVID-19/csse_covid_19_data/csse_covid_19_daily_reports';
const timeseriesDataLocation = `../src/timeseriesData/`;
const joinChar = '$';

// Structure
// data: {
//   '': {
//     series: [{}]
//     subs: ['us', ...]
//   }
//   'us': {
//     series: [{}, {}],
//     subs: ['california', ...]
//   },
//   'us$california': {
//
//   }
// }

const getPrimaryKey = (dataRow) => {
  let { Country_Region, Province_State, Admin2 } = dataRow;
  if (!Province_State) {
    Province_State = dataRow['Province/State'];
    Country_Region = dataRow['Country/Region'];
  }

  if (!Admin2 && Province_State && Province_State.includes(', ')) {
    [Admin2, Province_State] = Province_State.split(', ');
  }

  if (Country_Region in countryMapping) {
    Country_Region = countryMapping[Country_Region];
  }
  if (Province_State in stateMapping) {
    Province_State = stateMapping[Province_State];
  }

  if (Admin2 && Admin2.endsWith('County')) {
    Admin2 = Admin2.replace(' County', '');
  }

  const pkArray = [Country_Region, Province_State, Admin2];
  return pkArray.filter((row) => !!row).join(joinChar);
};

const getSplitKey = (key) => {
  const splitKey = key.split(joinChar);
  const allButLast = splitKey.slice(0, -1);
  // console.log('allButLast', allButLast)
  const parentKey = allButLast.join(joinChar);
  if (key === '') {
    return [null, null];
  }
  return [parentKey, splitKey[splitKey.length - 1]];
};

const addRegionToAllData = (allTimeseries, key, subs) => {
  // Add all of the structure if the key hasn't been added yet
  if (!allTimeseries[key]) {
    allTimeseries[key] = { series: [], subs: subs };

    const [parentKey, childKey] = getSplitKey(key);
    if (parentKey !== null) {
      // console.log('parentKey', parentKey, 'childKey', childKey)
      addRegionToAllData(allTimeseries, parentKey, [childKey]);
    }
  } else if (subs.length > 0) {
    allTimeseries[key].subs = subs.concat(allTimeseries[key].subs);
  }
};

const parseIntSafe = (str) => {
  const newInt = parseInt(str);
  if (isNaN(newInt)) {
    return 0;
  }
  return newInt;
};

const addDataToSpecificRegion = (allTimeseries, key, dataRow, day) => {
  const confirm = parseIntSafe(dataRow['Confirmed']);
  const dead = parseIntSafe(dataRow['Deaths']);
  const rec = parseIntSafe(dataRow['Recovered']);
  const act = parseIntSafe(dataRow['Active']);

  const rowFound = allTimeseries[key].series.findIndex(
    (row) => row.day === day
  );
  if (rowFound === -1) {
    allTimeseries[key].series.push({
      confirm,
      dead,
      rec,
      act,
      day,
    });
  } else {
    const row = allTimeseries[key].series[rowFound];
    row.confirm += confirm;
    row.dead += dead;
    row.rec += rec;
    row.act += act;
  }

  const [parentKey] = getSplitKey(key);
  if (parentKey !== null) {
    addDataToSpecificRegion(allTimeseries, parentKey, dataRow, day);
  }
};

const addDataToTimeseries = (allTimeseries, dataRow, day) => {
  const primaryKey = getPrimaryKey(dataRow);
  addRegionToAllData(allTimeseries, primaryKey, []);
  addDataToSpecificRegion(allTimeseries, primaryKey, dataRow, day);
};

// Load all
const rawDataDates = fs.readdirSync(rawDataPath);

const onlyDates = rawDataDates.filter((fileName) => fileName.endsWith('.csv'));
// console.log(onlyDates)

const allTimeseries = {};

const dateCreatePromises = onlyDates.map((singleDateFile) => {
  return new Promise((accept) => {
    const readFilePath = `${rawDataPath}/${singleDateFile}`;
    const dateSegment = singleDateFile.split('.')[0];
    fs.createReadStream(readFilePath)
      .pipe(csv())
      .on('data', (dataRow) => {
        // console.log(dataRow)
        addDataToTimeseries(allTimeseries, dataRow, dateSegment);
      })
      .on('end', () => {
        accept();
      });
  });
});

// Depth 0: '' - Root
// Depth 1: 'Country'
// Depth 2: 'State'
// Depth 3: 'County'
const writeTsFile = (key, depth = 0) => {
  const fileName = key === '' ? 'index' : key;
  const data = allTimeseries[key];

  const filteredObjs = { [key]: allTimeseries[key] };

  if (!data) {
    console.log(`No data for key:"${key}"`);
  } else {
    data.subs.forEach((subDataField) => {
      const subKey = key === '' ? subDataField : key + joinChar + subDataField;

      if (depth <= 1) {
        writeTsFile(subKey, depth + 1);
      }

      filteredObjs[subKey] = allTimeseries[subKey];
    });
  }

  fs.writeFileSync(
    `${timeseriesDataLocation}${fileName}.json`,
    JSON.stringify(filteredObjs)
  );
};

const sortAllDates = () => {
  Object.keys(allTimeseries).forEach((key) => {
    const series = allTimeseries[key].series;
    const sortedWithDates = series
      .map((row) => {
        return { ...row, t: new Date(row.day) };
      })
      .sort((a, b) => b.t - a.t);

    // Yes we in place modify here, but shrug
    const sorted = sortedWithDates.map((row) => {
      delete row['t'];
      return row;
    });

    allTimeseries[key].series = sorted;
  });
};

Promise.all(dateCreatePromises).then(() => {
  sortAllDates();
  writeTsFile('');
});
