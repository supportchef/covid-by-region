import moment from 'moment';

export default function (queryParams) {
  const newQueryParams = {};
  Object.entries(queryParams).forEach(([key, value]) => {
    if (key === 'startDate' && value !== null) {
      newQueryParams[key] = moment(
        decodeURIComponent(value).replace(/\"/g, '')
      );
    } else if (typeof value === 'string') {
      newQueryParams[key] = decodeURIComponent(value);
    } else if (key === 'pinnedKeys') {
      newQueryParams[key] = new Map(value);
    } else {
      newQueryParams[key] = value;
    }
  });
  return newQueryParams;
}
