// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import React, { Component } from 'react';
import ReactQueryParams from 'react-query-params';
import RegionColumn from './RegionColumn';
import GraphData from './GraphData';
import SelectedSeries from './SelectedSeries';
import GraphSettings from './GraphSettings';
import { mergeKeys, generateNewColors } from './dataLib';
import fixQueryParams from './misc/fixQueryParams';

import mainData from './timeseriesData/index';

// eslint-disable-next-line
jsx;
// eslint-disable-next-line
React;

let allData = mainData;
const importRegion = (reg) => {
  // console.log('importing region', reg);
  return import(`./timeseriesData/${reg}`).then((contents) => {
    allData = { ...allData, ...contents };
    // console.log('loaded new region', allData);
  });
};

export const BoxedContainer = styled.div`
  // background: white;
`;

export const RegionContainer = styled.div`
  position: relative;
  width: fit-content;
  display: flex;
  justify-content: center;
  margin: auto;
  margin-top: 8px;
`;

export const CurrentDisplayInfo = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  background: white;
  border-radius: 5px;
`;

export const GraphContainer = styled.div`
  // height: 50vh;
  display: flex;
  justify-content: center;
  // height: 40vh;

  @media only screen and (max-width: 600px) {
    margin-top: 5px;
    flex-direction: column;
  }
`;

export const SingleGraph = styled.div`
  // display: flex;
  // justify-content: center;
  position: relative;
  margin: auto;
  width: 45vw;

  @media only screen and (max-width: 600px) {
    width: 100vw;
    margin-top: -5px;
  }
`;

export const SingleGraphContainer = styled.div`
  position: relative;

  @media only screen and (max-width: 600px) {
    margin-top: 5px;
  }
`;

export const LogSwitchButton = styled.span`
  position: absolute;
  left: 0;
  font-size: 10px;
  cursor: pointer;

  @media only screen and (max-width: 600px) {
    display: none;
  }
`;

export const IntroText = styled.div`
  position: absolute;
  font-size: 30px;
  left: 210px;
  & > .subIntro {
    font-size: 14px;
  }
`;

class RegionSelect extends ReactQueryParams {
  constructor(props) {
    super(props);
    this.defaultQueryParams = {
      country: '',
      state: '',
      county: '',
      pinnedKeys: [],
      isLog: false,
      showJhu: false,
      startDate: null,
      startValue: null,
      defaultSeriesInfo: {
        color: {
          index: 1,
          confirm: '75,192,192',
          dead: '255,99,132',
        },
      },
    };
  }

  componentDidMount() {
    const { country, state } = fixQueryParams(this.queryParams);
    this.fetchCountryState(country, state);
  }

  setQueryParamsWrapper = (newQueryParams) => {
    const { country, state } = this.queryParams;
    const { country: nextCountry, state: nextState } = newQueryParams;

    this.setQueryParams(newQueryParams);

    console.log('nextCountry', nextCountry);
    if (nextCountry !== country || nextState !== state) {
      this.fetchCountryState(nextCountry || country, nextState || state);
    }
  };

  fetchCountryState(country, state) {
    const thisKey = mergeKeys(country, state);

    const thisCountry = allData[country];
    const thisData = allData[thisKey];

    const countryHasChildren = !thisCountry || thisCountry.subs.length > 0;
    const thisRegionHasChildren = !thisData || thisData.subs.length > 0;

    const importPromises = [];

    if (countryHasChildren) {
      importPromises.push(importRegion(country));
    }

    if (thisRegionHasChildren) {
      importPromises.push(importRegion(thisKey));
    }

    if (importPromises.length > 0) {
      Promise.all(importPromises).then(() => {
        this.forceUpdate();
      });
    }
  }

  clickCountry = (reg, hasChildren) => () => {
    this.setQueryParamsWrapper({ country: reg, state: '', county: '' });
    // hasChildren &&
    //   importRegion(reg).then(() => {
    //     console.log('finished loading reg');
    //     this.forceUpdate();
    //   });
  };

  clickState = (reg, hasChildren) => () => {
    // const { country } = this.queryParams;
    // const stateId = mergeKeys(country, reg);
    this.setQueryParamsWrapper({ state: reg, county: '' });
    // hasChildren &&
    //   importRegion(stateId).then(() => {
    //     console.log('finished loading reg');
    //     this.forceUpdate();
    //   });
  };

  clickCounty = (reg) => () => {
    this.setQueryParams({ county: reg });
  };

  pinKeyToggle = (key, val) => {
    const { pinnedKeys, defaultSeriesInfo } = fixQueryParams(this.queryParams);
    const newPinnedKeys = new Map(pinnedKeys);
    const returnPayload = {};
    if (pinnedKeys.has(key)) {
      // const { [key]: _, ...newPinned } = pinnedKeys;
      newPinnedKeys.delete(key);
    } else {
      newPinnedKeys.set(key, defaultSeriesInfo);
      const allColors = [...newPinnedKeys.values()].map(
        (seriesInfo) => seriesInfo.color
      );
      returnPayload.defaultSeriesInfo = {
        color: generateNewColors(allColors),
      };
    }
    // return returnPayload;
    returnPayload.pinnedKeys = [...newPinnedKeys.entries()];
    this.setQueryParams(returnPayload);
  };

  flipLog = () => {
    const { isLog } = this.queryParams;
    this.setQueryParams({ isLog: !isLog });
  };

  flipJhu = () => {
    const { showJhu } = this.queryParams;
    this.setQueryParams({ showJhu: !showJhu });
  };

  changeStartDate = (startDate) => {
    this.setQueryParams({ startDate });
  };

  changeStartValue = (startValue) => {
    this.setQueryParams({ startValue });
  };

  render() {
    const {
      country,
      state,
      county,
      pinnedKeys,
      defaultSeriesInfo,
      isLog,
      showJhu,
      startDate,
      startValue,
    } = fixQueryParams(this.queryParams);

    const stateId = state ? mergeKeys(country, state) : '';
    const seriesKey = mergeKeys(country, state, county);
    console.log('seriesKey', seriesKey);

    const newSelectedSeries = !pinnedKeys.has(seriesKey);
    const showSingleColor =
      pinnedKeys.size > 1 || (pinnedKeys.size === 1 && newSelectedSeries);

    // console.log('pinnedKeys.entries()', pinnedKeys.entries());
    const viewedSeries = [
      ...pinnedKeys.entries(),
    ].map(([seriesKey, seriesInfo]) => (
      <SelectedSeries
        key={seriesKey}
        seriesKey={seriesKey}
        isPinned
        pinKeyToggle={this.pinKeyToggle}
        seriesInfo={seriesInfo}
        showSingleColor={showSingleColor}
      />
    ));

    const pinnedGraphInfo = [...pinnedKeys.entries()];
    if (newSelectedSeries) {
      viewedSeries.push(
        <SelectedSeries
          key={seriesKey}
          seriesKey={seriesKey}
          seriesInfo={defaultSeriesInfo}
          pinKeyToggle={this.pinKeyToggle}
          showSingleColor={showSingleColor}
        />
      );

      pinnedGraphInfo.push([seriesKey, defaultSeriesInfo]);
    } else {
      viewedSeries.push(
        <SelectedSeries empty showSingleColor={showSingleColor} />
      );
    }

    const commonGraphData = {
      allData,
      seriesInfo: pinnedGraphInfo,
      isLog,
      showSingleColor,
      startDate,
      startValue,
    };

    return (
      <div>
        <BoxedContainer>
          <GraphContainer>
            <SingleGraphContainer>
              Confirmed Cases
              <LogSwitchButton onClick={this.flipLog}>
                {isLog ? 'Switch to Linear' : 'Switch to Log'}
              </LogSwitchButton>
              <SingleGraph className="chart-container">
                <GraphData fieldName="confirm" {...commonGraphData} />
              </SingleGraph>
            </SingleGraphContainer>
            <SingleGraphContainer>
              Deaths
              <SingleGraph className="chart-container">
                <GraphData fieldName="dead" {...commonGraphData} />
              </SingleGraph>
            </SingleGraphContainer>
          </GraphContainer>
          <GraphSettings
            isLog={isLog}
            flipLog={this.flipLog}
            showJhu={showJhu}
            flipJhu={this.flipJhu}
            startDate={startDate}
            changeStartDate={this.changeStartDate}
            startValue={startValue}
            changeStartValue={this.changeStartValue}
          />
          <CurrentDisplayInfo>{viewedSeries}</CurrentDisplayInfo>
        </BoxedContainer>
        <RegionContainer>
          <RegionColumn
            allData={allData}
            selected={country}
            dataKey=""
            showAll
            showJhu={showJhu}
            onRegionClick={this.clickCountry}
            doubleClick={() => this.pinKeyToggle(seriesKey)}
          />
          <RegionColumn
            allData={allData}
            selected={state}
            dataKey={country}
            onRegionClick={this.clickState}
            doubleClick={() => this.pinKeyToggle(seriesKey)}
          />
          <RegionColumn
            allData={allData}
            selected={county}
            dataKey={stateId}
            onRegionClick={this.clickCounty}
            doubleClick={() => this.pinKeyToggle(seriesKey)}
          />
          {seriesKey === '' && (
            <IntroText>
              Click a country to start
              <div className="subIntro">Double click to pin and compare</div>
            </IntroText>
          )}
        </RegionContainer>
      </div>
    );
  }
}

export default RegionSelect;
