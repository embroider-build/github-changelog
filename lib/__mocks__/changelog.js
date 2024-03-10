"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Changelog = jest.requireActual("../changelog").default;
const defaultConfig = {
    rootPath: "../",
    repo: "lerna/lerna-changelog",
    labels: {
        "Type: New Feature": ":rocket: New Feature",
        "Type: Breaking Change": ":boom: Breaking Change",
        "Type: Bug": ":bug: Bug Fix",
        "Type: Enhancement": ":nail_care: Enhancement",
        "Type: Documentation": ":memo: Documentation",
        "Type: Maintenance": ":house: Maintenance",
    },
    ignoreCommitters: [],
    cacheDir: ".changelog",
    nextVersion: "Unreleased",
    packages: [],
};
class MockedChangelog extends Changelog {
    constructor(config) {
        super(Object.assign({}, defaultConfig, config));
    }
    getToday() {
        return "2099-01-01";
    }
}
exports.default = MockedChangelog;
