# github-changelog

[![CI](https://github.com/embroider-build/github-changelog/actions/workflows/ci.yml/badge.svg)](https://github.com/embroider-build/github-changelog/actions/workflows/ci.yml)
![npm](https://img.shields.io/npm/dw/github-changelog)

PR-based changelog generator with monorepo support


## Usage

```bash
npx github-changelog
```

```md
## Unreleased (2018-05-24)

#### :bug: Bug Fix
* [#198](https://github.com/my-org/my-repo/pull/198) Avoid an infinite loop ([@helpful-hacker](https://github.com/helpful-hacker))

#### :house: Internal
* [#183](https://github.com/my-org/my-repo/pull/183) Standardize error messages ([@careful-coder](https://github.com/careful-coder))

#### Commiters: 2
- Helpful Hacker ([@helpful-hacker](https://github.com/helpful-hacker))
- [@careful-coder](https://github.com/careful-coder)
```

By default `github-changelog` will show all pull requests that have been merged
since the latest tagged commit in the repository. That is however only true for
pull requests with certain labels applied. The labels that are supported by
default are:

- `breaking` (:boom: Breaking Change)
- `enhancement` (:rocket: Enhancement)
- `bug` (:bug: Bug Fix)
- `documentation` (:memo: Documentation)
- `internal` (:house: Internal)

You can also use the `--from` and `--to` options to view a different
range of pull requests:

```bash
npx github-changelog --from=v1.0.0 --to=v2.0.0
```

### Monorepo support

If you have a packages folder and your projects in subfolders of that folder `github-changelog` will detect it and include the package names in the changelog for the relevant changes.

### GitHub Token

Since `github-changelog` interacts with the GitHub API you may run into rate
limiting issues which can be resolved by supplying a "personal access token":

```
export GITHUB_AUTH="..."
```

You'll need a [personal access token](https://github.com/settings/tokens)
for the GitHub API with the `repo` scope for private repositories or just
`public_repo` scope for public repositories.


## Configuration

You can configure `github-changelog` in various ways. The easiest way is by
adding a `changelog` key to the `package.json` file of your project:

```json5
{
  // ...
  "changelog": {
    "labels": {
      "feature": "New Feature",
      "bug": "Bug Fix"
    }
  }
}
```

The supported options are:

- `repo`: Your "org/repo" on GitHub
  (automatically inferred from the `package.json` file)

- `github`: the github domain, default: github.com

- `nextVersion`: Title for unreleased commits
  (e.g. `Unreleased`)

- `labels`: GitHub PR labels mapped to changelog section headers

- `wildcardLabel`: A label to identify commits that don't have a GitHub PR label
  which matches a value in `labels`. (e.g. `unlabeled`) By default, this has no value. [Read more about this option](#wildcardlabel).

- `ignoreCommitters`: List of committers to ignore (exact or partial match).
  Useful for example to ignore commits from bots.

- `cacheDir`: Path to a GitHub API response cache to avoid throttling
  (e.g. `.changelog`)

### wildcardLabel

For some projects, it may be beneficial to list PRs in the changelog that don't
have a matching label defined in the configuration `labels`. Listing these PRs also allows you to review the changelog and identify any PRs that should be re-labeled on GitHub. For example, forgetting to label a breaking change.

```json5
{
  // ...
  "changelog": {
    "wildcardLabel": "unlabeled"
  }
}
```

A default changlog heading of `:present: Additional updates` is set when a value for `wildcardLabel` is in the configuration.

```md
## Unreleased (2018-05-24)

#### 🎁 Additional updates
* [#514](https://github.com/my-org/my-repo/pull/514) Setting to mute video ([@diligent-developer](https://github.com/diligent-developer))
```

You can overwrite the default heading by including the `wildcardLabel` value in the configuration's `labels` object. For example:

```json5
{
  // ...
  "changelog": {
    "labels": {
      "feature": "New Feature",
      "bug": "Bug Fix",
      "unlabeled": "Unlabeled PRs"
    },
    "wildcardLabel": "unlabeled"
  }
}
```


## License

`github-changelog` is released under the [MIT License](LICENSE).
