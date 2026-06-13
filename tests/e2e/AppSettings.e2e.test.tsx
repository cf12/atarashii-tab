import "@testing-library/jest-dom"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import App from "../../src/App"
import { AppStore, LoadState } from "../../src/stores/AppStore"
import { ConfigStore } from "../../src/stores/ConfigStore"
import { fetchPosts } from "../../src/utils/fetchPosts"
import { makePost } from "../helpers"

vi.mock("../../src/components/TimeDate", () => ({
  TimeDate: () => <div>Mock time</div>,
  default: () => <div>Mock time</div>,
}))

vi.mock("../../src/components/Image", () => ({
  default: ({ src, onLoad }: { src?: string; onLoad?: () => void }) => (
    <img data-testid="background-image" src={src} alt="" onLoad={onLoad} />
  ),
}))

vi.mock("../../src/utils/fetchPosts", () => ({
  fetchPosts: vi.fn(),
}))

const fetchPostsMock = vi.mocked(fetchPosts)

async function renderLoadedApp() {
  const user = userEvent.setup()
  fetchPostsMock.mockResolvedValue([makePost()])

  render(<App />)

  await waitFor(() => {
    expect(fetchPostsMock).toHaveBeenCalledTimes(1)
  })

  fireEvent.load(screen.getByTestId("background-image"))

  await waitFor(() => {
    expect(AppStore.loaded).toBe(LoadState.LOADED)
  })

  return user
}

async function openSettings(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /show menu/i }))
  await user.click(screen.getByRole("button", { name: /settings/i }))
}

describe("App settings flows", () => {
  beforeEach(() => {
    fetchPostsMock.mockReset()
    vi.spyOn(Math, "random").mockReturnValue(0)
  })

  it("applies settings-panel accent color and background dim to the whole app", async () => {
    const user = await renderLoadedApp()

    await openSettings(user)
    await user.click(screen.getByRole("button", { name: /set primary color to #7c5cff/i }))
    fireEvent.change(document.querySelector(".dim-opacity-slider") as HTMLInputElement, {
      target: { value: "0.5" },
    })

    await waitFor(() => {
      expect(document.documentElement).toHaveStyle("--primary: #7c5cff")
      expect(document.documentElement).toHaveStyle("--background-dim: 0.5")
    })
    expect(screen.getByText("50%")).toBeInTheDocument()
    expect(ConfigStore.theme.primary).toBe("#7c5cff")
    expect(ConfigStore.theme.backgroundDim).toBe(0.5)
  })

  it("uses custom settings-panel colors as active accent colors", async () => {
    const user = await renderLoadedApp()

    await openSettings(user)
    const customColorInput = screen
      .getByLabelText(/choose custom primary color/i)
      .querySelector("input") as HTMLInputElement

    fireEvent.change(customColorInput, { target: { value: "#123456" } })

    await waitFor(() => {
      expect(document.documentElement).toHaveStyle("--primary: #123456")
    })
    expect(screen.getByLabelText(/choose custom primary color/i)).toHaveClass("active")
    expect(ConfigStore.theme.primary).toBe("#123456")
  })

  it("respects settings-panel reroll effect toggles when rerolling from the app", async () => {
    const AudioContextMock = vi.fn(() => ({
      currentTime: 0,
      destination: {},
      createGain: () => ({
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      }),
      createOscillator: () => ({
        type: "triangle",
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      }),
    }))
    vi.stubGlobal("AudioContext", AudioContextMock)
    fetchPostsMock.mockResolvedValueOnce([makePost()])
    fetchPostsMock.mockResolvedValueOnce([
      makePost({ id: "rerolled", title: "Rerolled [2560x1440]" }),
    ])

    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(fetchPostsMock).toHaveBeenCalledTimes(1)
    })
    fireEvent.load(screen.getByTestId("background-image"))
    await waitFor(() => {
      expect(AppStore.loaded).toBe(LoadState.LOADED)
    })

    await openSettings(user)
    await user.click(screen.getByRole("button", { name: /reroll jingle/i }))
    await user.click(screen.getByRole("button", { name: /large flash/i }))

    expect(ConfigStore.settings.soundEffects).toBe(false)
    expect(ConfigStore.settings.rerollFlash).toBe(false)

    await user.click(document.querySelector<HTMLButtonElement>(".button-reroll")!)

    expect(fetchPostsMock).toHaveBeenCalledTimes(1)
    expect(AudioContextMock).not.toHaveBeenCalled()
    expect(screen.queryByLabelText(/rolling wallpaper/i)).not.toBeInTheDocument()
  })
})
