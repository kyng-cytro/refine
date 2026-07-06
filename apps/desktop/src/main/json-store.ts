import { app } from "electron"
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "fs"
import { dirname, join } from "path"

/** Minimal persisted JSON settings store (electron-store without the ESM baggage). */
export class JsonStore<T extends Record<string, unknown>> {
  private path: string
  private data: T

  constructor(filename: string, defaults: T) {
    this.path = join(app.getPath("userData"), filename)
    let loaded: Partial<T> = {}
    try {
      loaded = JSON.parse(readFileSync(this.path, "utf8"))
    } catch {
      // first run or corrupt file - fall back to defaults
    }
    this.data = { ...defaults, ...loaded }
  }

  get<K extends keyof T>(key: K): T[K] {
    return this.data[key]
  }

  set(patch: Partial<T>): void {
    this.data = { ...this.data, ...patch }
    this.flush()
  }

  private flush(): void {
    const tmp = `${this.path}.tmp`
    mkdirSync(dirname(this.path), { recursive: true })
    writeFileSync(tmp, JSON.stringify(this.data, null, 2))
    renameSync(tmp, this.path)
  }
}
