const path = require("path");

import ConfigurationError from "./configuration-error";
import fetch from "./fetch";

export interface GitHubUserResponse {
  login: string;
  name: string;
  html_url: string;
}

export interface GitHubIssueResponse {
  number: number;
  title: string;
  pull_request?: {
    html_url: string;
  };
  labels: Array<{
    name: string;
  }>;
  user: {
    login: string;
    html_url: string;
  };
}

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

  constructor(config: Options) {
    this.cacheDir = config.cacheDir && path.join(config.rootPath, config.cacheDir, "github");
    this.github = config.github || process.env.GITHUB_DOMAIN || "github.com";
    this.auth = this.getAuthToken();
    if (!this.auth) {
      throw new ConfigurationError("Must provide GITHUB_AUTH");
    }
  }

  public getBaseIssueUrl(repo: string): string {
    return `https://${this.github}/${repo}/issues/`;
  }

  public async getIssueData(repo: string, issue: string): Promise<GitHubIssueResponse> {
    const prefix = process.env.GITHUB_API_URL || `https://api.${this.github}`;
    return this._fetch(`${prefix}/repos/${repo}/issues/${issue}`);
  }

  public async getUserData(login: string): Promise<GitHubUserResponse> {
    const prefix = process.env.GITHUB_API_URL || `https://api.${this.github}`;
    return this._fetch(`${prefix}/users/${login}`);
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
