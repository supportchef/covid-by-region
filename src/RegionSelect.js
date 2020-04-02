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
import Select from 'antd/lib/select';

import mainData from './timeseriesData/index';

import 'antd/lib/select/style/index.css';
const { Option } = Select;

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

export const GraphSettingsContainer = styled.span`
  position: absolute;
  right: 0;
  top: -10px;
  font-size: 10px;
  cursor: pointer;

  @media only screen and (max-width: 600px) {
    display: none;
  }
`;

export const MobileOnly = styled.span`
  display: none;
  @media only screen and (max-width: 600px) {
    display: initial;
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
      pinnedKeys: encodeURI(JSON.stringify([])),
      isLog: false,
      showJhu: false,
      startDate: null,
      startValue: null,
      startType: '',
      graphA: 'confirm',
      graphB: 'dead',
      selectedInfo: {
        color: 1,
      },
    };
  }

  componentDidMount() {
    const { country, state, pinnedKeys } = fixQueryParams(this.queryParams);
    this.fetchCountryState(country, state);
    pinnedKeys.forEach((value, pinnedKey) => {
      console.log('pinnedKey', pinnedKey);
      const [country, state] = pinnedKey.split('$');
      this.fetchCountryState(country, state);
    });
  }

  setQueryParamsWrapper = (newQueryParams) => {
    const { country, state } = fixQueryParams(this.queryParams);
    const { country: nextCountry, state: nextState } = newQueryParams;

    this.setQueryParams(newQueryParams);

    console.log('nextCountry', nextCountry);
    if (nextCountry !== country || nextState !== state) {
      const safeCountry = nextCountry !== undefined ? nextCountry : country;
      const safeState = nextState !== undefined ? nextState : state;
      this.fetchCountryState(safeCountry, safeState);
    }
  };

  fetchCountryState(country, state) {
    const thisCountry = allData[country];
    const countryHasChildren = !thisCountry || thisCountry.subs.length > 0;

    const fetchRegionIfNeeded = () => {
      const thisKey = mergeKeys(country, state);

      const thisData = allData[thisKey];
      const thisRegionHasChildren = !thisData || thisData.subs.length > 0;

      if (thisRegionHasChildren) {
        importRegion(thisKey).then(() => {
          this.forceUpdate();
        });
      }
    };

    if (countryHasChildren) {
      importRegion(country).then(() => {
        this.forceUpdate();
        fetchRegionIfNeeded();
      });
    } else {
      fetchRegionIfNeeded();
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
    const { pinnedKeys, selectedInfo } = fixQueryParams(this.queryParams);
    const newPinnedKeys = new Map(pinnedKeys);
    const returnPayload = {};

    if (pinnedKeys.has(key)) {
      // const { [key]: _, ...newPinned } = pinnedKeys;
      newPinnedKeys.delete(key);
    } else {
      newPinnedKeys.set(key, selectedInfo);
      const allColors = [...newPinnedKeys.values()].map(
        (seriesInfo) => seriesInfo.color
      );
      returnPayload.selectedInfo = {
        color: generateNewColors(allColors),
      };
    }

    returnPayload.pinnedKeys = [...newPinnedKeys.entries()];
    returnPayload.pinnedKeys = encodeURI(
      JSON.stringify(returnPayload.pinnedKeys)
    );
    if (returnPayload.selectedInfo) {
      returnPayload.selectedInfo = encodeURI(
        JSON.stringify(returnPayload.selectedInfo)
      );
    }
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

  changeStartType = (startType) => {
    this.setQueryParams({ startType });
  };

  changeGraphType = (graphKey) => (newType) => {
    this.setQueryParams({ [graphKey]: newType });
  };

  render() {
    const {
      country,
      state,
      county,
      pinnedKeys,
      selectedInfo,
      isLog,
      showJhu,
      startDate,
      startValue,
      startType,
      graphA,
      graphB,
    } = fixQueryParams(this.queryParams);

    const stateId = state ? mergeKeys(country, state) : '';
    const seriesKey = mergeKeys(country, state, county);
    // console.log('seriesKey', seriesKey);

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
        graphA={graphA}
        graphB={graphB}
      />
    ));

    const pinnedGraphInfo = [...pinnedKeys.entries()];
    if (newSelectedSeries) {
      viewedSeries.push(
        <SelectedSeries
          key={seriesKey}
          seriesKey={seriesKey}
          seriesInfo={selectedInfo}
          pinKeyToggle={this.pinKeyToggle}
          showSingleColor={showSingleColor}
          graphA={graphA}
          graphB={graphB}
        />
      );

      pinnedGraphInfo.push([seriesKey, selectedInfo]);
    } else {
      viewedSeries.push(
        <SelectedSeries empty showSingleColor={showSingleColor} />
      );
    }

    const graphOptionsWidth = 250;
    const graphOptions = [
      <Option value="confirm">Confirmed Cases</Option>,
      <Option value="dead">Deaths</Option>,
      <Option value="confirmNew">New Cases</Option>,
      <Option value="deadNew">New Deaths</Option>,
      <Option value="confirm7Day">New Cases (7 day rolling average)</Option>,
      <Option value="dead7Day">New Deaths (7 day rolling average)</Option>,
      <Option value="confirm14Day">New Cases (14 day rolling average)</Option>,
      <Option value="dead14Day">New Deaths (14 day rolling average)</Option>,
    ];

    const commonGraphData = {
      allData,
      seriesInfo: pinnedGraphInfo,
      isLog,
      showSingleColor,
      startDate,
      startValue,
      startType,
    };

    const graphSettings = {
      isLog: isLog,
      flipLog: this.flipLog,
      showJhu: showJhu,
      flipJhu: this.flipJhu,
      startDate: startDate,
      changeStartDate: this.changeStartDate,
      startValue: startValue,
      changeStartValue: this.changeStartValue,
      startType: startType,
      changeStartType: this.changeStartType,
    };

    return (
      <div>
        <BoxedContainer>
          <GraphContainer>
            <SingleGraphContainer>
              <LogSwitchButton onClick={this.flipLog}>
                {isLog ? 'Switch to Linear' : 'Switch to Log'}
              </LogSwitchButton>
              <Select
                size="small"
                bordered={false}
                dropdownMatchSelectWidth={graphOptionsWidth}
                value={graphA}
                onChange={this.changeGraphType('graphA')}
              >
                {graphOptions}
              </Select>
              <SingleGraph className="chart-container">
                <GraphData
                  fieldName={graphA}
                  graphIndex={0}
                  {...commonGraphData}
                />
              </SingleGraph>
            </SingleGraphContainer>
            <SingleGraphContainer>
              <GraphSettingsContainer>
                <GraphSettings {...graphSettings} />
              </GraphSettingsContainer>
              <Select
                size="small"
                bordered={false}
                dropdownMatchSelectWidth={graphOptionsWidth}
                value={graphB}
                onChange={this.changeGraphType('graphB')}
              >
                {graphOptions}
              </Select>
              <SingleGraph className="chart-container">
                <GraphData
                  fieldName={graphB}
                  graphIndex={1}
                  {...commonGraphData}
                />
              </SingleGraph>
            </SingleGraphContainer>
          </GraphContainer>
          <MobileOnly>
            <GraphSettings {...graphSettings} mobileTitle />
          </MobileOnly>
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
              Double click to pin
              <div className="subIntro">Click advanced for more</div>
            </IntroText>
          )}
        </RegionContainer>
      </div>
    );
  }
}

export default RegionSelect;
