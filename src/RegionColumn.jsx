// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import styled from '@emotion/styled';
import React, { Component } from 'react';
import { mergeKeys, getLatest, formatNumber } from './dataLib';

// eslint-disable-next-line
jsx;
// eslint-disable-next-line
React;

const getInfoForRegion = (allData, dataKey, sub) => {
  const mergedKey = mergeKeys(dataKey, sub);
  const latestData = getLatest(allData, mergedKey);
  return { ...latestData, sub };
};

const theAllRegion = (allData) => {
  const latestData = getLatest(allData, '');
  return { ...latestData, sub: '' };
};

const SelectColumn = styled.div`
  height: 50vh;
  width: 200px;
  overflow: scroll;
`;
const Region = styled.div`
  background: ${({ selected }) => (selected ? '#c5c5c5' : 'white')};
  cursor: pointer;
  user-select: none;
  padding-left: 8px;
  display: flex;
  justify-content: space-between;
`;
const MainText = styled.span``;
const CaseNumbers = styled.span`
  color: grey;
  display: flex;
  align-items: center;
`;
const Caret = styled.span`
  display: inline-block;
  color: #3a3a3a;
  width: 10px;
  margin: 0px 3px;
  font-size: 12px;
`;

class RegionSelect extends Component {
  render() {
    const {
      allData,
      dataKey,
      onRegionClick,
      doubleClick,
      selected,
      showAll,
    } = this.props;

    if (!showAll && dataKey === '') {
      return <SelectColumn></SelectColumn>;
    }

    if (!allData[dataKey]) {
      return <SelectColumn>Loading {dataKey}</SelectColumn>;
    }
    const regionSubs = allData[dataKey].subs;

    const regionsFilled = regionSubs.map((sub) =>
      getInfoForRegion(allData, dataKey, sub)
    );

    const sortedRegions = regionsFilled.sort(
      (reg1, reg2) => reg2.confirm - reg1.confirm
    );

    const allRegion = showAll && theAllRegion(allData);

    const hasChildren = (sub) => {
      const foundRegion = allData[mergeKeys(dataKey, sub)];
      if (foundRegion) {
        return foundRegion.subs.length > 0;
      }
      return false;
    };

    return (
      <SelectColumn>
        {showAll && (
          <Region
            onClick={onRegionClick(allRegion.sub)}
            onDoubleClick={doubleClick}
            selected={selected === ''}
          >
            <MainText>All</MainText>
            <CaseNumbers>
              {formatNumber(allRegion.confirm)}
              <Caret />
            </CaseNumbers>
          </Region>
        )}
        {sortedRegions.map((region) => (
          <Region
            onClick={onRegionClick(region.sub)}
            onDoubleClick={doubleClick}
            selected={selected === region.sub}
          >
            <MainText>{region.sub}</MainText>
            <CaseNumbers>
              {formatNumber(region.confirm)}
              <Caret>{hasChildren(region.sub) ? '▶' : ''}</Caret>
            </CaseNumbers>
          </Region>
        ))}
      </SelectColumn>
    );
  }
}

export default RegionSelect;
