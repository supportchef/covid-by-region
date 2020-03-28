// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import styled from '@emotion/styled';
import React, { Component } from 'react';
import {mergeKeys, getLatest} from './dataLib'


// eslint-disable-next-line
jsx;
// eslint-disable-next-line
React;

const getInfoForRegion = (allData, dataKey, sub) => {
  const mergedKey = mergeKeys(dataKey, sub)
  const latestData = getLatest(allData, mergedKey)
  return {...latestData, sub}
}

const theAllRegion = (allData) => {
  const latestData = getLatest(allData, '')
  return {...latestData, sub:''}
}

export const SelectColumn = styled.div`
  height: 30vh;
  overflow: scroll;
`;
export const Region = styled.div`
  background: ${({selected}) => selected ? 'grey' : 'white'}
`

class RegionSelect extends Component {
  render() {
    const {allData, dataKey, onRegionClick, selected, showAll} = this.props

    if (!showAll && dataKey === '') {
      return <div></div>
    }

    if (!allData[dataKey]) {
      return (
        <div>
          Loading {dataKey}
        </div>
      )
    }
    const regionSubs = allData[dataKey].subs

    const regionsFilled = regionSubs.map((sub) => 
      getInfoForRegion(allData, dataKey, sub)
    )

    const sortedRegions = regionsFilled.sort(
      (reg1, reg2) => (reg2.confirm - reg1.confirm)
    )

    const allRegion = showAll && theAllRegion(allData)

    return (
      <SelectColumn>
        {showAll && <Region onClick={onRegionClick(allRegion.sub)} selected={selected === ''}>
          All - {allRegion.confirm}
        </Region>}
        {sortedRegions.map(region => (
          <Region onClick={onRegionClick(region.sub)} selected={selected === region.sub}>
            {region.sub} - {region.confirm}
          </Region>
        ))}
      </SelectColumn>
    );
  }
}

export default RegionSelect;