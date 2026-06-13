import "@testing-library/jest-dom"
import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import MenuButton from "../../src/components/MenuButton"
import { ConfigStore } from "../../src/stores/ConfigStore"

describe("MenuButton visibility timing", () => {
  it("hides after its initial timeout and can be shown by hovering", async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    render(<MenuButton />)

    const wrapper = document.querySelector(".menu-button") as HTMLElement
    const button = screen.getByRole("button", { name: /show menu/i })

    expect(wrapper).toHaveClass("visible")

    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(wrapper).not.toHaveClass("visible")

    fireEvent.mouseEnter(button)
    expect(wrapper).toHaveClass("visible")
  })

  it("does not schedule hover-hide while the menu is already visible", async () => {
    vi.useFakeTimers()
    ConfigStore.isMenuVisible = true

    render(<MenuButton />)

    const wrapper = document.querySelector(".menu-button") as HTMLElement
    const button = screen.getByRole("button", { name: /hide menu/i })

    fireEvent.mouseLeave(button)
    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(wrapper).toHaveClass("visible")
  })
})