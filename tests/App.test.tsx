import "@testing-library/jest-dom"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import App from "../src/App"
import { AppStore, LoadState } from "../src/stores/AppStore"
import { CacheStore } from "../src/stores/CacheStore"
import { ConfigStore } from "../src/stores/ConfigStore"
import { HistoryStore } from "../src/stores/HistoryStore"
import { fetchPosts } from "../src/utils/fetchPosts"
import { makeImageData, makePost } from "./helpers"

vi.mock("../src/components/TimeDate", () => ({
  TimeDate: () => <div>Mock time</div>,
  default: () => <div>Mock time</div>,
}))

vi.mock("../src/components/Image", () => ({
  default: ({ src, onLoad }: { src?: string; onLoad?: () => void }) => (
    <img data-testid="background-image" src={src} alt="" onLoad={onLoad} />
  ),
}))

vi.mock("../src/utils/fetchPosts", () => ({
  fetchPosts: vi.fn(),
}))

const fetchPostsMock = vi.mocked(fetchPosts)

describe("App", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0)
    fetchPostsMock.mockReset()
    fetchPostsMock.mockResolvedValue([makePost()])
  })

  it("fetches posts, renders selected image details, and marks load complete", async () => {
    const { container } = render(<App />)

    await waitFor(() => {
      expect(fetchPostsMock).toHaveBeenCalledWith(
        expect.objectContaining({ q: 'flair:"Desktop"', sort: "top" }),
      )
    })

    expect(screen.getByText("Wallpaper • Artist", { selector: "p.to-load" })).toBeInTheDocument()
    expect(screen.getByText("1920 × 1080", { selector: "p.to-load" })).toBeInTheDocument()
    expect(screen.getByText("https://redd.it/abc123")).toBeInTheDocument()
    expect(screen.getByText("#1")).toBeInTheDocument()
    expect(screen.getByText("1")).toBeInTheDocument()
    expect(screen.getByTestId("background-image")).toHaveAttribute(
      "src",
      "https://i.redd.it/wallpaper.jpg",
    )
    expect(HistoryStore.history).toHaveLength(1)
    expect(AppStore.loaded).toBe(LoadState.LOADING)

    fireEvent.load(screen.getByTestId("background-image"))

    await waitFor(() => {
      expect(AppStore.loaded).toBe(LoadState.LOADED)
      expect(container.querySelector(".app-frame")).toHaveClass("load")
    })
  })

  it("uses fresh cached posts instead of fetching", async () => {
    CacheStore.lastUpdated = Date.now()
    CacheStore.data = [makePost({ id: "cached", title: "Cached [800x600]" })]

    render(<App />)

    await waitFor(() => {
      expect(AppStore.loaded).toBe(LoadState.LOADING)
    })

    expect(document.querySelector(".details")?.textContent).toContain("Cached")
    expect(document.querySelector(".details")?.textContent).toContain("800 × 600")
    expect(screen.getByText("https://redd.it/cached")).toBeInTheDocument()
    expect(fetchPostsMock).not.toHaveBeenCalled()
  })

  it("does not fetch while incognito", async () => {
    ConfigStore.incognito = true

    render(<App />)

    await waitFor(() => {
      expect(fetchPostsMock).not.toHaveBeenCalled()
    })
    expect(screen.getByTestId("background-image")).not.toHaveAttribute("src")
  })

  it("shows an empty-state message when no posts are found", async () => {
    fetchPostsMock.mockResolvedValue([])

    render(<App />)

    expect(await screen.findByText(/no images found/i)).toBeInTheDocument()
    expect(screen.getByText(/try different filters/i)).toBeInTheDocument()
    expect(screen.queryByTestId("background-image")).not.toBeInTheDocument()
    expect(AppStore.loaded).toBe(LoadState.LOADED)
  })

  it("switches pinned rerolls to loading without fetching", async () => {
    ConfigStore.pinned = true
    HistoryStore.history = [makeImageData({ url: "https://i.redd.it/pinned.jpg" })]
    HistoryStore.i = 0

    render(<App />)

    await waitFor(() => {
      expect(AppStore.loaded).toBe(LoadState.LOADING)
    })
    expect(fetchPostsMock).not.toHaveBeenCalled()
  })

  it("shows the roll overlay when rerolling", () => {
    AppStore.loaded = LoadState.LOADED
    AppStore.showRollOverlay = true

    render(<App />)

    expect(screen.getByLabelText("Rolling wallpaper")).toBeInTheDocument()
  })

  it("falls back to the latest history item when the index is out of range", () => {
    AppStore.loaded = LoadState.LOADED
    ConfigStore.hideGui = true
    HistoryStore.history = [
      makeImageData({ title: "First", link: "https://redd.it/one" }),
      makeImageData({ title: "Latest", link: "https://redd.it/two" }),
    ]
    HistoryStore.i = 99

    const { container } = render(<App />)

    expect(screen.getByText("Latest", { selector: "p.to-load" })).toBeInTheDocument()
    expect(screen.getByText("https://redd.it/two")).toBeInTheDocument()
    expect(container.querySelector(".app-frame")).toHaveClass("hidden")
  })
})
