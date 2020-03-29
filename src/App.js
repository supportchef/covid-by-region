import React from 'react';
import './App.css';
import RegionSelect from './RegionSelect';
import logo from './assets/Covid-by-region.svg';

function App() {
  return (
    <div className="App">
      <img className="logo" src={logo} width="250" alt="Covid-19 by region" />
      <RegionSelect />
    </div>
  );
}

export default App;
