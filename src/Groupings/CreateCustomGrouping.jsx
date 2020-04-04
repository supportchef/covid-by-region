// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import React, { Component } from 'react';
import { RegionContainer } from '../RegionSelect';
import RegionColumn from '../RegionColumn';
import { mergeKeys } from '../dataLib';

import Input from 'antd/lib/input';
import Button from 'antd/lib/button';

import 'antd/lib/input/style/index.css';
import 'antd/lib/button/style/index.css';

// eslint-disable-next-line
jsx;
// eslint-disable-next-line
React;

const getPlusMinusColor = (isMinus) => (isMinus ? '#f5222d' : '#52c41a');
const getPlusMinusBackgroundColor = (isMinus) =>
  isMinus ? '#f5222d' : '#52c41a';

export const PlusContainer = styled.div`
  height: 24px;
  margin: 6px 0px;
`;
export const PlusMinus = styled.div`
  font-size: 22px;
  width: 24px;
  text-align: center;
  border-radius: 8px;
  height: 24px;
  line-height: 22px;
  box-sizing: border-box;
  color: ${({ isMinus }) => getPlusMinusColor(isMinus)};
  border: ${({ isSelected, isMinus }) =>
    isSelected
      ? `1px solid ${getPlusMinusBackgroundColor(isMinus)}`
      : 'initial'};

  &:hover {
    background: #d5d5d5;
  }
`;

class RegionSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      country: '',
      state: '',
      county: '',
      add: [],
      subtract: [],
      customGroupName: '',
    };
  }

  clickCountry = (reg, hasChildren) => () => {
    const { ensureCountryStateFetched } = this.props;
    this.setState({ country: reg, state: '', county: '' });
    ensureCountryStateFetched(reg);
  };

  clickState = (reg, hasChildren) => () => {
    const { ensureCountryStateFetched } = this.props;
    const { country } = this.state;
    this.setState({ state: reg, county: '' });
    ensureCountryStateFetched(country, reg);
  };

  clickCounty = (reg) => () => {
    this.setState({ county: reg });
  };

  internalCreateCustomGroup = () => {
    const { createCustomGroup, closeModal } = this.props;
    const { customGroupName, add, subtract } = this.state;

    const safeGroupName = `!${
      customGroupName ? customGroupName : 'Undefined New Group'
    }`;

    const newGroup = {
      [safeGroupName]: {
        add,
        subtract,
      },
    };

    createCustomGroup(newGroup);
    closeModal();
  };

  addToArray = (isAdd, regionKey) => () => {
    this.setState((state) => {
      const arrayToAddTo = isAdd ? state.add : state.subtract;
      let newArray;
      if (arrayToAddTo.includes(regionKey)) {
        newArray = arrayToAddTo.filter(
          (existingKey) => existingKey !== regionKey
        );
      } else {
        newArray = [...arrayToAddTo, regionKey];
      }
      if (isAdd) {
        return {
          add: newArray,
        };
      } else {
        return {
          subtract: newArray,
        };
      }
    });
  };

  changeCustomGroupName = (evt) => {
    this.setState({ customGroupName: evt.target.value });
  };

  render() {
    const { allData } = this.props;
    const { country, state, county, customGroupName } = this.state;

    console.log('allData', allData);

    const stateId = state ? mergeKeys(country, state) : '';

    const generatePlusMinus = (keyPrefix) => (region) => {
      const key = mergeKeys(keyPrefix, region);
      const inAdd = this.state.add.includes(key);
      const inSub = this.state.subtract.includes(key);
      return [
        <PlusContainer>
          <PlusMinus isSelected={inAdd} onClick={this.addToArray(true, key)}>
            +
          </PlusMinus>
        </PlusContainer>,
        <PlusContainer>
          <PlusMinus
            isSelected={inSub}
            onClick={this.addToArray(false, key)}
            isMinus
          >
            -
          </PlusMinus>
        </PlusContainer>,
      ];
    };

    return (
      <div>
        <b>Name of custom group</b>
        <Input
          value={customGroupName}
          onChange={this.changeCustomGroupName}
        ></Input>
        <RegionContainer>
          <RegionColumn
            allData={allData}
            selected={country}
            dataKey=""
            showAll
            onRegionClick={this.clickCountry}
            extraRegionInfo={generatePlusMinus()}
          ></RegionColumn>
          <RegionColumn
            allData={allData}
            selected={state}
            dataKey={country}
            onRegionClick={this.clickState}
            extraRegionInfo={generatePlusMinus(country)}
          ></RegionColumn>
          <RegionColumn
            allData={allData}
            selected={county}
            dataKey={stateId}
            onRegionClick={this.clickCounty}
            extraRegionInfo={generatePlusMinus(stateId)}
          ></RegionColumn>
        </RegionContainer>
        <br />
        <Button block type="primary" onClick={this.internalCreateCustomGroup}>
          Create your Custom Group
        </Button>
      </div>
    );
  }
}

export default RegionSelect;
