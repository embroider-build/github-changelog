import ConfigurationError from "./configuration-error";
// @ts-expect-error ts complains about this generating a require, but package is esm, but we do not care, since its a type import
import type { Octokit } from "@octokit/rest";

export interface GitHubUserResponse {
  login: string;
  name: string | null;
  html_url: string;
}

type ExtractPromiseValue<T> = T extends Promise<infer U> ? U : never;
export type GitHubIssueResponse = NonNullable<ExtractPromiseValue<ReturnType<GithubAPI["getPullRequest"]>>>;

export interface Options {
  repo: string;
  branch?: string;
  rootPath: string;
  cacheDir?: string;
  github?: string;
}

export default class GithubAPI {
  private auth: string;
  private github: string;
  private branchName: string;
  private octokit!: Octokit;

  constructor(config: Options) {
    this.github = config.github || process.env.GITHUB_DOMAIN || "github.com";
    this.branchName = config.branch || process.env.GITHUB_REF_NAME || "main";
    this.auth = this.getAuthToken();
    if (!this.auth) {
      throw new ConfigurationError("Must provide GITHUB_AUTH");
    }
  }

  async initOctokit() {
    if (this.octokit) {
      return;
    }
    const baseUrl = process.env.GITHUB_API_URL || `https://api.${this.github}`;
    const throttling = await import("@octokit/plugin-throttling");
    const Octokit = (await import("@octokit/rest")).Octokit.plugin(throttling.throttling);
    this.octokit = new Octokit({
      auth: this.auth,
      baseUrl,
      throttle: {
        onRateLimit: (retryAfter, options, octokit, retryCount) => {
          octokit.log.warn(`Request quota exhausted for request ${options.method} ${options.url}`);
          octokit.log.info(`Retrying after ${retryAfter} seconds!`);
          return true;
        },
        onSecondaryRateLimit: (retryAfter, options, octokit) => {
          octokit.log.warn(`SecondaryRateLimit detected for request ${options.method} ${options.url}`);
          octokit.log.info(`Retrying after ${retryAfter} seconds!`);
          return true;
        },
      },
    });
  }

  public getBaseIssueUrl(repo: string): string {
    return `https://${this.github}/${repo}/issues/`;
  }

  public async getPullRequest(repoFullName: string, commit: string) {
    await this.initOctokit();
    const [owner, repo] = repoFullName.split("/");
    try {
      const pullRequests = await this.octokit.repos.listPullRequestsAssociatedWithCommit({
        owner,
        repo,
        commit_sha: commit,
      });
      if ((pullRequests.data as any)?.status) {
        throw new Error(JSON.stringify((pullRequests.data as any).body));
      }
      return pullRequests.data?.find(p => p.merged_at !== null && p.base.ref === this.branchName);
    } catch (e) {
      if ((e as any).status === 404) {
        return null;
      }
      if ((e as any).status === 422) {
        return null;
      }
      throw e;
    }
  }

  public async getUserData(login: string) {
    await this.initOctokit();
    try {
      const user = await this.octokit.users.getByUsername({
        username: login,
      });

      if ((user.data as any)?.status) {
        throw new Error(JSON.stringify((user.data as any).body));
      }
      return user.data;
    } catch (e) {
      if ((e as any).status === 404) {
        return {
          login,
          name: "unknown",
          html_url: "",
        };
      }
      throw e;
    }
  }

  protected getAuthToken(): string {
    return process.env.GITHUB_AUTH || "";
  }
}
