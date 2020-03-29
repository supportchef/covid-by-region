// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import styled from '@emotion/styled';
import React, { Component } from 'react';
import RegionColumn from './RegionColumn';
import GraphData from './GraphData';
import SelectedSeries from './SelectedSeries';
import { mergeKeys, generateNewColors } from './dataLib';

import mainData from './timeseriesData/index';

// eslint-disable-next-line
jsx;
// eslint-disable-next-line
React;

let allData = mainData;
const importRegion = (reg) => {
  return import(`./timeseriesData/${reg}`).then((contents) => {
    allData = { ...allData, ...contents };
    // console.log(allData)
  });
};

export const BoxedContainer = styled.div`
  // background: white;
`;

export const RegionContainer = styled.div`
  display: flex;
  justify-content: center;
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
`;

export const SingleGraph = styled.div`
  // display: flex;
  // justify-content: center;
  position: relative;
  margin: auto;
  width: 45vw;
`;

export const SingleGraphContainer = styled.div`
  position: relative;
`;

export const LogSwitchButton = styled.span`
  position: absolute;
  left: 0;
  font-size: 10px;
  cursor: pointer;
`;

class RegionSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      country: '',
      stateId: '',
      county: '',
      pinnedKeys: new Map(),
      isLog: false,
      defaultSeriesInfo: {
        color: {
          index: 1,
          confirm: '75,192,192',
          dead: '255,99,132',
        },
      },
    };
  }

  clickCountry = (reg) => () => {
    this.setState({ country: reg, state: '', county: '' });
    importRegion(reg).then(() => {
      console.log('finished loading reg');
      this.forceUpdate();
    });
  };

  clickState = (reg) => () => {
    const stateId = mergeKeys(this.state.country, reg);
    this.setState({ state: reg, county: '' });
    importRegion(stateId).then(() => {
      console.log('finished loading reg');
      this.forceUpdate();
    });
  };

  clickCounty = (reg) => () => {
    this.setState({ county: reg });
  };

  pinKeyToggle = (key, val) => {
    this.setState(({ pinnedKeys, defaultSeriesInfo }) => {
      const newPinnedKeys = new Map(pinnedKeys);
      const returnPayload = { pinnedKeys: newPinnedKeys };
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
      return returnPayload;
    });
  };

  flipLog = () => {
    this.setState(({ isLog }) => ({
      isLog: !isLog,
    }));
  };

  render() {
    const {
      country,
      state,
      county,
      pinnedKeys,
      defaultSeriesInfo,
      isLog,
    } = this.state;

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
                <GraphData
                  fieldName="confirm"
                  allData={allData}
                  seriesInfo={pinnedGraphInfo}
                  isLog={isLog}
                  showSingleColor={showSingleColor}
                />
              </SingleGraph>
            </SingleGraphContainer>
            <SingleGraphContainer>
              Deceased
              <SingleGraph className="chart-container">
                <GraphData
                  fieldName="dead"
                  allData={allData}
                  seriesInfo={pinnedGraphInfo}
                  isLog={isLog}
                  showSingleColor={showSingleColor}
                />
              </SingleGraph>
            </SingleGraphContainer>
          </GraphContainer>
          <CurrentDisplayInfo>{viewedSeries}</CurrentDisplayInfo>
        </BoxedContainer>
        <RegionContainer>
          <RegionColumn
            allData={allData}
            selected={country}
            dataKey=""
            showAll
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
        </RegionContainer>
      </div>
    );
  }
}

export default RegionSelect;
