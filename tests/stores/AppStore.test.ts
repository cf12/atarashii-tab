import { describe, expect, it } from "vitest"
import { AppStore, LoadState, setLoaded } from "../../src/stores/AppStore"

describe("AppStore helpers", () => {
  it("setLoaded updates the loaded state", () => {
    setLoaded(LoadState.LOADING)
    expect(AppStore.loaded).toBe(LoadState.LOADING)

    setLoaded(LoadState.LOADED)
    expect(AppStore.loaded).toBe(LoadState.LOADED)
  })
})
