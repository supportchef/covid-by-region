export const mergeKeys = (key, subKey, subSubKey) => {
  const keyArray = [key, subKey, subSubKey].filter((k) => k !== '' && k !== undefined)
  return keyArray.join('$')
}

export const getLatest = (allData, key) => {
  if (!allData[key]) {
    console.log('key not found for latest:', key)
    return {}
  }
  return allData[key].series[0]
}