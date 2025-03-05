import chalk = require("chalk");

import { highlight } from "cli-highlight";

import Changelog from "./changelog";
import { load as loadConfig } from "./configuration";
import ConfigurationError from "./configuration-error";

const NEXT_VERSION_DEFAULT = "Unreleased";

export async function run() {
  const yargs = require("yargs");

  const argv = yargs
    .usage("github-changelog [options]")
    .options({
      from: {
        type: "string",
        desc: "A git tag or commit hash that determines the lower bound of the range of commits",
        defaultDescription: "latest tagged commit",
      },
      to: {
        type: "string",
        desc: "A git tag or commit hash that determines the upper bound of the range of commits",
      },
      "tag-from": {
        hidden: true,
        type: "string",
        desc: "A git tag that determines the lower bound of the range of commits (defaults to last available)",
      },
      "tag-to": {
        hidden: true,
        type: "string",
        desc: "A git tag that determines the upper bound of the range of commits",
      },
      "next-version": {
        type: "string",
        desc: "The name of the next version",
        default: NEXT_VERSION_DEFAULT,
      },
      "next-version-from-metadata": {
        type: "boolean",
        desc: "Infer the name of the next version from package metadata",
        default: false,
      },
      repo: {
        type: "string",
        desc: "`<USER|ORG>/<PROJECT>` of the GitHub project",
        defaultDescription: "inferred from the `package.json` file",
      },
    })
    .example(
      "github-changelog",
      'create a changelog for the changes after the latest available tag, under "Unreleased" section'
    )
    .example(
      "github-changelog --from=0.1.0 --to=0.3.0",
      "create a changelog for the changes in all tags within the given range"
    )
    .epilog("For more information, see https://github.com/embroider-build/github-changelog")
    .wrap(Math.min(100, yargs.terminalWidth()))
    .parse();

  let options = {
    tagFrom: argv["from"] || argv["tag-from"],
    tagTo: argv["to"] || argv["tag-to"],
  };

  try {
    let config = loadConfig({
      nextVersionFromMetadata: argv["next-version-from-metadata"],
      repo: argv.repo,
    });

    if (argv["next-version"] !== NEXT_VERSION_DEFAULT) {
      config.nextVersion = argv["next-version"];
    }

    let result = await new Changelog(config).createMarkdown(options);

    let highlighted = highlight(result, {
      language: "Markdown",
      theme: {
        section: chalk.bold,
        string: chalk.hex("#0366d6"),
        link: chalk.dim,
      },
    });

    console.log(highlighted);
  } catch (e) {
    if (e instanceof ConfigurationError) {
      console.log(chalk.red(e.message));
    } else {
      console.log(chalk.red((e as any).stack));
    }

    process.exitCode = 1;
  }
}
