import { describe, it, vi } from "vitest";
import execa from "execa";
import { expect } from "vitest";

if (!process.env.GITHUB_AUTH) {
  console.warn("Warning: to run all tests you need to provide a GITHUB_AUTH");
}

describe("command line interface", () => {
  it.skipIf(!process.env.GITHUB_AUTH)("can produce a result", async () => {
    const { stdout } = await execa.node("./bin/cli.js", [
      "--from=ee1c697fcf871114c53e9847c43e221d3056f19d",
      "--to=b20002d9760e9e212bc623c8f3f42931ddc01bda",
    ]);

    expect(stdout).toMatchInlineSnapshot(`
      "
      ## Unreleased (2025-03-05)

      #### :rocket: Enhancement
      * \`github-changelog\`
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
});
