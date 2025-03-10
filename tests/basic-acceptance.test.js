import { describe, it, vi } from "vitest";
import execa from "execa";
import { expect } from "vitest";

if (!process.env.GITHUB_AUTH) {
  console.warn("Warning: to run all tests you need to provide a GITHUB_AUTH");
}

describe("command line interface", () => {
  it.skipIf(!process.env.GITHUB_AUTH)("can produce a result when commit is a non first parent", async () => {
    const from = "ee1c697fcf871114c53e9847c43e221d3056f19d";
    const to = "b20002d9760e9e212bc623c8f3f42931ddc01bda";
    const { stdout: gitOut } = execa.sync("git", [
      "log",
      "--oneline",
      "--date=short",
      "--first-parent",
      `${from}..${to}`,
    ]);

    expect(gitOut).toMatchInlineSnapshot(`
      "b20002d ignore private packages by default
      c693afc allow ignoring packages
      5f49870 Merge pull request #33 from patricklx/patch-2
      d6b4ad4 Merge pull request #29 from embroider-build/release-preview"
    `);

    let { stdout } = await execa.node("./bin/cli.js", [`--from=${from}`, `--to=${to}`]);
    stdout = stdout.replace(/^## Release .*/, "## Release (2025-03-06)");
    expect(stdout).toMatchInlineSnapshot(`
      "
      ## Unreleased (2025-03-06)

      #### :rocket: Enhancement
      * \`github-changelog\`
        * [#37](https://github.com/embroider-build/github-changelog/pull/37) ignore private packages ([@patricklx](https://github.com/patricklx))
        * [#33](https://github.com/embroider-build/github-changelog/pull/33) support github enterpise url detection and env vars ([@patricklx](https://github.com/patricklx))

      #### Committers: 1
      - Patrick Pircher ([@patricklx](https://github.com/patricklx))


      ## v1.1.0-github-changelog (2025-01-25)

      #### :house: Internal
      * \`github-changelog\`
        * [#29](https://github.com/embroider-build/github-changelog/pull/29) Prepare Release ([@github-actions[bot]](https://github.com/apps/github-actions))

      #### Committers: 1
      - [@github-actions[bot]](https://github.com/apps/github-actions)"
    `);
  });

  it.skipIf(!process.env.GITHUB_AUTH)("can produce a result", async () => {
    const from = "ee1c697fcf871114c53e9847c43e221d3056f19d";
    const to = "09a1017fee768a4339a5b9fd0fab729fd23aa737";
    const { stdout: gitOut } = execa.sync("git", [
      "log",
      "--oneline",
      "--date=short",
      "--first-parent",
      `${from}..${to}`,
    ]);

    expect(gitOut).toMatchInlineSnapshot(`
      "09a1017 Merge pull request #36 from patricklx/ignore-label
      47e597c Merge pull request #25 from embroider-build/windows-tests
      c787f47 Merge pull request #32 from embroider-build/vitest
      f699a55 Merge pull request #38 from embroider-build/node-16
      0db8b15 Merge pull request #34 from embroider-build/release-preview
      5f49870 Merge pull request #33 from patricklx/patch-2
      d6b4ad4 Merge pull request #29 from embroider-build/release-preview"
    `);

    let { stdout } = await execa.node("./bin/cli.js", [`--from=${from}`, `--to=${to}`, "--next-version=Release"]);
    stdout = stdout.replace(/^## Release .*/, "## Release (2025-03-06)");
    expect(stdout).toMatchInlineSnapshot(`
      "
      ## Release (2025-03-06)

      #### :boom: Breaking Change
      * \`github-changelog\`
        * [#38](https://github.com/embroider-build/github-changelog/pull/38) drop support for node 16 ([@mansona](https://github.com/mansona))

      #### :rocket: Enhancement
      * \`github-changelog\`
        * [#36](https://github.com/embroider-build/github-changelog/pull/36) add ignore label ([@patricklx](https://github.com/patricklx))

      #### :house: Internal
      * \`github-changelog\`
        * [#25](https://github.com/embroider-build/github-changelog/pull/25) add windows tests ([@mansona](https://github.com/mansona))
        * [#32](https://github.com/embroider-build/github-changelog/pull/32) convert to vitest ([@mansona](https://github.com/mansona))

      #### Committers: 2
      - Chris Manson ([@mansona](https://github.com/mansona))
      - Patrick Pircher ([@patricklx](https://github.com/patricklx))


      ## v1.2.0-github-changelog (2025-02-23)

      #### :rocket: Enhancement
      * \`github-changelog\`
        * [#33](https://github.com/embroider-build/github-changelog/pull/33) support github enterpise url detection and env vars ([@patricklx](https://github.com/patricklx))

      #### :house: Internal
      * \`github-changelog\`
        * [#34](https://github.com/embroider-build/github-changelog/pull/34) Prepare Release ([@github-actions[bot]](https://github.com/apps/github-actions))

      #### Committers: 2
      - Patrick Pircher ([@patricklx](https://github.com/patricklx))
      - [@github-actions[bot]](https://github.com/apps/github-actions)


      ## v1.1.0-github-changelog (2025-01-25)

      #### :house: Internal
      * \`github-changelog\`
        * [#29](https://github.com/embroider-build/github-changelog/pull/29) Prepare Release ([@github-actions[bot]](https://github.com/apps/github-actions))

      #### Committers: 1
      - [@github-actions[bot]](https://github.com/apps/github-actions)"
    `);
  });
});
