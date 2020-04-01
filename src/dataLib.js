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
  return n.toLocaleString();
}

export function categoryNameMapping(internalCatName) {
  const mapping = {
    confirm: 'confirmed cases',
    dead: 'deaths',
    rec: 'recovered',
    act: 'active cases',
  };
  return mapping[internalCatName];
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
  return { confirm, dead: '255,99,132' };
};
