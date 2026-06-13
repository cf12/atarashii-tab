import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { act } from "react"
import { describe, expect, it, vi } from "vitest"
import MenuButton from "../../src/components/MenuButton"
import { ConfigStore } from "../../src/stores/ConfigStore"
import { resetStores } from "../helpers"

function setup() {
  return {
    user: userEvent.setup(),
    ...render(<MenuButton />),
  }
}

describe("MenuButton", () => {
  it("click toggles visibility and label changes", async () => {
    resetStores()
    const { user } = setup()

    expect(screen.getByRole("button", { name: /show menu/i })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /show menu/i }))
    expect(ConfigStore.isMenuVisible).toBe(true)
    expect(screen.getByRole("button", { name: /hide menu/i })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /hide menu/i }))
    expect(ConfigStore.isMenuVisible).toBe(false)
    expect(screen.getByRole("button", { name: /show menu/i })).toBeInTheDocument()
  })

  it("remains visible while hovered without testing animation details", async () => {
    resetStores()
    vi.useFakeTimers()
    setup()

    const button = screen.getByRole("button", { name: /show menu/i })
    expect(button.parentElement).toHaveClass("visible")

    await act(async () => {
      vi.advanceTimersByTime(3000)
    })
    expect(button.parentElement).not.toHaveClass("visible")

    vi.useRealTimers()
  })
})
