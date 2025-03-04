import ConfigurationError from "./configuration-error";
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
  rootPath: string;
  cacheDir?: string;
  github?: string;
}

export default class GithubAPI {
  private auth: string;
  private github: string;
  private octokit!: Octokit;

  constructor(config: Options) {
    this.github = config.github || process.env.GITHUB_DOMAIN || "github.com";
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
    this.octokit = new (await import("@octokit/rest")).Octokit({ auth: this.auth, baseUrl });
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
      return pullRequests.data?.[0];
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
