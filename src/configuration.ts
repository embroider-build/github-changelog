import fs from "fs";
import ConfigurationError from "./configuration-error.js";
import { getRootPath } from "./git.js";
import path from "path";
import { getPackagesSync } from "@manypkg/get-packages";
import hostedGitInfo from "hosted-git-info";

export interface Configuration {
  repo: string;
  github?: string;
  rootPath: string;
  labels: { [key: string]: string };
  ignoreCommitters: string[];
  ignoreLabel: string;
  cacheDir?: string;
  nextVersion: string | undefined;
  nextVersionFromMetadata?: boolean;
  wildcardLabel?: string;
  packages: { name: string; path: string }[];
}

export interface ConfigLoaderOptions {
  repo?: string;
  nextVersionFromMetadata?: boolean;
}

export function load(options: ConfigLoaderOptions = {}): Configuration {
  const rootPath = getRootPath();
  return fromPath(rootPath, options);
}

function getPackages(rootPath: string): { name: string; path: string }[] {
  try {
    const { packages } = getPackagesSync(rootPath);

    return packages
      .filter(pkg => !pkg.packageJson.private)
      .map(pkg => ({
        name: pkg.packageJson.name,
        path: pkg.dir,
      }));
  } catch (e) {
    // Pre-existing lerna-changelog (from before the fork) behavior returns []
    // when something goes wrong with package discovery.
    // The error is logged here, just in case it's helpful for folks
    // to debug their projects.
    //
    // Mainly:
    // - packages must have a name when not using private=true
    // - at least one package.json must exist
    //
    // In practice, folks shouldn't see this error at all
    console.error(e);
    return [];
  }
}

export function fromPath(rootPath: string, options: ConfigLoaderOptions = {}): Configuration {
  // Step 1: load partial config from `package.json` or `lerna.json`
  const config = fromPackageConfig(rootPath) || fromLernaConfig(rootPath) || {};

  if (options.repo) {
    config.repo = options.repo;
  }

  // Step 2: fill partial config with defaults
  let { repo, nextVersion, labels, cacheDir, ignoreCommitters, ignoreLabel, wildcardLabel, github } = config;

  const packages = getPackages(rootPath);

  if (!repo) {
    repo = findRepo(rootPath);
    if (!repo) {
      throw new ConfigurationError('Could not infer "repo" from the "package.json" file.');
    }
  }

  if (options.nextVersionFromMetadata || config.nextVersionFromMetadata) {
    nextVersion = findNextVersion(rootPath);

    if (!nextVersion) {
      throw new ConfigurationError('Could not infer "nextVersion" from the "package.json" file.');
    }
  }

  if (!labels) {
    labels = {
      breaking: ":boom: Breaking Change",
      enhancement: ":rocket: Enhancement",
      bug: ":bug: Bug Fix",
      documentation: ":memo: Documentation",
      internal: ":house: Internal",
    };
  }

  if (!wildcardLabel) {
    wildcardLabel = `_github-changelog_unlabeled_`;
  }

  if (wildcardLabel && !labels[wildcardLabel]) {
    labels[wildcardLabel] = ":present: Additional updates";
  }

  if (!ignoreCommitters) {
    ignoreCommitters = [
      "dependabot-bot",
      "dependabot[bot]",
      "dependabot-preview[bot]",
      "greenkeeperio-bot",
      "greenkeeper[bot]",
      "renovate-bot",
      "renovate[bot]",
    ];
  }

  if (!ignoreLabel) {
    ignoreLabel = "ignore";
  }

  return {
    repo,
    nextVersion,
    rootPath,
    labels,
    ignoreCommitters,
    ignoreLabel,
    cacheDir,
    wildcardLabel,
    packages,
    github,
  };
}

function fromLernaConfig(rootPath: string): Partial<Configuration> | undefined {
  const lernaPath = path.join(rootPath, "lerna.json");
  if (fs.existsSync(lernaPath)) {
    return JSON.parse(fs.readFileSync(lernaPath).toString()).changelog;
  }
}

function fromPackageConfig(rootPath: string): Partial<Configuration> | undefined {
  const pkgPath = path.join(rootPath, "package.json");
  if (fs.existsSync(pkgPath)) {
    return JSON.parse(fs.readFileSync(pkgPath).toString()).changelog;
  }
}

function findRepo(rootPath: string): string | undefined {
  const pkgPath = path.join(rootPath, "package.json");
  if (!fs.existsSync(pkgPath)) {
    return;
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath).toString());
  if (!pkg.repository) {
    return;
  }

  return findRepoFromPkg(pkg);
}

function findNextVersion(rootPath: string): string | undefined {
  const pkgPath = path.join(rootPath, "package.json");
  const lernaPath = path.join(rootPath, "lerna.json");

  const pkg = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath).toString()) : {};
  const lerna = fs.existsSync(lernaPath) ? JSON.parse(fs.readFileSync(lernaPath).toString()) : {};

  return pkg.version ? `v${pkg.version}` : lerna.version ? `v${lerna.version}` : undefined;
}

export function findRepoFromPkg(pkg: any): string | undefined {
  const url = pkg.repository.url || pkg.repository;
  const info = hostedGitInfo.fromUrl(url);
  if (info && info.type === "github") {
    return `${info.user}/${info.project}`;
  }
  // cannot detect self hosted GitHub, e.g
  // git@github.host.com:embroider-build/github-changelog.git
  // https://github.host.com/embroider-build/github-changelog.git
  const matchHttps = /https:\/\/[^/]+\/([^/]+)\/([^/]+)\.git/.exec(url);
  if (matchHttps && matchHttps.length === 3) {
    return `${matchHttps[1]}/${matchHttps[2]}`;
  }
  const matchGit = /git@[^:]+:([^/]+)\/([^/]+)\.git/.exec(url);
  if (matchGit && matchGit.length === 3) {
    return `${matchGit[1]}/${matchGit[2]}`;
  }
}
