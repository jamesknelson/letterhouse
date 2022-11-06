import { exec } from 'node:child_process'

import { SiteEditURLGetter } from '../model/site'

// From: https://stackoverflow.com/questions/62225567/get-current-git-branch-with-node-js
export function getGitCurrentBranch(): Promise<string | null> {
  return new Promise((resolve, reject) =>
    exec('git rev-parse --abbrev-ref HEAD', (err, stdout, stderr) => {
      if (!err && typeof stdout === 'string') {
        console.error('pass!')
        resolve(stdout.trim())
      } else if (stderr.includes('not a git repository')) {
        resolve(null)
      } else {
        reject(
          `Couldn't get current git branch: ${
            err || stderr || 'unknown response type'
          }`,
        )
      }
    }),
  )
}

export function createGithubEditURLGetter(
  repositoryName: string | ((branchName: string) => string),
): SiteEditURLGetter {
  const gitBranchPromise = getGitCurrentBranch()
  const editURLGetter: SiteEditURLGetter = async (file: string) => {
    const gitBranch = await gitBranchPromise
    if (!gitBranch) {
      return null
    }

    const repository =
      typeof repositoryName === 'function'
        ? repositoryName(gitBranch)
        : repositoryName
    return `https://github.com/${repository}/edit/${gitBranch}/content/${file}`
  }
  return editURLGetter
}
