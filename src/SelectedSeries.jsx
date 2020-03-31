// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import React, { Component } from 'react';
import { getNameFromKey } from './dataLib';
import Checkbox from 'antd/lib/checkbox';

import 'antd/lib/checkbox/style/index.css';

// eslint-disable-next-line
jsx;
// eslint-disable-next-line
React;

export const SeriesRowContainer = styled.div`
  max-width: 460px;
  margin: 6px auto;
  width: calc(100% - 14px);
  // width: calc(100% - 140px);
`;

export const SeriesRow = styled.div`
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export const SideContainer = styled.div`
  position: absolute;
  right: -70px;
`;

export const ColorContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 75px;
`;
export const ColorRow = styled.div`
  display: flex;
  font-size: 12px;
  align-items: center;
`;

export const ColorSwatch = styled.div`
  background: rgb(${({ color }) => color});
  width: 10px;
  height: 10px;
  margin: 0px 2px;
  // margin-top: 1px;
`;
export const EmptyText = styled.div`
  margin: ${({ showSingleColor }) => (showSingleColor ? 'auto' : '-6px')} auto;
  color: grey;
`;
export const RightContainer = styled.div`
  width: 75px;
`;

class SelectedSeries extends Component {
  render() {
    const {
      seriesKey,
      isPinned,
      pinKeyToggle,
      seriesInfo,
      empty,
      showSingleColor,
    } = this.props;

    if (empty) {
      return (
        <SeriesRowContainer>
          <SeriesRow>
            <EmptyText showSingleColor={showSingleColor}>
              Selected data is already pinned
            </EmptyText>
          </SeriesRow>
        </SeriesRowContainer>
      );
    }

    const name = getNameFromKey(seriesKey);

    const deadColor = showSingleColor
      ? seriesInfo.color.confirm
      : seriesInfo.color.dead;

    return (
      <SeriesRowContainer>
        <SeriesRow>
          <ColorContainer>
            <ColorRow>
              <ColorSwatch color={seriesInfo.color.confirm} />
              {showSingleColor ? 'Color' : 'Confirmed'}
            </ColorRow>
            {!showSingleColor && (
              <ColorRow>
                <ColorSwatch color={deadColor} />
                Deaths
              </ColorRow>
            )}
          </ColorContainer>
          <div>{name}</div>
          {/*<div>▼</div>*/}
          {/*<SideContainer>*/}
          <RightContainer>
            <Checkbox
              checked={isPinned}
              disabled={false}
              onChange={() => pinKeyToggle(seriesKey)}
            >
              Pin
            </Checkbox>
          </RightContainer>
          {/*</SideContainer>*/}
        </SeriesRow>
      </SeriesRowContainer>
    );
  }
}

export default SelectedSeries;
