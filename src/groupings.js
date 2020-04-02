export const staticGroupings = {
  '!US minus NY': {
    add: ['US'],
    subtract: ['US$New York'],
  },
  '!Europe': {
    add: [
      'Albania',
      'Andorra',
      'Armenia',
      'Austria',
      'Azerbaijan',
      'Belarus',
      'Belgium',
      'Bosnia & Herzegovina',
      'Bulgaria',
      'Croatia',
      'Cyprus',
      'Czechia',
      'Denmark',
      'Estonia',
      'Finland',
      'France',
      'Georgia',
      'Germany',
      'Gibraltar',
      'Greece',
      'Hungary',
      'Iceland',
      'Ireland',
      'Italy',
      'Kazakhstan',
      'Kosovo',
      'Latvia',
      'Liechtenstein',
      'Lithuania',
      'Luxembourg',
      'Malta',
      'Moldova',
      'Monaco',
      'Montenegro',
      'Netherlands',
      'North Macedonia',
      'Norway',
      'Poland',
      'Portugal',
      'Romania',
      'San Marino',
      'Serbia',
      'Slovakia',
      'Slovenia',
      'Spain',
      'Sweden',
      'Switzerland',
      'Turkey',
      'Ukraine',
      'United Kingdom',
      'Vatican City',
    ],
  },
  '!Africa': {
    add: [
      'Algeria',
      'Angola',
      'Benin',
      'Botswana',
      'Burkina Faso',
      'Burundi',
      'Cameroon',
      'Cape Verde',
      'Central African Republic',
      'Chad',
      'Comoros', // possibly missing/misspelled
      'Republic of the Congo',
      'Democratic Republic of the Congo', // possibly missing/misspelled
      "Ivory Coast",
      'Djibouti',
      'Egypt',
      'Equatorial Guinea',
      'Eritrea',
      'Ethiopia',
      'Gabon',
      'The Gambia',
      'Ghana',
      'Guinea',
      'Guinea-Bissau',
      'Kenya',
      'Lesotho', // possibly missing/misspelled
      'Liberia',
      'Libya',
      'Madagascar',
      'Malawi', // possibly missing/misspelled
      'Mali',
      'Mauritania',
      'Mauritius',
      'Morocco',
      'Mozambique',
      'Namibia',
      'Niger',
      'Nigeria',
      'Rwanda',
      'São Tomé and Príncipe', // possibly missing/misspelled
      'Senegal',
      'Seychelles',
      'Sierra Leone',
      'Somalia',
      'South Africa',
      'South Sudan', // possibly missing/misspelled
      'Sudan',
      'Swaziland', // possibly missing/misspelled
      'Tanzania',
      'Togo',
      'Tunisia',
      'Uganda',
      'Western Sahara', // possibly missing/misspelled
      'Zambia',
      'Zimbabwe',
    ],
  },
  "!Asia": {
    add: [
      'Afghanistan',
      'Armenia',
      'Azerbaijan',
      'Bahrain',
      'Bangladesh',
      'Bhutan',
      'Brunei',
      'Burma', // may also be Myanmar below
      'Cambodia',
      'China',
      'Cyprus',
      'East Timor',
      'Georgia',
      'India',
      'Indonesia',
      'Iran',
      'Iraq',
      'Israel',
      'Japan',
      'Jordan',
      'Kazakhstan',
      'Kuwait',
      'Kyrgyzstan',
      'Laos',
      'Lebanon',
      'Malaysia',
      'Maldives',
      'Mongolia',
      'Myanmar', // may also be Burma above
      'Nepal',
      'North Korea', // possibly missing/misspelled
      'Oman',
      'Pakistan',
      'Israel',
      'Philippines',
      'Qatar',
      'Russia',
      'Saudi Arabia',
      'Singapore',
      'South Korea',
      'Sri Lanka',
      'Syria',
      'Tajikistan', // possibly missing/misspelled
      'Thailand',
      'Turkey',
      'Turkmenistan',
      'Taiwan',
      'United Arab Emirates',
      'Uzbekistan',
      'Vietnam',
      'Yemen', // possibly missing/misspelled
    ],
  },
  '!Asia minus China': {
    add: ['!Asia'],
    subtract: ['China'],
  },
  '!North America': {
    add: [
      'Antigua and Barbuda', // possibly missing/misspelled
      'Anguilla', // possibly missing/misspelled
      'Aruba', // possibly missing/misspelled
      'The Bahamas',
      'Barbados',
      'Belize',
      'Bermuda', // possibly missing/misspelled
      'Bonaire', // possibly missing/misspelled
      'British Virgin Islands', // possibly missing/misspelled
      'Canada',
      'Cayman Islands',
      'Clipperton Island', // possibly missing/misspelled
      'Costa Rica',
      'Cuba',
      'Curacao',
      'Dominica',
      'Dominican Republic',
      'El Salvador',
      'Greenland',
      'Grenada',
      'Guadeloupe',
      'Guatemala',
      'Haiti',
      'Honduras',
      'Jamaica',
      'Martinique',
      'Mexico',
      'Montserrat', // possibly missing/misspelled
      'Navassa Island', // possibly missing/misspelled
      'Nicaragua',
      'Panama',
      'Puerto Rico',
      'Saba', // possibly missing/misspelled
      'Saint Barthelemy',
      'Saint Kitts and Nevis',
      'Saint Lucia',
      'Saint Martin',
      'Saint Pierre and Miquelon', // possibly missing/misspelled
      'Saint Vincent and the Grenadines', // possibly missing/misspelled
      'Sint Eustatius', // possibly missing/misspelled
      'Sint Maarten', // possibly missing/misspelled
      'Trinidad and Tobago',
      'Turks and Caicos', // possibly missing/misspelled
      'US',
      'US Virgin Islands', // possibly missing/misspelled
    ],
  },
  '!South America': {
    add: [
      'Argentina',
      'Bolivia',
      'Brazil',
      'Chile',
      'Colombia',
      'Ecuador',
      'Falkland Islands', // possibly missing/misspelled
      'French Guiana',
      'Guyana',
      'Paraguay',
      'Peru',
      'South Georgia and the South Sandwich Islands', // possibly missing/misspelled
      'Suriname',
      'Uruguay',
      'Venezuela',
    ],
  },
  '!Americas': {
    add: ['!North America', '!South America'],
  },
  '!Oceanaia / Australia': {
    add: [
      'Australia',
      'Federated States of Micronesia', // possibly missing/misspelled
      'Fiji',
      'Kiribati', // possibly missing/misspelled
      'Marshall Islands', // possibly missing/misspelled
      'Nauru', // possibly missing/misspelled
      'New Zealand',
      'Palau', // possibly missing/misspelled
      'Papua New Guinea',
      'Samoa', // possibly missing/misspelled
      'Solomon Islands', // possibly missing/misspelled
      'Tonga', // possibly missing/misspelled
      'Tuvalu', // possibly missing/misspelled
      'Vanuatu', // possibly missing/misspelled
    ],
  }
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
