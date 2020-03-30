// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import styled from '@emotion/styled';
import React, { Component } from 'react';
import Button from 'antd/lib/button';
import Checkbox from 'antd/lib/checkbox';

import 'antd/lib/button/style/index.css';
import 'antd/lib/checkbox/style/index.css';

// eslint-disable-next-line
jsx;
// eslint-disable-next-line
React;

export const SeriesRowContainer = styled.div``;

class GraphSettings extends Component {
  render() {
    const {} = this.props;

    return (
      <SeriesRowContainer>
        <Button type="primary" size="small">
          Advanced Graph Settings
        </Button>
      </SeriesRowContainer>
    );
  }
}

export default GraphSettings;
