# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Important Config File

Please make sure you use your Github Api Key in the .env file, for example:

### `REACT_APP_GITHUB_TOKEN=ghp_iFDSGAf15316yjm3hh3suhsjtk37slhks3932k76`

## About

This small React.js one-page app fetches data from the Github api and displays it in a fancy manner.\
We take the Gists from the users and their forks (If any), paginate and show them on demand in a beautiful code-highlighter.

## Optimizations

Besides small details in the code-writing, like using non-indexed Mapping, the results have been paginated for a faster REACTion. Two console logs have been left for debug purposes. Can be easily removed or commented out at lines #114 & #115.

## Others

We required Github's @octokit/core to fetch the data from their Gists API. Axios has been aswell used to make some requests related to the Github user's account data, as we later found the Gists do not hold the full user's data needed in the project (the description was missing so we had to take the user's data in a secondary request).

Using Moment, Semantic-UI and SyntaxHighlighter, we managed to beautify this app a bit, with place for expansions and optimizations still left.
Consider minifying files aswell.

## Run project

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
