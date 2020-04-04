import moment from 'moment';

export default function (queryParams) {
  const newQueryParams = {};
  Object.entries(queryParams).forEach(([key, value]) => {
    if (key === 'startDate' && value !== null) {
      newQueryParams[key] = moment(decodeURIComponent(value).replace(/"/g, ''));
    } else if (key === 'selectedInfo' && typeof value === 'string') {
      newQueryParams[key] = JSON.parse(decodeURIComponent(value));
    } else if (key === 'customGroups' && typeof value === 'string') {
      newQueryParams[key] = JSON.parse(decodeURIComponent(value));
    } else if (key === 'pinnedKeys') {
      let safeValue = value;
      if (typeof value === 'string') {
        safeValue = JSON.parse(decodeURIComponent(value));
      }
      newQueryParams[key] = new Map(safeValue);
    } else if (typeof value === 'string') {
      newQueryParams[key] = decodeURIComponent(value);
    } else {
      newQueryParams[key] = value;
    }
  });
  return newQueryParams;
}
