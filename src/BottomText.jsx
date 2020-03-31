// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import styled from '@emotion/styled';
import React, { Component } from 'react';

import linkSolid from './assets/fontAwesome/link-solid.svg';

// eslint-disable-next-line
jsx;
// eslint-disable-next-line
React;

const bottomHeight = 60;

export const MainWrapper = styled.div`
  min-height: 100vh;
  // To account for bottom footer
  margin-bottom: -${bottomHeight}px;
`;

export const PushedBottom = styled.div`
  min-height: ${bottomHeight}px;
`;

const Footer = styled.div`
  margin-top: 10px;
  min-height: ${bottomHeight - 10}px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CopyLink = styled.div`
  display: flex;
  font-weight: bold;
  cursor: pointer;
  width: fit-content;

  & > img {
    height: 20px;
    margin-right: 3px;
  }
`;

const DataText = styled.div`
  margin-bottom: 3px;
`;

const defaultLinkText = 'Copy link to my graph';

class BottomText extends Component {
  constructor(props) {
    super(props);
    this.state = { linkText: defaultLinkText };
  }

  copyUrl = () => {
    var dummy = document.createElement('input'),
      text = window.location.href;

    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);

    this.setState({ linkText: 'Link copied to clipboard' });

    setTimeout(() => {
      this.setState({ linkText: defaultLinkText });
    }, 1500);
  };

  render() {
    const { linkText } = this.state;

    return (
      <Footer>
        <CopyLink onClick={this.copyUrl}>
          <img src={linkSolid} alt="Copy Link" />
          {linkText}
        </CopyLink>
        <DataText>
          Data from{' '}
          <a href="https://github.com/CSSEGISandData/COVID-19/">John Hopkins</a>{' '}
          and{' '}
          <a href="https://www.nytimes.com/interactive/2020/us/coronavirus-us-cases.html">
            NYT
          </a>{' '}
          (US only)
        </DataText>{' '}
      </Footer>
    );
  }
}

export default BottomText;
