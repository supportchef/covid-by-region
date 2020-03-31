import React from 'react';
import './App.css';
import RegionSelect from './RegionSelect';
import HelpButton from './HelpButton';
import BottomText, { MainWrapper, PushedBottom } from './BottomText';
import logo from './assets/Covid-by-region.svg';

function App() {
  return (
    <div className="App">
      <MainWrapper>
        <img className="logo" src={logo} width="250" alt="Covid-19 by region" />
        <RegionSelect />
        <PushedBottom />
      </MainWrapper>
      <HelpButton />
      <BottomText />
    </div>
  );
}

export default App;
