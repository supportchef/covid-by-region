# Covid by Region

[Online website is here.](https://www.covidbyregion.com)

This website allows you to plot the spread of SARS-COV-2 (through cases of COVID-19) by region, shown over time. Including comparing different regions.

The data is currently sourced only from the [John Hopkins data set](https://github.com/CSSEGISandData/COVID-19/), and is [updated periodically](#Updating).

## Cloning the repo

When cloning - you must clone with the submodules

    git clone --recurse-submodules https://github.com/supportchef/covid-by-region.git

if you forget to clone with `--recurse-submodules`, run:

git submodule update --init --recursive

within the project.

## Running project

The first time you run the project you should install all dependencies:

    npm ci

_Note:_ `npm ci` is similar to `npm install`, except it installs the exact versions of dependencies

Next you must generate the post-processed data:

    npm run prebuild

Then you can run the project with:

    npm start

## Updating

Currently the dataset is updating manually by running the following periodically:

    git submodule update --remote
    npm run prebuild

## Misc Notes

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
