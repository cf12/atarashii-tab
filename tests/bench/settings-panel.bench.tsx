import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { bench, describe } from "vitest"
import Menu from "../../src/components/Menu"
import { ConfigStore } from "../../src/stores/ConfigStore"
import { HistoryStore } from "../../src/stores/HistoryStore"
import { makeImageData, resetStores } from "../helpers"

const historyFixture = Array.from({ length: 100 }, (_, index) =>
  makeImageData({
    title: `Wallpaper ${index}`,
    res: `${1920 + index} × 1080`,
    url: `https://example.com/${index}.jpg`,
    thumbnailUrl: `https://example.com/thumb-${index}.jpg`,
    favorite: index % 4 === 0,
  }),
)

function seedSettingsPanel() {
  resetStores()
  ConfigStore.isMenuVisible = true
  HistoryStore.history = historyFixture.map((item) => ({ ...item }))
  HistoryStore.i = HistoryStore.history.length - 1
}

describe("settings panel performance drift", () => {
  bench("render settings panel", () => {
    seedSettingsPanel()
    render(<Menu />)
    fireEvent.click(screen.getByRole("button", { name: /settings/i }))
    cleanup()
  })

  bench("apply theme settings", () => {
    seedSettingsPanel()
    render(<Menu />)
    fireEvent.click(screen.getByRole("button", { name: /settings/i }))
    fireEvent.click(screen.getByRole("button", { name: /set primary color to #7c5cff/i }))
    fireEvent.change(document.querySelector(".dim-opacity-slider") as HTMLInputElement, {
      target: { value: "0.5" },
    })
    cleanup()
  })

  bench("toggle reroll settings", () => {
    seedSettingsPanel()
    render(<Menu />)
    fireEvent.click(screen.getByRole("button", { name: /settings/i }))
    fireEvent.click(screen.getByRole("button", { name: /reroll jingle/i }))
    fireEvent.click(screen.getByRole("button", { name: /large flash/i }))
    cleanup()
  })
})
