<p align="center">
    <a href="https://www.covidbyregion.com" align="center">
        <img src="https://github.com/supportchef/covid-by-region/blob/master/src/assets/Covid-by-region.svg" width="450"><br/>Link to website
    </a>
</p>

This website plots cases of COVID-19 by region and across regions over time.

The data is currently sourced from the [John Hopkins data set](https://github.com/CSSEGISandData/COVID-19/), as well as the [NYT dataset](https://github.com/nytimes/covid-19-data)(see their [article here](https://www.nytimes.com/interactive/2020/us/coronavirus-us-cases.html)), and is [updated periodically](#updating-dataset).

## Cloning the repo

When cloning - you must clone with the submodules

    git clone --recurse-submodules https://github.com/supportchef/covid-by-region.git

if you forget to clone with `--recurse-submodules`, run:

    git submodule update --init --recursive

within the project.

## Running project

[Install Node.js](https://nodejs.org/en/download/) on your machine if it isn't already installed.

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

_Note: The deployed website can be newer than the pinned git hash of the submodules_

### Multiple datasets

We use the John Hopkins dataset for all data except for the US, if you want to use the JHU dataset
instead go to the options to make it visible, it will be `US (JHU)`.

The main reason we use the NYT dataset is that some US counties have missing timeranges in the JHU dataset

## Contributions

Open to contributions. If you are adding a feature that requires more/new data, it must both:

- Come from a reputable source
- Have an automatable mechanism that can fetch the latest data

## Misc Notes

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
