const path = require("path");

import ConfigurationError from "./configuration-error";
import fetch from "./fetch";
import { Octokit } from "@octokit/rest";

export interface GitHubUserResponse {
  login: string;
  name: string;
  html_url: string;
}

export type GitHubIssueResponse = ReturnType<GithubAPI["getPullRequest"]>;

export interface Options {
  repo: string;
  rootPath: string;
  cacheDir?: string;
  github?: string;
}

export default class GithubAPI {
  private cacheDir: string | undefined;
  private auth: string;
  private github: string;
  private octokit: Octokit;

  constructor(config: Options) {
    this.cacheDir = config.cacheDir && path.join(config.rootPath, config.cacheDir, "github");
    this.github = config.github || process.env.GITHUB_DOMAIN || "github.com";
    const baseUrl = process.env.GITHUB_API_URL || `https://api.${this.github}`;
    this.auth = this.getAuthToken();
    if (!this.auth) {
      throw new ConfigurationError("Must provide GITHUB_AUTH");
    }
    this.octokit = new Octokit({ auth: this.auth, baseUrl });
  }

  public async getPullRequest(repoFullName: string, commit: string) {
    const [owner, repo] = repoFullName.split("/");
    const pullRequests = await this.octokit.repos.listPullRequestsAssociatedWithCommit({
      owner,
      repo,
      commit_sha: commit,
    });
    return pullRequests.data?.[0];
  }

  public async getUserData(login: string): Promise<ReturnType<Octokit["users"]["getByUsername"]>> {
    return await this.octokit.users.getByUsername({
      username: login,
    });
  }

  private async _fetch(url: string): Promise<any> {
    const res = await fetch(url, {
      cachePath: this.cacheDir,
      headers: {
        Authorization: `token ${this.auth}`,
      },
    });
    const parsedResponse = await res.json();
    if (res.ok) {
      return parsedResponse;
    }
    throw new ConfigurationError(`Fetch error: ${res.statusText}.\n${JSON.stringify(parsedResponse)}`);
  }

  protected getAuthToken(): string {
    return process.env.GITHUB_AUTH || "";
  }
}
