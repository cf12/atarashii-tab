import { describe, expect, it } from "vitest"
import {
  ConfigStore,
  pickValue,
  toggle,
  toggleMenu,
  toggleNsfw,
} from "../../src/stores/ConfigStore"

describe("ConfigStore helpers", () => {
  it("toggle flips toggleable fields", () => {
    const initial = ConfigStore.hideGui

    toggle("hideGui")
    expect(ConfigStore.hideGui).toBe(!initial)

    toggle("hideGui")
    expect(ConfigStore.hideGui).toBe(initial)
  })

  it("toggleNsfw flips nsfw", () => {
    const initial = ConfigStore.nsfw

    toggleNsfw()
    expect(ConfigStore.nsfw).toBe(!initial)

    toggleNsfw()
    expect(ConfigStore.nsfw).toBe(initial)
  })

  it("pickValue updates pickable fields and sets t=all for sort=new", () => {
    pickValue("t", "month")
    expect(ConfigStore.t).toBe("month")

    pickValue("sort", "new")
    expect(ConfigStore.sort).toBe("new")
    expect(ConfigStore.t).toBe("all")
  })

  it("toggleMenu flips visibility", () => {
    const initial = ConfigStore.isMenuVisible

    toggleMenu()
    expect(ConfigStore.isMenuVisible).toBe(!initial)

    toggleMenu()
    expect(ConfigStore.isMenuVisible).toBe(initial)
  })
})
