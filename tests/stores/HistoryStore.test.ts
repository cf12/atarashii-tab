import { beforeEach, describe, expect, it } from "vitest"
import {
  clearHistory,
  createImageData,
  HistoryStore,
  pushPostToHistory,
  removeHistoryAt,
  toggleFavoriteAt,
} from "../../src/stores/HistoryStore"
import { makeImageData, makePost, resetStores } from "../helpers"

describe("HistoryStore", () => {
  beforeEach(() => {
    resetStores()
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1280 })
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 720 })
  })

  it("creates display data from post titles and preview images", () => {
    const data = createImageData(
      makePost({
        title: "Scenery [3840x2160] (Artist) {OC}",
        url: "https://i.redd.it/full.jpg",
        preview: {
          images: [
            {
              source: {
                url: "https://preview.redd.it/source.jpg?amp;token=1",
                width: 3840,
                height: 2160,
              },
              resolutions: [
                {
                  url: "https://preview.redd.it/small.jpg?amp;token=1",
                  width: 640,
                  height: 360,
                },
                {
                  url: "https://preview.redd.it/large.jpg?amp;token=1",
                  width: 1920,
                  height: 1080,
                },
              ],
            },
          ],
        },
      }),
      2,
      5,
    )

    expect(data.title).toBe("Scenery • Artist • OC")
    expect(data.res).toBe("3840 × 2160")
    expect(data.backgroundUrl).toBe("https://preview.redd.it/large.jpg?amp;token=1")
    expect(data.thumbnailUrl).toBe("https://preview.redd.it/small.jpg?amp;token=1")
    expect(data.link).toBe("https://redd.it/abc123")
    expect(data.nums).toEqual([2, 5])
  })

  it("pushes posts and tracks the active history index", () => {
    pushPostToHistory(makePost({ id: "one" }), 0, 2)
    pushPostToHistory(makePost({ id: "two" }), 1, 2)

    expect(HistoryStore.history.map(({ link }) => link)).toEqual([
      "https://redd.it/one",
      "https://redd.it/two",
    ])
    expect(HistoryStore.i).toBe(1)
  })

  it("keeps favorites when clearing and updates the current index", () => {
    HistoryStore.history = [
      makeImageData({ title: "Old favorite", favorite: true }),
      makeImageData({ title: "Current favorite", favorite: true }),
      makeImageData({ title: "Plain" }),
    ]
    HistoryStore.i = 1

    clearHistory()

    expect(HistoryStore.history.map(({ title }) => title)).toEqual([
      "Old favorite",
      "Current favorite",
    ])
    expect(HistoryStore.i).toBe(1)
  })

  it("selects the last favorite when clearing a non-favorite current item", () => {
    HistoryStore.history = [
      makeImageData({ title: "Favorite", favorite: true }),
      makeImageData({ title: "Plain" }),
    ]
    HistoryStore.i = 1

    clearHistory()

    expect(HistoryStore.history.map(({ title }) => title)).toEqual(["Favorite"])
    expect(HistoryStore.i).toBe(0)
  })

  it("removes history entries and clamps the current index", () => {
    HistoryStore.history = [
      makeImageData({ title: "One" }),
      makeImageData({ title: "Two" }),
      makeImageData({ title: "Three" }),
    ]
    HistoryStore.i = 2

    removeHistoryAt(-1)
    removeHistoryAt(1)

    expect(HistoryStore.history.map(({ title }) => title)).toEqual(["One", "Three"])
    expect(HistoryStore.i).toBe(1)

    removeHistoryAt(1)

    expect(HistoryStore.history.map(({ title }) => title)).toEqual(["One"])
    expect(HistoryStore.i).toBe(0)

    removeHistoryAt(0)

    expect(HistoryStore.history).toEqual([])
    expect(HistoryStore.i).toBe(-1)
  })

  it("toggles favorite state for valid history entries", () => {
    HistoryStore.history = [makeImageData({ favorite: false })]

    toggleFavoriteAt(0)
    expect(HistoryStore.history[0].favorite).toBe(true)

    toggleFavoriteAt(0)
    toggleFavoriteAt(99)

    expect(HistoryStore.history[0].favorite).toBe(false)
  })
})
