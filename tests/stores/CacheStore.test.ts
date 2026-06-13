import { describe, expect, it } from "vitest"
import { CacheStore, clearCache } from "../../src/stores/CacheStore"

describe("CacheStore helpers", () => {
  it("clearCache resets cache data and timestamp", () => {
    CacheStore.data = [{ id: "x" }]
    CacheStore.lastUpdated = 12345

    clearCache()

    expect(CacheStore.data).toEqual([])
    expect(CacheStore.lastUpdated).toBe(-1)
  })
})
