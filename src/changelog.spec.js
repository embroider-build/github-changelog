import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import * as MockedOctokit from "./__mocks__/@octokit/rest";
import { Octokit } from "@octokit/rest";
import Changelog from "./changelog";
import * as git from "./git";

vi.mock("@octokit/rest");
vi.mock("../src/progress-bar");
vi.mock("../src/changelog");
vi.mock("../src/github-api");
vi.mock("./git");

describe("Changelog", () => {
  beforeEach(() => {
    Octokit.mockImplementation((...args) => MockedOctokit.Octokit(...args));
  });
  afterEach(() => {
    vi.resetAllMocks();
  });
  describe("packageFromPath", () => {
    const TESTS = [
      ["", ""],
      ["foo.js", ""],
      ["packages/foo.js", ""],
      ["packages/foo/bar.js", "foo"],
      ["packages/foo/bar/baz.js", "foo"],
      ["packages/@foo/bar.js", "@foo"],
      ["packages/@foo/bar/baz.js", "@foo/bar"],
    ];

    for (let [input, expected] of TESTS) {
      it(`${input} -> ${expected}`, () => {
        const changelog = new Changelog();
        expect(changelog.packageFromPath(input)).toEqual(expected);
      });
    }
  });

  // TODO figure out how test tests should look on windows and provide similar tests
  // altenatively we could somehow normalise these paths for both platforms 🤔
  if (process.platform !== "win32") {
    describe("packageFromPath with custom packages", () => {
      const TESTS = [
        ["", ""],
        ["/some/path/to/repo/foo.js", ""],
        ["/some/path/to/repo/packages/foo.js", ""],
        ["/some/path/to/repo/packages/tests/foo/face.js", ""],
        ["/some/path/to/repo/packages/tests/yup/face.js", "another-one"],
        ["/some/path/to/repo/funky-package/foo/bar/baz.js", ""],
        ["/some/path/to/repo/packages/funky-package/foo/bar/baz.js", ""],
        ["/some/path/to/repo/over-here/foo/bar/baz.js", "funky-package"],
      ];

      for (let [input, expected] of TESTS) {
        it(`${input} -> ${expected}`, () => {
          const changelog = new Changelog({
            rootPath: "/some/path/to/repo/",
            packages: [
              { name: "funky-package", path: "/some/path/to/repo/over-here" },
              { name: "another-one", path: "/some/path/to/repo/packages/tests/yup" },
            ],
          });
          expect(changelog.packageFromPath(input)).toEqual(expected);
        });
      }
    });
  }

  // TODO figure out how test tests should look on windows and provide similar tests
  // altenatively we could somehow normalise these paths for both platforms 🤔
  if (process.platform !== "win32") {
    describe("packageFromPath with similarly named packages", () => {
      const TESTS = [
        ["", ""],
        ["/ember-fastboot/package.json", "ember-fastboot"],
        ["/ember-fastboot-2-fast-2-furious/package.json", "ember-fastboot-2-fast-2-furious"],
        ["/ember-fastboot-tokyo-drift/package.json", "ember-fastboot-tokyo-drift"],
      ];

      for (let [input, expected] of TESTS) {
        it(`${input} -> ${expected}`, () => {
          const changelog = new Changelog({
            rootPath: "/",
            packages: [
              { name: "ember-fastboot", path: "/ember-fastboot" },
              { name: "ember-fastboot-2-fast-2-furious", path: "/ember-fastboot-2-fast-2-furious" },
              { name: "ember-fastboot-tokyo-drift", path: "/ember-fastboot-tokyo-drift" },
            ],
          });
          expect(changelog.packageFromPath(input)).toEqual(expected);
        });
      }
    });
  }

  describe("getCommitInfos", () => {
    beforeEach(() => {
      MockedOctokit.__resetMockResponses();

      git.listCommits.mockImplementation(() => [
        {
          sha: "a0000006",
          refName: "",
          summary: "Merge pull request #3 from my-feature-3",
          date: "2017-01-01",
        },
        {
          sha: "a0000005",
          refName: "HEAD -> master, tag: v0.2.0, origin/master, origin/HEAD",
          summary: "chore(release): releasing component",
          date: "2017-01-01",
        },
        {
          sha: "a0000004",
          refName: "",
          summary: "Merge pull request #2 from my-feature",
          date: "2017-01-01",
        },
        {
          sha: "a0000003",
          refName: "",
          summary: "feat(module) Add new module (#2)",
          date: "2017-01-01",
        },
        {
          sha: "a0000002",
          refName: "",
          summary: "refactor(module) Simplify implementation",
          date: "2017-01-01",
        },
        {
          sha: "a0000001",
          refName: "tag: v0.1.0",
          summary: "chore(release): releasing component",
          date: "2017-01-01",
        },
      ]);

      git.listTagNames.mockImplementation(() => ["v0.2.0", "v0.1.1", "v0.1.0", "v0.0.1"]);

      git.changedPaths.mockImplementation(() => []);

      const usersCache = {
        "test-user": {
          body: {
            login: "test-user",
            html_url: "https://github.com/test-user",
            name: "Test User",
          },
        },
      };
      const prCache = {
        a0000001: [],
        a0000002: [],
        a0000003: [
          {
            number: 2,
            title: "feat(module) Add new module (#2)",
            labels: [{ name: "Type: New Feature" }, { name: "Status: In Progress" }],
            user: usersCache["test-user"].body,
          },
        ],
        a0000004: [
          {
            number: 2,
            title: "This is the commit title for the issue (#2)",
            labels: [{ name: "Type: New Feature" }, { name: "Status: In Progress" }],
            user: usersCache["test-user"].body,
          },
        ],
        a0000005: [],
        a0000006: [],
        "https://api.github.com/repos/embroider-build/github-changelog/issues/3": {
          body: {
            number: 2,
            title: "This is the commit title for the issue (#2)",
            labels: [{ name: "ignore" }, { name: "Status: In Progress" }],
            user: usersCache["test-user"].body,
          },
        },
      };
      MockedOctokit.__setMockResponses({
        users: { ...usersCache },
        prs: { ...prCache },
      });
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    it("parse commits with different tags", async () => {
      const changelog = new Changelog();
      const commitsInfo = await changelog.getCommitInfos();

      expect(commitsInfo).toMatchSnapshot();
    });
  });

  describe("getCommitters", () => {
    beforeEach(() => {
      MockedOctokit.__resetMockResponses();

      const usersCache = {
        "test-user": {
          login: "test-user",
          html_url: "https://github.com/test-user",
          name: "Test User",
        },
        "test-user-1": {
          login: "test-user-1",
          html_url: "https://github.com/test-user-1",
          name: "Test User 1",
        },
        "test-user-2": {
          login: "test-user-2",
          html_url: "https://github.com/test-user-2",
          name: "Test User 2",
        },
        "user-bot": {
          login: "user-bot",
          html_url: "https://github.com/user-bot",
          name: "User Bot",
        },
      };
      MockedOctokit.__setMockResponses({
        users: { ...usersCache },
      });
    });

    it("get list of valid commiters", async () => {
      const changelog = new Changelog({
        ignoreCommitters: ["user-bot"],
      });

      const testCommits = [
        {
          commitSHA: "a0000004",
          githubIssue: { user: { login: "test-user-1" } },
        },
        {
          commitSHA: "a0000003",
          githubIssue: { user: { login: "test-user-2" } },
        },
        { commitSHA: "a0000002", githubIssue: { user: { login: "user-bot" } } },
        { commitSHA: "a0000001" },
      ];
      const committers = await changelog.getCommitters(testCommits);

      expect(committers).toEqual([
        {
          login: "test-user-1",
          html_url: "https://github.com/test-user-1",
          name: "Test User 1",
        },
        {
          login: "test-user-2",
          html_url: "https://github.com/test-user-2",
          name: "Test User 2",
        },
      ]);
    });
  });
});
