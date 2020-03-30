// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { Component } from 'react';
import QuestionCircle from './assets/fontAwesome/QuestionCircle';
import Modal from 'antd/lib/modal';

import 'antd/lib/modal/style/index.css';

// eslint-disable-next-line
jsx;
// eslint-disable-next-line
React;

class HelpButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      helpVisible: false,
    };
  }

  setHelpOverlay = (helpVisible) => () => {
    this.setState({ helpVisible });
  };

  render() {
    const { helpVisible } = this.state;

    return (
      <div>
        <div
          className="HelpButton"
          onClick={this.setHelpOverlay(true)}
          css={css`
            float: right;
            position: fixed;
            bottom: 5px;
            left: 5px;
            width: 45px;
            color: #000;
            cursor: pointer;
            &:hover {
              color: #444;
            }
          `}
        >
          <QuestionCircle />
        </div>

        <Modal
          title={`About`}
          visible={!!helpVisible}
          width="550px"
          onOk={this.setHelpOverlay(false)}
          onCancel={this.setHelpOverlay(false)}
          footer={null}
          destroyOnClose
        >
          This website plots cases of COVID-19 by region and across regions over
          time.
          <br />
          <br />
          Double click on a region to pin it to the graph and compare multiple
          regions
          <br />
          <br />
          The data is currently sourced from the{' '}
          <a href="https://github.com/CSSEGISandData/COVID-19/">
            John Hopkins data set
          </a>{' '}
          for global data, as well as the{' '}
          <a href="https://github.com/nytimes/covid-19-data">NYT dataset</a> for
          US data (see their{' '}
          <a href="https://www.nytimes.com/interactive/2020/us/coronavirus-us-cases.html">
            article here
          </a>
          ), and is updated periodically.
          <br />
          <br />
          Access the US John Hopkins dataset through Advanced Graph Settings.
        </Modal>
      </div>
    );
  }
}

export default HelpButton;
