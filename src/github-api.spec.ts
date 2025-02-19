import { Octokit } from "./__mocks__/@octokit/rest.js";
import GithubAPI from "./github-api.js";
import { describe, it, expect, vi } from "vitest";

vi.mock("@octokit/rest", () => ({ Octokit }));

describe("github api", function () {
  it("should return correct api endpoint with env var set", function () {
    process.env.GITHUB_AUTH = "test";
    process.env.GITHUB_DOMAIN = "github.host1.com";
    // this is also set by GitHub actions
    delete process.env.GITHUB_API_URL;
    let github = new GithubAPI({
      repo: "foo",
      rootPath: ".",
    });
    expect((Octokit as any).octokit.args).toMatchInlineSnapshot(`
      [
        {
          "auth": "test",
          "baseUrl": "https://api.github.host1.com",
        },
      ]
    `);
    expect(github.getBaseIssueUrl("foo")).toEqual(`https://github.host1.com/foo/issues/`);

    github.getUserData("foo");
    expect((Octokit as any).octokit.users.getByUsername.mock.lastCall).toMatchInlineSnapshot(`
      [
        {
          "username": "foo",
        },
      ]
    `);

    github.getPullRequest("foo/bar", "2");
    expect((Octokit as any).octokit.repos.listPullRequestsAssociatedWithCommit.mock.lastCall).toMatchInlineSnapshot(`
      [
        {
          "commit_sha": "2",
          "owner": "foo",
          "repo": "bar",
        },
      ]
    `);

    delete process.env.GITHUB_DOMAIN;

    process.env.GITHUB_API_URL = "https://api.github.host2.com";

    github = new GithubAPI({
      repo: "foo",
      rootPath: ".",
    });
    expect(github.getBaseIssueUrl("foo")).toEqual(`https://github.com/foo/issues/`);
  });
});
