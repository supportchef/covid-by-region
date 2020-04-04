// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import React, { Component } from 'react';
import moment from 'moment';
import { staticGroupings, groupingToRegularName } from './groupings';
import CreateCustomGrouping from './Groupings/CreateCustomGrouping';
import Button from 'antd/lib/button';
import Checkbox from 'antd/lib/checkbox';
import Modal from 'antd/lib/modal';
import Form from 'antd/lib/form';
// import Input from 'antd/lib/input';
import InputNumber from 'antd/lib/input-number';
import DatePicker from 'antd/lib/date-picker';
import Select from 'antd/lib/select';

import 'antd/lib/button/style/index.css';
import 'antd/lib/checkbox/style/index.css';
import 'antd/lib/modal/style/index.css';
import 'antd/lib/form/style/index.css';
import 'antd/lib/input/style/index.css';
import 'antd/lib/input-number/style/index.css';
import 'antd/lib/date-picker/style/index.css';
import 'antd/lib/select/style/index.css';

const { Option } = Select;

// eslint-disable-next-line
jsx;
// eslint-disable-next-line
React;

const defaultCaseSettingNum = 50;

export const SeriesRowContainer = styled.div`
  margin-top: 8px;
`;

export const CopyLink = styled.div`
  margin-bottom: 8px;
  cursor: pointer;
  font-weight: bold;
  color: #1790ff;
`;

export const AlteredForm = styled.div`
  & .ant-form-item {
    margin-bottom: 10px;
  }
`;

export const StartNumCasesContainer = styled.div`
  height: ${({ isStartFromNumberOfCases }) =>
    isStartFromNumberOfCases ? '84px' : '0px'};
  overflow: hidden;
  transition: height 0.5s cubic-bezier(0.78, 0.14, 0.15, 0.86);

  & .ant-col {
    flex: 0 1 auto !important;
  }

  & .ant-select {
    width: 150px;
  }
`;

function disabledDate(current) {
  // Can not select days before 1/1/2020 or after today
  return (
    current &&
    (current < moment('1/1/2020').endOf('day') ||
      current > moment().endOf('day'))
  );
}

class GraphSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // deviceSelected: false,
      graphSettingsVisible: false,
      customGroupingVisisble: false,
    };
  }

  setAdvancedOverlay = (graphSettingsVisible) => () => {
    this.setState({ graphSettingsVisible });
  };

  setCustomGrouping = (customGroupingVisisble) => () => {
    this.setState({ customGroupingVisisble });
  };

  render() {
    const {
      isLog,
      flipLog,
      showJhu,
      flipJhu,
      startDate,
      changeStartDate,
      startValue,
      changeStartValue,
      mobileTitle,
      startType,
      changeStartType,
      groupsSelected,
      changeGroupsSelected,
      allData,
      ensureCountryStateFetched,
    } = this.props;
    const { graphSettingsVisible, customGroupingVisisble } = this.state;

    const isStartFromNumberOfCases = startValue !== null;

    // console.log('startValue', startValue);

    return (
      <SeriesRowContainer>
        <Button
          type="primary"
          size="small"
          onClick={this.setAdvancedOverlay(true)}
        >
          {mobileTitle ? 'Advanced Graph Settings' : 'Advanced'}
        </Button>
        <Modal
          title={`Advanced Graph Settings`}
          visible={!!graphSettingsVisible}
          onOk={this.setAdvancedOverlay(false)}
          onCancel={this.setAdvancedOverlay(false)}
          footer={null}
          destroyOnClose
        >
          <AlteredForm>
            {/*<CopyLink onClick={this.copyUrl}>
              Click to copy link to your graphs
            </CopyLink>*/}
            <Form layout="horizontal">
              <Form.Item>
                <Checkbox
                  checked={isStartFromNumberOfCases}
                  onChange={() =>
                    changeStartValue(
                      isStartFromNumberOfCases ? null : defaultCaseSettingNum
                    )
                  }
                >
                  <b>Align different regions with single starting case value</b>
                </Checkbox>
              </Form.Item>
              <StartNumCasesContainer
                isStartFromNumberOfCases={isStartFromNumberOfCases}
              >
                <Form.Item label="Start from case number">
                  <InputNumber
                    min={0}
                    value={startValue}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    onChange={changeStartValue}
                  />
                </Form.Item>
                <Form.Item label="Type to align">
                  <Select value={startType} onChange={changeStartType}>
                    <Option value="">What's Graphed</Option>
                    <Option value="confirm">Confirmed Cases</Option>
                    <Option value="dead">Deaths</Option>
                  </Select>
                </Form.Item>
              </StartNumCasesContainer>
              <Form.Item>
                <Checkbox checked={isLog} onChange={() => flipLog && flipLog()}>
                  Logarithm scaled Y axis enabled
                </Checkbox>
              </Form.Item>
              <Form.Item>
                <Checkbox
                  checked={showJhu}
                  onChange={() => flipJhu && flipJhu()}
                >
                  Show John Hopkins dataset for US
                </Checkbox>
              </Form.Item>
              <Form.Item label="Don't show data before">
                <DatePicker
                  disabled={false}
                  disabledDate={disabledDate}
                  onChange={changeStartDate}
                  value={startDate}
                />
              </Form.Item>
              <Form.Item label="Custom groupings">
                <Select
                  mode="multiple"
                  value={groupsSelected}
                  onChange={changeGroupsSelected}
                  dropdownRender={(menu) => <div>{menu}</div>}
                >
                  {Object.keys(staticGroupings).map((groupKey) => (
                    <Option value={groupKey}>
                      {groupingToRegularName(groupKey)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Button type="primary" onClick={this.setCustomGrouping(true)}>
                Create Custom Group
              </Button>
              <Modal
                title={`Create Custom Group`}
                visible={!!customGroupingVisisble}
                onOk={this.setCustomGrouping(false)}
                onCancel={this.setCustomGrouping(false)}
                footer={null}
                width={720}
                destroyOnClose
              >
                <CreateCustomGrouping
                  allData={allData}
                  ensureCountryStateFetched={ensureCountryStateFetched}
                />
              </Modal>
            </Form>
          </AlteredForm>
        </Modal>
      </SeriesRowContainer>
    );
  }
}

export default GraphSettings;
