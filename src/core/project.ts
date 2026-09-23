import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

export type ProjectRef = {
  dirHash: string;
  name: string;
  gitBranch?: string;
  repo?: string;
};

const GITHUB_REPO_PATTERN =
  /(?:github\.com[/:])([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?$/;

export function projectRef(
  cwd?: string,
  explicitBranch?: string
): ProjectRef | undefined {
  if (!cwd) {
    return undefined;
  }
  const cleanPath = resolve(cwd);
  const dirHash = createHash("sha256").update(cleanPath).digest("hex").slice(0, 16);
  const name = basename(cleanPath) || "workspace";

  let gitBranch = explicitBranch?.trim() || undefined;
  let repo: string | undefined;

  const gitHead = join(cleanPath, ".git", "HEAD");
  if (!gitBranch && existsSync(gitHead)) {
    try {
      const head = readFileSync(gitHead, "utf8").trim();
      if (head.startsWith("ref: refs/heads/")) {
        gitBranch = head.slice(16);
      }
    } catch {
      // Ignore git read error
    }
  }

  const gitConfig = join(cleanPath, ".git", "config");
  if (existsSync(gitConfig)) {
    try {
      const config = readFileSync(gitConfig, "utf8");
      const match = config.match(GITHUB_REPO_PATTERN);
      if (match && match[1] && match[2]) {
        repo = `${match[1]}/${match[2]}`;
      }
    } catch {
      // Ignore git config read error
    }
  }

  return {
    dirHash,
    name,
    ...(gitBranch ? { gitBranch } : {}),
    ...(repo ? { repo } : {}),
  };
}
