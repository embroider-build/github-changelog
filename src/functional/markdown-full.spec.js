import { vi, describe, beforeEach, afterEach, it, expect } from "vitest";

import * as git from "../git";
import Changelog from "../changelog";
import * as fetch from "../fetch";

vi.mock("../../src/progress-bar");
vi.mock("../changelog");
vi.mock("../../src/github-api");
vi.mock("../git");
vi.mock("../fetch");

const listOfCommits = [
  {
    sha: "a0000017",
    refName: "",
    summary: "Merge pull request #8 from my-dependency",
    date: "2017-01-01",
  },
  {
    sha: "a0000016",
    refName: "",
    summary: "chore: Update dependency",
    date: "2017-01-01",
  },
  {
    sha: "a0000015",
    refName: "",
    summary: "chore: making of episode viii",
    date: "2015-12-18",
  },
  {
    sha: "a0000014",
    refName: "",
    summary: "feat: infiltration (#7)",
    date: "2015-12-18",
  },
  {
    sha: "a0000013",
    refName: "HEAD -> master, tag: v6.0.0, origin/master, origin/HEAD",
    summary: "chore(release): releasing component",
    date: "1983-05-25",
  },
  {
    sha: "a0000012",
    refName: "",
    summary: "Merge pull request #6 from return-of-the-jedi",
    date: "1983-05-25",
  },
  {
    sha: "a0000011",
    refName: "",
    summary: "feat: I am your father (#5)",
    date: "1983-05-25",
  },
  {
    sha: "a0000010",
    refName: "",
    summary: "fix(han-solo): unfreezes (#4)",
    date: "1983-05-25",
  },
  {
    sha: "a0000009",
    refName: "tag: v5.0.0",
    summary: "chore(release): releasing component",
    date: "1980-05-17",
  },
  {
    sha: "a0000008",
    refName: "",
    summary: "Merge pull request #3 from empire-strikes-back",
    date: "1980-05-17",
  },
  {
    sha: "a0000007",
    refName: "",
    summary: "fix: destroy rebels base",
    date: "1980-05-17",
  },
  {
    sha: "a0000006",
    refName: "",
    summary: "chore: the end of Alderaan (#2)",
    date: "1980-05-17",
  },
  {
    sha: "a0000005",
    refName: "",
    summary: "refactor(death-star): add deflector shield",
    date: "1980-05-17",
  },
  {
    sha: "a0000004",
    refName: "tag: v4.0.0",
    summary: "chore(release): releasing component",
    date: "1977-05-25",
  },
  {
    sha: "a0000003",
    refName: "",
    summary: "Merge pull request #1 from star-wars",
    date: "1977-05-25",
  },
  {
    sha: "a0000002",
    refName: "tag: v0.1.0",
    summary: "chore(release): releasing component",
    date: "1966-01-01",
  },
  {
    sha: "a0000001",
    refName: "",
    summary: "fix: some random fix which will be ignored",
    date: "1966-01-01",
  },
];

const listOfTags = ["v6.0.0", "v5.0.0", "v4.0.0", "v3.0.0", "v2.0.0", "v1.0.0", "v0.1.0"];

const listOfPackagesForEachCommit = {
  a0000001: ["packages/random/foo.js"],
  a0000002: ["packages/random/package.json"],
  a0000003: ["packages/a-new-hope/rebels.js"],
  a0000004: ["packages/a-new-hope/package.json"],
  a0000005: ["packages/empire-strikes-back/death-star.js"],
  a0000006: ["packages/empire-strikes-back/death-star.js"],
  a0000007: ["packages/empire-strikes-back/hoth.js"],
  a0000008: ["packages/empire-strikes-back/hoth.js"],
  a0000009: ["packages/empire-strikes-back/package.json"],
  a0000010: ["packages/return-of-the-jedi/jabba-the-hutt.js"],
  a0000011: ["packages/return-of-the-jedi/vader-luke.js"],
  a0000012: ["packages/return-of-the-jedi/leia.js"],
  a0000013: ["packages/return-of-the-jedi/package.json"],
  a0000014: ["packages/the-force-awakens/mission.js", "packages/rogue-one/mission.js"],
  a0000015: ["packages/untitled/script.md"],
  a0000016: ["packages/return-of-the-jedi/package.json"],
  a0000017: ["packages/return-of-the-jedi/package.json"],
};

const listOfFileForEachCommit = {
  a0000001: ["random/foo.js"],
  a0000002: ["random/package.json"],
  a0000003: ["a-new-hope/rebels.js"],
  a0000004: ["a-new-hope/package.json"],
  a0000005: ["empire-strikes-back/death-star.js"],
  a0000006: ["empire-strikes-back/death-star.js"],
  a0000007: ["empire-strikes-back/hoth.js"],
  a0000008: ["empire-strikes-back/hoth.js"],
  a0000009: ["empire-strikes-back/package.json"],
  a0000010: ["return-of-the-jedi/jabba-the-hutt.js"],
  a0000011: ["return-of-the-jedi/vader-luke.js"],
  a0000012: ["return-of-the-jedi/leia.js"],
  a0000013: ["return-of-the-jedi/package.json"],
  a0000014: ["the-force-awakens/mission.js", "rogue-one/mission.js"],
  a0000015: ["untitled/script.md"],
  a0000016: ["packages/return-of-the-jedi/package.json"],
  a0000017: ["packages/return-of-the-jedi/package.json"],
};

const usersCache = {
  "https://api.github.com/users/luke": {
    body: {
      login: "luke",
      html_url: "https://github.com/luke",
      name: "Luke Skywalker",
    },
  },
  "https://api.github.com/users/princess-leia": {
    body: {
      login: "princess-leia",
      html_url: "https://github.com/princess-leia",
      name: "Princess Leia Organa",
    },
  },
  "https://api.github.com/users/vader": {
    body: {
      login: "vader",
      html_url: "https://github.com/vader",
      name: "Darth Vader",
    },
  },
  "https://api.github.com/users/gtarkin": {
    body: {
      login: "gtarkin",
      html_url: "https://github.com/gtarkin",
      name: "Governor Tarkin",
    },
  },
  "https://api.github.com/users/han-solo": {
    body: {
      login: "han-solo",
      html_url: "https://github.com/han-solo",
      name: "Han Solo",
    },
  },
  "https://api.github.com/users/chewbacca": {
    body: {
      login: "chewbacca",
      html_url: "https://github.com/chewbacca",
      name: "Chwebacca",
    },
  },
  "https://api.github.com/users/rd-d2": {
    body: {
      login: "rd-d2",
      html_url: "https://github.com/rd-d2",
      name: "R2-D2",
    },
  },
  "https://api.github.com/users/c-3po": {
    body: {
      login: "c-3po",
      html_url: "https://github.com/c-3po",
      name: "C-3PO",
    },
  },
  "https://api.github.com/users/bot-user": {
    body: {
      login: "bot-user",
      html_url: "https://github.com/bot-user",
      name: "Bot User",
    },
  },
};
const issuesCache = {
  "https://api.github.com/repos/embroider-build/github-changelog/issues/1": {
    body: {
      number: 1,
      title: "feat: May the force be with you",
      labels: [{ name: "Type: New Feature" }],
      pull_request: {
        html_url: "https://github.com/embroider-build/github-changelog/pull/1",
      },
      user: usersCache["https://api.github.com/users/luke"].body,
    },
  },
  "https://api.github.com/repos/embroider-build/github-changelog/issues/2": {
    body: {
      number: 2,
      title: "chore: Terminate her... immediately!",
      labels: [{ name: "Type: Breaking Change" }],
      pull_request: {
        html_url: "https://github.com/embroider-build/github-changelog/pull/2",
      },
      user: usersCache["https://api.github.com/users/gtarkin"].body,
    },
  },
  "https://api.github.com/repos/embroider-build/github-changelog/issues/3": {
    body: {
      number: 3,
      title: "fix: Get me the rebels base!",
      labels: [{ name: "Type: Bug" }],
      pull_request: {
        html_url: "https://github.com/embroider-build/github-changelog/pull/3",
      },
      user: usersCache["https://api.github.com/users/vader"].body,
    },
  },
  "https://api.github.com/repos/embroider-build/github-changelog/issues/4": {
    body: {
      number: 4,
      title: "fix: RRRAARRWHHGWWR",
      labels: [{ name: "Type: Bug" }, { name: "Type: Maintenance" }],
      pull_request: {
        html_url: "https://github.com/embroider-build/github-changelog/pull/4",
      },
      user: usersCache["https://api.github.com/users/chewbacca"].body,
    },
  },
  "https://api.github.com/repos/embroider-build/github-changelog/issues/5": {
    body: {
      number: 5,
      title: "feat: I am your father",
      labels: [{ name: "Type: New Feature" }],
      pull_request: {
        html_url: "https://github.com/embroider-build/github-changelog/pull/5",
      },
      user: usersCache["https://api.github.com/users/vader"].body,
    },
  },
  "https://api.github.com/repos/embroider-build/github-changelog/issues/6": {
    body: {
      number: 6,
      title: "refactor: he is my brother",
      labels: [{ name: "Type: Enhancement" }],
      pull_request: {
        html_url: "https://github.com/embroider-build/github-changelog/pull/6",
      },
      user: usersCache["https://api.github.com/users/princess-leia"].body,
    },
  },
  "https://api.github.com/repos/embroider-build/github-changelog/issues/7": {
    body: {
      number: 7,
      title: "feat: that is not how the Force works!",
      labels: [{ name: "Type: New Feature" }, { name: "Type: Enhancement" }],
      pull_request: {
        html_url: "https://github.com/embroider-build/github-changelog/pull/7",
      },
      user: usersCache["https://api.github.com/users/han-solo"].body,
    },
  },
  "https://api.github.com/repos/embroider-build/github-changelog/issues/8": {
    body: {
      number: 8,
      title: "This is the commit title for the issue (#8)",
      labels: [{ name: "Type: Maintenance" }, { name: "Status: In Progress" }],
      user: {
        login: "bot-user",
        html_url: "https://github.com/bot-user",
        name: "Bot User",
      },
    },
  },
};

describe("createMarkdown", () => {
  beforeEach(() => {
    fetch.__resetMockResponses();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("ignore config", () => {
    it("ignores PRs from bot users even if they were not the (merge) committer", async () => {
      git.changedPaths.mockImplementation((sha) => {
        return listOfPackagesForEachCommit[sha];
      });
      git.lastTag.mockImplementation(() => "v8.0.0");
      git.listCommits.mockImplementation(() => listOfCommits);
      git.listTagNames.mockImplementation(() => listOfTags);

      fetch.__setMockResponses({
        ...usersCache,
        ...issuesCache,
      });

      const changelog = new Changelog({
        ignoreCommitters: ["bot-user"],
      });

      const markdown = await changelog.createMarkdown();

      expect(markdown).toMatchSnapshot();
    });
  });

  describe("single tags", () => {
    it("outputs correct changelog", async () => {
      git.changedPaths.mockImplementation((sha) => listOfPackagesForEachCommit[sha]);
      git.lastTag.mockImplementation(() => "v8.0.0");
      git.listCommits.mockImplementation(() => listOfCommits);
      git.listTagNames.mockImplementation(() => listOfTags);

      fetch.__setMockResponses({
        ...usersCache,
        ...issuesCache,
      });

      const changelog = new Changelog();

      const markdown = await changelog.createMarkdown();

      expect(markdown).toMatchSnapshot();
    });
  });

  describe("multiple tags", () => {
    it("outputs correct changelog", async () => {
      git.changedPaths.mockImplementation((sha) => listOfPackagesForEachCommit[sha]);
      git.lastTag.mockImplementation(() => "v8.0.0");
      git.listCommits.mockImplementation(() => [
        {
          sha: "a0000004",
          refName: "tag: a-new-hope@4.0.0, tag: empire-strikes-back@5.0.0, tag: return-of-the-jedi@6.0.0",
          summary: "chore(release): releasing component",
          date: "1977-05-25",
        },
        {
          sha: "a0000003",
          refName: "",
          summary: "Merge pull request #1 from star-wars",
          date: "1977-05-25",
        },
        {
          sha: "a0000002",
          refName: "tag: v0.1.0",
          summary: "chore(release): releasing component",
          date: "1966-01-01",
        },
        {
          sha: "a0000001",
          refName: "",
          summary: "fix: some random fix which will be ignored",
          date: "1966-01-01",
        },
      ]);
      git.listTagNames.mockImplementation(() => [
        "a-new-hope@4.0.0",
        "attack-of-the-clones@3.1.0",
        "empire-strikes-back@5.0.0",
        "return-of-the-jedi@6.0.0",
        "revenge-of-the-sith@3.0.0",
        "the-force-awakens@7.0.0",
        "the-phantom-menace@1.0.0",
      ]);

      fetch.__setMockResponses({
        ...usersCache,
        ...issuesCache,
      });

      const changelog = new Changelog();

      const markdown = await changelog.createMarkdown();

      expect(markdown).toMatchSnapshot();
    });
  });

  describe("single project", () => {
    it("outputs correct changelog", async () => {
      git.changedPaths.mockImplementation((sha) => listOfFileForEachCommit[sha]);
      git.lastTag.mockImplementation(() => "v8.0.0");
      git.listCommits.mockImplementation(() => listOfCommits);
      git.listTagNames.mockImplementation(() => listOfTags);

      fetch.__setMockResponses({
        ...usersCache,
        ...issuesCache,
      });

      const changelog = new Changelog();

      const markdown = await changelog.createMarkdown();

      expect(markdown).toMatchSnapshot();
    });
  });

  describe("authentication", () => {
    describe("when github token is not valid", () => {
      const badCredentials = {
        message: "Bad credentials",
        documentation_url: "https://developer.github.com/v3",
      };
      beforeEach(async () => {
        git.changedPaths.mockImplementation((sha) => listOfFileForEachCommit[sha]);
        git.lastTag.mockImplementation(() => "v8.0.0");
        git.listCommits.mockImplementation(() => listOfCommits);
        git.listTagNames.mockImplementation(() => listOfTags);

        const unauthorized = {
          status: 401,
          statusText: "Unauthorized",
          ok: false,
          body: badCredentials,
        };

        fetch.__setMockResponses({
          ...usersCache,
          ...Object.keys(issuesCache).reduce(
            (unauthorizedIssues, issue) => ({
              ...unauthorizedIssues,
              [issue]: unauthorized,
            }),
            {}
          ),
        });
      });
      afterEach(() => {
        vi.resetAllMocks();
      });
      it("should abort with a proper error message", async () => {
        const changelog = new Changelog();
        expect.assertions(2);
        try {
          await changelog.createMarkdown();
        } catch (error) {
          expect(error).toEqual(
            expect.objectContaining({ message: expect.stringContaining("Fetch error: Unauthorized") })
          );
          expect(error).toEqual(
            expect.objectContaining({ message: expect.stringContaining(JSON.stringify(badCredentials)) })
          );
        }
      });
    });
  });
});
