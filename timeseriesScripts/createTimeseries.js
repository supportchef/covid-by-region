const fs = require('fs');
const csv = require('csv-parser');
const { countryMapping, stateMapping } = require('./nameMapping');

const rawJhuDataPath =
  '../COVID-19/csse_covid_19_data/csse_covid_19_daily_reports';
// const rawNytStatePath = '../covid-19-data/us-states.csv';
const rawNytCountyPath = '../covid-19-data/us-counties.csv';
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

// String.prototype.hexEncode = function () {
//   var hex, i;

//   var result = '';
//   for (i = 0; i < this.length; i++) {
//     hex = this.charCodeAt(i).toString(16);
//     result += ('000' + hex).slice(-4);
//   }

//   return result;
// };

const readCountry = (dataRow) => {
  let { Country_Region } = dataRow;
  if (!Country_Region) {
    Country_Region = dataRow['Country/Region'];
  }

  if (Country_Region in countryMapping) {
    Country_Region = countryMapping[Country_Region];
  }
  return Country_Region;
};

const getPrimaryKey = (dataRow) => {
  let { Province_State, Admin2 } = dataRow;
  if (!Province_State) {
    // March 13th adds a zero width no break space.
    Province_State =
      dataRow['Province/State'] ||
      dataRow['\uFEFFProvince/State'] ||
      dataRow['state']; // NYT data
  }

  if (!Admin2 && Province_State && Province_State.includes(', ')) {
    [Admin2, Province_State] = Province_State.split(', ');
  }

  if (Province_State in stateMapping) {
    Province_State = stateMapping[Province_State];
  }

  if (Admin2 && Admin2.endsWith('County')) {
    Admin2 = Admin2.replace(' County', '');
  }

  if (!Admin2) {
    Admin2 = dataRow['county']; // NYT data
  }

  const Country_Region = readCountry(dataRow);

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

const parseIntSafe = (str, altStr) => {
  const newInt = parseInt(str);
  if (isNaN(newInt)) {
    if (altStr) {
      return parseIntSafe(altStr, null);
    }
    return 0;
  }
  return newInt;
};

const addDataToSpecificRegion = (
  allTimeseries,
  key,
  dataRow,
  day,
  dontAddToRoot
) => {
  const confirm = parseIntSafe(dataRow['Confirmed'], dataRow['cases']);
  const dead = parseIntSafe(dataRow['Deaths'], dataRow['deaths']);
  const rec = parseIntSafe(dataRow['Recovered']);
  const act = parseIntSafe(dataRow['Active']);

  const rowFound = allTimeseries[key].series.findIndex(
    (row) => row.day === day
  );

  // if (day === '03-13-2020') {
  //   console.log('key', key, 'rowFound', rowFound);
  // }

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
    if (!key.includes(joinChar) && dontAddToRoot) {
      // Don't add NYT to global data
      return;
    }
    // console.log('parentKey', parentKey, dontAddToRoot);
    addDataToSpecificRegion(
      allTimeseries,
      parentKey,
      dataRow,
      day,
      dontAddToRoot
    );
  }
};

const addDataToTimeseries = (allTimeseries, dataRow, day, dontAddToRoot) => {
  const primaryKey = getPrimaryKey(dataRow);
  // if (day === '03-13-2020') {
  //   console.log(
  //     'primaryKey',
  //     primaryKey,
  //     'state',
  //     dataRow['\uFEFFrovince/State']
  //   );
  //   const proposed = '\uFEFFProvince/State';
  //   console.log(proposed, proposed.hexEncode());
  //   Object.keys(dataRow).forEach((str) => {
  //     console.log(str, str.hexEncode());
  //   });
  // }
  addRegionToAllData(allTimeseries, primaryKey, []);
  addDataToSpecificRegion(
    allTimeseries,
    primaryKey,
    dataRow,
    day,
    dontAddToRoot
  );
};

// Load all
const rawDataDates = fs.readdirSync(rawJhuDataPath);

const onlyDates = rawDataDates.filter((fileName) => fileName.endsWith('.csv'));
console.log(onlyDates);

const allTimeseries = {};

// Read all John Hopkins data and insert into global object
const dateCreatePromises = onlyDates.map((singleDateFile) => {
  return new Promise((accept) => {
    const readFilePath = `${rawJhuDataPath}/${singleDateFile}`;
    const dateSegment = singleDateFile.split('.')[0];
    fs.createReadStream(readFilePath)
      .pipe(csv())
      .on('data', (dataRow) => {
        // if (dateSegment === '03-13-2020') {
        //   console.log(dataRow);
        // }
        if (readCountry(dataRow) === 'US') {
          dataRow['Country_Region'] = 'US (JHU)';
        }
        addDataToTimeseries(allTimeseries, dataRow, dateSegment);
      })
      .on('end', () => {
        accept();
      });
  });
});

const readNytData = () => {
  return new Promise((accept) => {
    fs.createReadStream(rawNytCountyPath)
      .pipe(csv())
      .on('data', (dataRow) => {
        dataRow['Country/Region'] = 'US';
        const [year, month, day] = dataRow['date'].split('-');
        const date = [month, day, year].join('-');
        const dontAddToRoot = true;
        addDataToTimeseries(allTimeseries, dataRow, date, dontAddToRoot);
      })
      .on('end', () => {
        accept();
      });
  });
};

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

      if (depth <= 1 && allTimeseries[subKey].subs.length > 0) {
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
  readNytData().then(() => {
    sortAllDates();
    writeTsFile('');
  });
});
