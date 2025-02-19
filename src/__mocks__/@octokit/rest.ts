import { vi } from "vitest";

let responses = {
  prs: {} as Record<string, any[]>,
  users: {} as Record<string, any>,
};

function throwError(status: number) {
  const e = new Error();
  (e as any).status = status;
  throw e;
}

export const octokit = {
  args: [] as any,
  repos: {
    listPullRequestsAssociatedWithCommit: vi.fn(({ commit_sha }) => ({
      data: responses.prs[commit_sha] || throwError(404),
    })),
  },
  users: {
    getByUsername: vi.fn(({ username }) => ({ data: responses.users[username] || throwError(404) })),
  },
};
export const Octokit = function (...args: any[]) {
  octokit.args = args;
  return octokit;
};
Octokit.octokit = octokit;
export const __setMockResponses = (res: any) => (responses = res);
export const __resetMockResponses = () => (responses = { prs: {}, users: {} });
