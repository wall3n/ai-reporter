import type { CursorStore } from "../core/types";
import { getDatabase } from "./db";

export class DatabaseCursorStore implements CursorStore {
  private cache = new Map<string, any>();
  private dirty = new Set<string>();

  constructor() {
    this.reload();
  }

  public reload(): void {
    const existing = getDatabase().getAllCursors();
    this.cache.clear();
    for (const [k, v] of existing.entries()) {
      this.cache.set(k, v);
    }
    this.dirty.clear();
  }

  public get<T = any>(key: string): T | undefined {
    return this.cache.get(key);
  }

  public set(key: string, value: any): void {
    this.cache.set(key, value);
    this.dirty.add(key);
  }

  public save(): void {
    if (this.dirty.size === 0) {
      return;
    }
    const entries: [string, any][] = [];
    for (const key of this.dirty) {
      entries.push([key, this.cache.get(key)]);
    }
    getDatabase().saveCursorsBatch(entries);
    this.dirty.clear();
  }
}

export function openCursorStore(): CursorStore {
  return new DatabaseCursorStore();
}
