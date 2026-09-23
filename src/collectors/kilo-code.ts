import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Collector } from "../core/types";
import { collectOpenCodeFromDb } from "./opencode";

export const KILO_CODE = "kilo-code" as const;

const DB_NAME = /^(kilo|opencode)(-[A-Za-z0-9._-]+)?\.db$/;

export function kiloDataDir(): string {
  const data =
    process.env.XDG_DATA_HOME?.trim() || join(homedir(), ".local", "share");
  return join(data, "kilo");
}

export function kiloDbPaths(dir = kiloDataDir()): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir)
    .filter((name) => DB_NAME.test(name))
    .sort()
    .map((name) => join(dir, name));
}

export const kiloCodeCollector: Collector = {
  id: KILO_CODE,
  name: "Kilo Code",
  discover: () => Promise.resolve(kiloDbPaths()),
  collect: async function* (ctx) {
    const paths = kiloDbPaths();
    for (const p of paths) {
      yield* collectOpenCodeFromDb(p, ctx, KILO_CODE);
    }
  },
};
