import GithubAPI from "../github-api.js";

class MockedGithubAPI extends GithubAPI {
  protected getAuthToken() {
    return "123";
  }
}

export default MockedGithubAPI;
