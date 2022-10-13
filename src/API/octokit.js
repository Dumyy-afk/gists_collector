import { Octokit } from "@octokit/core";

const {REACT_APP_GITHUB_TOKEN} = process.env;

export const octokit = new Octokit({
    auth: `${REACT_APP_GITHUB_TOKEN}`,
});