// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import React, { Component } from 'react';
import moment from 'moment';
import Button from 'antd/lib/button';
import Checkbox from 'antd/lib/checkbox';
import Modal from 'antd/lib/modal';
import Form from 'antd/lib/form';
// import Input from 'antd/lib/input';
import InputNumber from 'antd/lib/input-number';
import DatePicker from 'antd/lib/date-picker';

import 'antd/lib/button/style/index.css';
import 'antd/lib/checkbox/style/index.css';
import 'antd/lib/modal/style/index.css';
import 'antd/lib/form/style/index.css';
import 'antd/lib/input/style/index.css';
import 'antd/lib/input-number/style/index.css';
import 'antd/lib/date-picker/style/index.css';

// eslint-disable-next-line
jsx;
// eslint-disable-next-line
React;

const defaultCaseSettingNum = 50;

export const SeriesRowContainer = styled.div`
  margin-top: 8px;
`;

export const AlteredForm = styled.div`
  & .ant-form-item {
    margin-bottom: 10px;
  }
`;

export const StartNumCasesContainer = styled.div`
  height: ${({ isStartFromNumberOfCases }) =>
    isStartFromNumberOfCases ? '42px' : '0px'};
  overflow: hidden;
  transition: height 0.5s cubic-bezier(0.78, 0.14, 0.15, 0.86);
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
    };
  }

  setAdvancedOverlay = (graphSettingsVisible) => () => {
    this.setState({ graphSettingsVisible });
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
    } = this.props;
    const { graphSettingsVisible } = this.state;

    const isStartFromNumberOfCases = startValue !== null;

    console.log('startValue', startValue);

    return (
      <SeriesRowContainer>
        <Button
          type="primary"
          size="small"
          onClick={this.setAdvancedOverlay(true)}
        >
          Advanced Graph Settings
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
              </StartNumCasesContainer>
              <Form.Item>
                <Checkbox checked={isLog} onChange={() => flipLog && flipLog()}>
                  Logarithim scaled Y axis enabled
                </Checkbox>
              </Form.Item>
              <Form.Item>
                <Checkbox
                  checked={showJhu}
                  onChange={() => flipJhu && flipJhu()}
                >
                  Show JHU data for US
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
            </Form>
          </AlteredForm>
        </Modal>
      </SeriesRowContainer>
    );
  }
}

export default GraphSettings;
