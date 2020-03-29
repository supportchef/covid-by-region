<p align="center">
    <img src="https://raw.githubusercontent.com/supportchef/covid-by-region/master/src/assets/Covid-by-region.svg"><br/>
</p>

[Online website is here.](https://www.covidbyregion.com)

This website allows you to plot the spread of [SARS-COV-2](https://en.wikipedia.org/wiki/Severe_acute_respiratory_syndrome_coronavirus_2) (through cases of COVID-19) by region, shown over time. Including comparing different regions.

The data is currently sourced only from the [John Hopkins data set](https://github.com/CSSEGISandData/COVID-19/), and is [updated periodically](#updating-dataset).

## Cloning the repo

When cloning - you must clone with the submodules

    git clone --recurse-submodules https://github.com/supportchef/covid-by-region.git

if you forget to clone with `--recurse-submodules`, run:

    git submodule update --init --recursive

within the project.

## Running project

The first time you run the project you should install all dependencies:

    npm ci

_Note: `npm ci` is similar to `npm install`, except it installs exact versions of dependencies_

Next you must generate the post-processed data:

    npm run prebuild

Then you can run the project with:

    npm start

## Updating Dataset

Currently the dataset is updating manually by running the following periodically:

    git submodule update --remote
    npm run prebuild

_Note: The deployed website can be newer than the pinned git hash of the John Hopkins submodule_

## Contributions

Open to contributions. If you are adding a feature that requires more/new data, it must both:

- Come from a reputable source
- Have an automatable mechanism that can fetch the latest data

## Misc Notes

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
