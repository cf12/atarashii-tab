import "@testing-library/jest-dom"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useEffect } from "react"
import { describe, expect, it } from "vitest"
import Menu from "../../src/components/Menu"
import { AppStore, LoadState, setLoaded } from "../../src/stores/AppStore"
import { ConfigStore } from "../../src/stores/ConfigStore"
import { HistoryStore } from "../../src/stores/HistoryStore"
import { makeImageData, resetStores } from "../helpers"

function setup() {
  return {
    user: userEvent.setup(),
    ...render(<Menu />),
  }
}

function AppLoadWatcher() {
  useEffect(() => {
    if (ConfigStore.pinned && AppStore.loaded === LoadState.FETCH_NEW) {
      setLoaded(LoadState.LOADING)
    }
  })

  return null
}

describe("Menu", () => {
  it("renders cards from HistoryStore", () => {
    resetStores()
    HistoryStore.history = [makeImageData({ url: "https://example.com/1.jpg" }), makeImageData({ url: "https://example.com/2.jpg" })]

    setup()

    const cards = document.querySelectorAll(".history-panel .card")
    expect(cards).toHaveLength(2)
    expect(cards[0]).toHaveClass("card")
    expect(cards[1]).toHaveClass("card")
    expect((cards[0].querySelector("img") as HTMLImageElement).src).toContain("https://example.com/2.jpg")
  })

  it("visible class follows ConfigStore.isMenuVisible", async () => {
    resetStores()
    setup()

    expect(document.querySelector(".menu")).not.toHaveClass("visible")

    ConfigStore.isMenuVisible = true

    await waitFor(() => {
      expect(document.querySelector(".menu")).toHaveClass("visible")
    })
  })

  it("clicking an unpinned card pins it and loads the selection", async () => {
    resetStores()
    HistoryStore.history = [makeImageData({ url: "https://example.com/1.jpg" }), makeImageData({ url: "https://example.com/2.jpg" })]
    const { user } = setup()

    AppStore.loaded = LoadState.LOADED

    await user.click(document.querySelectorAll(".history-panel .card")[1] as HTMLElement)

    expect(ConfigStore.pinned).toBe(true)
    expect(HistoryStore.i).toBe(0)
    expect(AppStore.loaded).toBe(LoadState.LOADING)

    render(<AppLoadWatcher />)

    await waitFor(() => {
      expect(AppStore.loaded).toBe(LoadState.LOADING)
    })
  })

  it("pinned current card has pinned class and does not change selection on click", async () => {
    resetStores()
    HistoryStore.history = [makeImageData({ url: "https://example.com/1.jpg" }), makeImageData({ url: "https://example.com/2.jpg" })]
    ConfigStore.pinned = true
    HistoryStore.i = 0

    const { user } = setup()

    expect(document.querySelectorAll(".history-panel .card")[1]).toHaveClass("pinned")

    await user.click(document.querySelectorAll(".history-panel .card")[1] as HTMLElement)

    expect(ConfigStore.pinned).toBe(false)
    expect(HistoryStore.i).toBe(0)
  })

  it("marks card images loaded and uses fallback title, image url, and status labels", () => {
    resetStores()
    HistoryStore.history = [
      makeImageData({
        title: "",
        res: undefined,
        thumbnailUrl: "https://example.com/thumb.jpg",
        url: "https://example.com/full.jpg",
      }),
      makeImageData({ title: "Newest Wallpaper", url: "https://example.com/new.jpg" }),
    ]

    setup()

    expect(screen.getByText("Untitled Wallpaper")).toBeInTheDocument()
    expect(screen.getByText("NEW")).toBeInTheDocument()

    const fallbackCardImage = document.querySelectorAll(".history-panel .card img")[1] as HTMLImageElement
    expect(fallbackCardImage.src).toContain("https://example.com/thumb.jpg")

    fireEvent.load(fallbackCardImage)
    expect(fallbackCardImage).toHaveClass("loaded")
  })

  it("favorite filtering, favorite toggling, removal, and clear all update history", async () => {
    resetStores()
    HistoryStore.history = [
      makeImageData({ title: "First", favorite: true }),
      makeImageData({ title: "Second", favorite: false }),
      makeImageData({ title: "Third", favorite: false }),
    ]
    ConfigStore.pinned = true
    HistoryStore.i = 1
    const { user } = setup()

    const historyActions = screen.getByRole("navigation", { name: /history actions/i })
    await user.click(within(historyActions).getByRole("button", { name: /favorites/i }))

    expect(screen.getByText("First")).toBeInTheDocument()
    expect(screen.queryByText("Second")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /remove first from favorites/i }))
    expect(HistoryStore.history[0].favorite).toBe(false)

    await user.click(within(historyActions).getByRole("button", { name: /favorites/i }))
    await user.click(screen.getByRole("button", { name: /remove second from history/i }))

    expect(ConfigStore.pinned).toBe(false)
    expect(HistoryStore.history.map(({ title }) => title)).toEqual(["First", "Third"])

    await user.click(screen.getByRole("button", { name: /^clear$/i }))
    expect(HistoryStore.history).toEqual([])
  })

  it("settings color presets and custom color update the theme store", async () => {
    resetStores()
    const { user } = setup()

    await user.click(screen.getByRole("button", { name: /settings/i }))
    await user.click(screen.getByRole("button", { name: /set primary color to #ff6b6b/i }))

    expect(ConfigStore.theme.primary).toBe("#ff6b6b")
    expect(screen.getByRole("button", { name: /set primary color to #ff6b6b/i })).toHaveClass("active")

    const customColor = screen
      .getByLabelText(/choose custom primary color/i)
      .querySelector("input") as HTMLInputElement
    fireEvent.change(customColor, { target: { value: "#123456" } })

    expect(ConfigStore.theme.primary).toBe("#123456")
    await waitFor(() => {
      expect(screen.getByLabelText(/choose custom primary color/i)).toHaveClass("active")
    })
  })

  it("settings dim slider and effect toggles update config", async () => {
    resetStores()
    const { user } = setup()

    await user.click(screen.getByRole("button", { name: /settings/i }))

    const dimSlider = document.querySelector(".dim-opacity-slider") as HTMLInputElement
    fireEvent.change(dimSlider, { target: { value: "0.5" } })

    expect(ConfigStore.theme.backgroundDim).toBe(0.5)
    await waitFor(() => {
      expect(document.querySelector(".range-picker-row strong")?.textContent).toBe("50%")
    })

    await user.click(screen.getByRole("button", { name: /reroll jingle/i }))
    expect(ConfigStore.settings.soundEffects).toBe(false)

    await user.click(screen.getByRole("button", { name: /large flash/i }))
    expect(ConfigStore.settings.rerollFlash).toBe(false)
  })
})
