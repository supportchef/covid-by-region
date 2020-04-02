import { isGrouping, groupingToRegularName } from './groupings';

export const mergeKeys = (key, subKey, subSubKey) => {
  const keyArray = [key, subKey, subSubKey].filter(
    (k) => k !== '' && k !== undefined
  );
  return keyArray.join('$');
};

export const getLatest = (allData, key) => {
  if (!allData[key]) {
    console.log('key not found for latest:', key);
    return {};
  }
  return allData[key].series[0];
};

export const getNameFromKey = (key) => {
  if (key === '') {
    return 'All';
  }
  if (isGrouping(key)) {
    return groupingToRegularName(key);
  }
  return key.split('$').reverse().join(', ');
};

var ranges = [
  { divider: 1e6, suffix: 'M' },
  { divider: 1e3, suffix: 'k' },
];
export function formatNumberSuffix(n) {
  for (var i = 0; i < ranges.length; i++) {
    if (n >= ranges[i].divider) {
      return (n / ranges[i].divider).toString() + ranges[i].suffix;
    }
  }
  return n;
}

export function formatNumber(n) {
  if (n === undefined) {
    return n;
  }
  // round to one decimal place
  const truncated = Math.round(n * 10) / 10;
  return truncated.toLocaleString();
}

export function categoryColorNameMapping(internalCatName) {
  if (internalCatName === 'confirm') {
    return 'Confirmed';
  }
  console.log('internalCatName', internalCatName);
  const name = categoryNameMapping(internalCatName);
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function categoryNameMapping(internalCatName) {
  const mapping = {
    confirm: 'confirmed cases',
    dead: 'deaths',
    rec: 'recovered',
    act: 'active cases',
    confirmNew: 'new cases',
    deadNew: 'new deaths',
    confirm7Day: 'new cases',
    dead7Day: 'new deaths',
    confirm14Day: 'new cases',
    dead14Day: 'new deaths',
  };
  return mapping[internalCatName];
}

const derivedValuesMaps = {
  confirmNew: {
    sourceField: 'confirm',
    numDays: 1,
  },
  deadNew: {
    sourceField: 'dead',
    numDays: 1,
  },
  confirm7Day: {
    sourceField: 'confirm',
    numDays: 7,
  },
  dead7Day: {
    sourceField: 'dead',
    numDays: 7,
  },
  confirm14Day: {
    sourceField: 'confirm',
    numDays: 14,
  },
  dead14Day: {
    sourceField: 'dead',
    numDays: 14,
  },
};

export function ensureDataHasFieldName(data, fieldName) {
  if (fieldName in derivedValuesMaps) {
    const metadata = derivedValuesMaps[fieldName];
    const sourceField = metadata.sourceField;
    const numDays = metadata.numDays;

    let previousValues = [];
    let lastValue = 0;
    data.forEach((row) => {
      previousValues.push(row[sourceField] - lastValue);
      lastValue = row[sourceField];
      const lastWeek = previousValues.slice(-1 * numDays);
      row[fieldName] = lastWeek.reduce((x, y) => x + y) / numDays;
    });
  }

  return data;
}

const availableColors = [
  // Orange, Purple
  ['255, 159, 64', '153, 102, 255'],
  // Green, Red
  ['75, 192, 192', '255, 99, 132'],
  // Grey, Yellow
  ['201, 203, 207', '255, 205, 86'],

  //
  //Other directions allowed
  //

  // Blue, Grey
  ['54, 162, 235', '201, 203, 207'],
  //Yellow, Green
  ['255, 205, 86', '75, 192, 192'],
  //Red, Blue
  ['255, 99, 132', '54, 162, 235'],
  // Purple, Orange
  ['153, 102, 255', '255, 159, 64'],
];

const issuedColorsHasIndex = (issuedColors, index) => {
  return issuedColors.some((colorIdx) => colorIdx === index);
};

export const generateNewColors = (issuedColors) => {
  let index = 0;
  while (issuedColorsHasIndex(issuedColors, index)) {
    if (index === availableColors.length) {
      index = Math.floor(Math.random() * availableColors.length);
      break;
    }
    index += 1;
  }
  return index;
};

export const getColor = (colorIndex) => {
  const [confirm] = availableColors[colorIndex];
  return [confirm, '255,99,132'];
};
