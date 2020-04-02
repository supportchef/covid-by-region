export const staticGroupings = {
  '!US minus NY': {
    add: ['US'],
    subtract: ['US$New York'],
  },
};

export const isGrouping = (candidate) => {
  return candidate.charAt(0) === '!';
};

export const groupingToRegularName = (groupName) => {
  return groupName.slice(1);
};

const getAllGroups = (customGroups) => {
  let allGroups = staticGroupings;
  if (customGroups) {
    allGroups = { ...staticGroupings, ...customGroups };
  }
  return allGroups;
};

export const getSelectedGroups = (selectedGroups, customGroups) => {
  const allGroups = getAllGroups(customGroups);

  const filteredGroups = {};
  selectedGroups.forEach((groupKey) => {
    if (allGroups[groupKey]) {
      filteredGroups[groupKey] = allGroups[groupKey];
    }
  });
  return filteredGroups;
};

export const getKeysInGroup = (groupKey, customGroups) => {
  const allGroups = getAllGroups(customGroups);
  const groupValue = allGroups[groupKey];

  let keys = [];

  if (groupValue.add) {
    keys = keys.concat(groupValue.add);
  }

  if (groupValue.subtract) {
    keys = keys.concat(groupValue.subtract);
  }

  return keys;
};

const addOrSubData = (allData, addKey, seriesData, isSub) => {
  const dataToAdd = allData[addKey];
  if (!dataToAdd) {
    return;
  }
  dataToAdd.series.forEach((row) => {
    const matchingDayIdx = seriesData.findIndex(
      (seriesRow) => seriesRow.day === row.day
    );

    let matchingRow = seriesData[matchingDayIdx];

    // If there is no day, add it to the series so we can modify it
    if (matchingDayIdx === -1) {
      matchingRow = { day: row.day };
      seriesData.push(matchingRow);
    }

    // Add all the "types" in the row, active, dead, etc
    Object.entries(row).forEach(([dataType, dataValue]) => {
      if (dataType !== 'day') {
        const currentValue = matchingRow[dataType] || 0;
        if (isSub) {
          matchingRow[dataType] = currentValue - dataValue;
        } else {
          matchingRow[dataType] = dataValue + currentValue;
        }
      }
    });
  });
};

export const populateAllDataWithGroups = (allData, groupKey, customGroups) => {
  const allGroups = getAllGroups(customGroups);
  const groupValue = allGroups[groupKey];

  const seriesData = [];

  // console.log('adding to group', groupKey, groupValue);
  if (groupValue.add) {
    groupValue.add.forEach((addKey) => {
      addOrSubData(allData, addKey, seriesData, false);
    });
  }

  if (groupValue.subtract) {
    groupValue.subtract.forEach((subKey) => {
      addOrSubData(allData, subKey, seriesData, true);
    });
  }

  allData[groupKey] = { series: seriesData, subs: [] };
  // console.log('allData', allData);
};
