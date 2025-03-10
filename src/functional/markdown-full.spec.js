import * as MockedOctokit from "../__mocks__/@octokit/rest";
import { Octokit } from "@octokit/rest";
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest";
import * as git from "../git";
import Changelog from "../changelog";

vi.mock("../../src/progress-bar");
vi.mock("../changelog");
vi.mock("../../src/github-api");
vi.mock("../git");
vi.mock("@octokit/rest");

const listOfCommits = [
  {
    sha: "a0000018",
    refName: "",
    summary: "local testing, not pushed",
    date: "2017-01-01",
  },
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
  a0000018: ["packages/return-of-the-jedi/package.json"],
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
  a0000018: ["packages/return-of-the-jedi/package.json"],
};

const usersCache = {
  luke: {
    login: "luke",
    html_url: "https://github.com/luke",
    name: "Luke Skywalker",
  },
  "princess-leia": {
    login: "princess-leia",
    html_url: "https://github.com/princess-leia",
    name: "Princess Leia Organa",
  },
  vader: {
    login: "vader",
    html_url: "https://github.com/vader",
    name: "Darth Vader",
  },
  gtarkin: {
    login: "gtarkin",
    html_url: "https://github.com/gtarkin",
    name: "Governor Tarkin",
  },
  "han-solo": {
    login: "han-solo",
    html_url: "https://github.com/han-solo",
    name: "Han Solo",
  },
  chewbacca: {
    login: "chewbacca",
    html_url: "https://github.com/chewbacca",
    name: "Chwebacca",
  },
  "rd-d2": {
    login: "rd-d2",
    html_url: "https://github.com/rd-d2",
    name: "R2-D2",
  },
  "c-3po": {
    login: "c-3po",
    html_url: "https://github.com/c-3po",
    name: "C-3PO",
  },
  "bot-user": {
    login: "bot-user",
    html_url: "https://github.com/bot-user",
    name: "Bot User",
  },
};
const issuesCache = {
  a0000001: [],

  a0000002: [],

  a0000003: [
    {
      number: 1,
      title: "feat: May the force be with you",
      labels: [{ name: "Type: New Feature" }],
      html_url: "https://github.com/embroider-build/github-changelog/pull/1",
      user: usersCache["luke"],
    },
  ],

  a0000004: [],

  a0000005: [],

  a0000006: [
    {
      number: 2,
      title: "chore: Terminate her... immediately!",
      labels: [{ name: "Type: Breaking Change" }],
      html_url: "https://github.com/embroider-build/github-changelog/pull/2",
      user: usersCache["gtarkin"],
    },
  ],

  a0000007: [],

  a0000008: [
    {
      number: 3,
      title: "fix: Get me the rebels base!",
      labels: [{ name: "Type: Bug" }],
      html_url: "https://github.com/embroider-build/github-changelog/pull/3",
      user: usersCache["vader"],
    },
  ],

  a0000009: [],

  a0000010: [
    {
      number: 4,
      title: "fix: RRRAARRWHHGWWR",
      labels: [{ name: "Type: Bug" }, { name: "Type: Maintenance" }],
      html_url: "https://github.com/embroider-build/github-changelog/pull/4",
      user: usersCache["chewbacca"],
    },
  ],

  a0000011: [
    {
      number: 5,
      title: "feat: I am your father",
      labels: [{ name: "Type: New Feature" }],
      html_url: "https://github.com/embroider-build/github-changelog/pull/5",
      user: usersCache["vader"],
    },
  ],

  a0000012: [
    {
      number: 6,
      title: "refactor: he is my brother",
      labels: [{ name: "Type: Enhancement" }],
      html_url: "https://github.com/embroider-build/github-changelog/pull/6",
      user: usersCache["princess-leia"],
    },
  ],

  a0000013: [],

  a0000014: [
    {
      number: 7,
      title: "feat: that is not how the Force works!",
      labels: [{ name: "Type: New Feature" }, { name: "Type: Enhancement" }],
      html_url: "https://github.com/embroider-build/github-changelog/pull/7",
      user: usersCache["han-solo"],
    },
  ],

  a0000015: [],

  a0000016: [],

  a0000017: [
    {
      number: 8,
      title: "This is the commit title for the issue (#8)",
      labels: [{ name: "Type: Maintenance" }, { name: "Status: In Progress" }],
      user: usersCache["bot-user"],
    },
  ],
};

describe("createMarkdown", () => {
  beforeEach(() => {
    MockedOctokit.__resetMockResponses();
    Octokit.mockImplementation((...args) => MockedOctokit.Octokit(...args));
    Octokit.plugin.mockImplementation(() => MockedOctokit.Octokit);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("ignore config", () => {
    it("ignores PRs from bot users even if they were not the (merge) committer", async () => {
      git.changedPaths.mockImplementation(sha => {
        return listOfPackagesForEachCommit[sha];
      });
      git.lastTag.mockImplementation(() => "v8.0.0");
      git.listCommits.mockImplementation(() => listOfCommits);
      git.listTagNames.mockImplementation(() => listOfTags);

      MockedOctokit.__setMockResponses({
        users: { ...usersCache },
        prs: { ...issuesCache },
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
      git.changedPaths.mockImplementation(sha => listOfPackagesForEachCommit[sha]);
      git.lastTag.mockImplementation(() => "v8.0.0");
      git.listCommits.mockImplementation(() => listOfCommits);
      git.listTagNames.mockImplementation(() => listOfTags);

      MockedOctokit.__setMockResponses({
        users: { ...usersCache },
        prs: { ...issuesCache },
      });

      const changelog = new Changelog();

      const markdown = await changelog.createMarkdown();

      expect(markdown).toMatchSnapshot();
    });
  });

  describe("multiple tags", () => {
    it("outputs correct changelog", async () => {
      git.changedPaths.mockImplementation(sha => listOfPackagesForEachCommit[sha]);
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

      MockedOctokit.__setMockResponses({
        users: { ...usersCache },
        prs: { ...issuesCache },
      });

      const changelog = new Changelog();

      const markdown = await changelog.createMarkdown();

      expect(markdown).toMatchSnapshot();
    });
  });

  describe("single project", () => {
    it("outputs correct changelog", async () => {
      git.changedPaths.mockImplementation(sha => listOfFileForEachCommit[sha]);
      git.lastTag.mockImplementation(() => "v8.0.0");
      git.listCommits.mockImplementation(() => listOfCommits);
      git.listTagNames.mockImplementation(() => listOfTags);

      MockedOctokit.__setMockResponses({
        users: { ...usersCache },
        prs: { ...issuesCache },
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
        git.changedPaths.mockImplementation(sha => listOfFileForEachCommit[sha]);
        git.lastTag.mockImplementation(() => "v8.0.0");
        git.listCommits.mockImplementation(() => listOfCommits);
        git.listTagNames.mockImplementation(() => listOfTags);

        const unauthorized = {
          status: 401,
          statusText: "Unauthorized",
          ok: false,
          body: badCredentials,
        };

        MockedOctokit.__setMockResponses({
          users: { ...usersCache },
          prs: {
            ...Object.keys(issuesCache).reduce(
              (unauthorizedIssues, issue) => ({
                ...unauthorizedIssues,
                [issue]: unauthorized,
              }),
              {}
            ),
          },
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
          expect(error).toEqual(expect.objectContaining({ message: expect.stringContaining("Bad credentials") }));
          expect(error).toEqual(
            expect.objectContaining({ message: expect.stringContaining(JSON.stringify(badCredentials)) })
          );
        }
      });
    });
  });
});
