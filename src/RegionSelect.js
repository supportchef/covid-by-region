// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import styled from '@emotion/styled';
import React, { Component } from 'react';
import RegionColumn from './RegionColumn';
import GraphData from './GraphData';
import { mergeKeys } from './dataLib';

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

export const RegionContainer = styled.div`
  display: flex;
  justify-content: center;
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

export const SingleGraphContainer = styled.div``;

class RegionSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      country: '',
      stateId: '',
      county: '',
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

  render() {
    const { country, state, county } = this.state;

    const stateId = state ? mergeKeys(country, state) : '';
    const seriesKey = mergeKeys(country, state, county);
    console.log('seriesKey', seriesKey);

    return (
      <div>
        <GraphContainer>
          <SingleGraphContainer>
            Confirmed Cases
            <SingleGraph className="chart-container">
              <GraphData
                series={allData[seriesKey].series}
                label=""
                fieldName="confirm"
                rgb="75,192,192"
              />
            </SingleGraph>
          </SingleGraphContainer>
          <SingleGraphContainer>
            Deceased
            <SingleGraph className="chart-container">
              <GraphData
                series={allData[seriesKey].series}
                label=""
                fieldName="dead"
                rgb="255,99,132"
              />
            </SingleGraph>
          </SingleGraphContainer>
        </GraphContainer>
        <RegionContainer>
          <RegionColumn
            allData={allData}
            selected={country}
            dataKey=""
            showAll
            onRegionClick={this.clickCountry}
          />
          <RegionColumn
            allData={allData}
            selected={state}
            dataKey={country}
            onRegionClick={this.clickState}
          />
          <RegionColumn
            allData={allData}
            selected={county}
            dataKey={stateId}
            onRegionClick={this.clickCounty}
          />
        </RegionContainer>
      </div>
    );
  }
}

export default RegionSelect;
