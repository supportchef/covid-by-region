// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import styled from '@emotion/styled';
import React, { Component } from 'react';
import { mergeKeys, getLatest, formatNumber } from './dataLib';
import { groupingToRegularName } from './groupings';
import Input from 'antd/lib/input';

import 'antd/lib/input/style/index.css';

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
  height: 300px;
  width: 200px;
  overflow: scroll;
`;

const EmptySelectColumn = styled.div`
  height: 300px;
  width: 200px;
`;

const Region = styled.div`
  background: ${({ selected }) => (selected ? '#c5c5c5' : 'white')};
  cursor: pointer;
  user-select: none;
  padding-left: 8px;
  display: flex;
  align-items: center;
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
  constructor(props) {
    super(props);
    this.state = { filter: null };
  }

  changeFilter = (evt) => {
    this.setState({ filter: evt.target.value });
  };

  render() {
    const {
      allData,
      dataKey,
      onRegionClick,
      doubleClick,
      selected,
      showAll,
      showJhu,
      groupOptions,
      extraRegionInfo,
    } = this.props;

    const { filter } = this.state;

    // Column is empty
    if (!showAll && dataKey === '') {
      return <EmptySelectColumn></EmptySelectColumn>;
    }

    // If we don't yet have the data for this entry
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

    let filteredRegions = sortedRegions;
    if (!showJhu) {
      filteredRegions = sortedRegions.filter(
        (region) => region.sub !== 'US (JHU)'
      );
    }

    if (filter) {
      const lowercaseFilter = filter.toLowerCase();
      filteredRegions = filteredRegions.filter((region) =>
        region.sub.toLowerCase().includes(lowercaseFilter)
      );
    }

    return (
      <div>
        <SelectColumn>
          {showAll && (
            <Region
              onClick={onRegionClick(allRegion.sub, hasChildren(allRegion.sub))}
              onDoubleClick={doubleClick}
              selected={selected === ''}
            >
              <MainText>All</MainText>
              <CaseNumbers>
                {extraRegionInfo
                  ? extraRegionInfo(allRegion.sub)
                  : formatNumber(allRegion.confirm)}
                <Caret />
              </CaseNumbers>
            </Region>
          )}
          {groupOptions && Object.keys(groupOptions).length > 0 && (
            <div>
              <b>Custom Groups</b>
              {Object.keys(groupOptions).map((groupKey) => (
                <Region
                  onClick={onRegionClick(groupKey, false)}
                  onDoubleClick={doubleClick}
                  selected={selected === groupKey}
                >
                  <MainText>{groupingToRegularName(groupKey)}</MainText>
                </Region>
              ))}
              <b>Countries</b>
            </div>
          )}
          {filteredRegions.map((region) => (
            <Region
              onClick={onRegionClick(region.sub, hasChildren(region.sub))}
              onDoubleClick={doubleClick}
              selected={selected === region.sub}
            >
              <MainText>{region.sub}</MainText>
              <CaseNumbers>
                {extraRegionInfo
                  ? extraRegionInfo(region.sub)
                  : formatNumber(region.confirm)}
                <Caret>{hasChildren(region.sub) ? '▶' : ''}</Caret>
              </CaseNumbers>
            </Region>
          ))}
        </SelectColumn>
        {sortedRegions.length > 0 && (
          <Input
            size="small"
            onChange={this.changeFilter}
            value={filter}
            placeholder="Filter results"
            css={css`
              margin-top: 5px;
            `}
          />
        )}
      </div>
    );
  }
}

export default RegionSelect;
