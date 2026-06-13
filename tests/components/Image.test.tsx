import "@testing-library/jest-dom"
import { fireEvent, render, screen } from "@testing-library/react"
import NProgress from "nprogress"
import { describe, expect, it, vi } from "vitest"
import Image from "../../src/components/Image"

vi.mock("nprogress", () => ({
  default: {
    start: vi.fn(),
    done: vi.fn(),
  },
}))

describe("Image", () => {
  it("starts progress for a new src and completes after nested animation frames on load", async () => {
    const onLoad = vi.fn()
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0)
      return 0
    })

    render(<Image src="https://example.com/wallpaper.jpg" alt="Wallpaper" onLoad={onLoad} />)

    const image = screen.getByRole("img", { name: /wallpaper/i })
    expect(image).toHaveAttribute("src", "https://example.com/wallpaper.jpg")
    expect(NProgress.start).toHaveBeenCalledTimes(1)

    fireEvent.load(image)

    expect(NProgress.done).toHaveBeenCalled()
    expect(onLoad).toHaveBeenCalledTimes(1)
  })

  it("does not restart progress for the same src, starts for a changed src, and completes on error", () => {
    const onError = vi.fn()
    const { rerender } = render(
      <Image src="https://example.com/one.jpg" alt="Wallpaper" onError={onError} />
    )

    expect(NProgress.start).toHaveBeenCalledTimes(1)

    rerender(<Image src="https://example.com/one.jpg" alt="Wallpaper" onError={onError} />)
    expect(NProgress.start).toHaveBeenCalledTimes(1)

    rerender(<Image src="https://example.com/two.jpg" alt="Wallpaper" onError={onError} />)
    expect(NProgress.start).toHaveBeenCalledTimes(2)

    fireEvent.error(screen.getByRole("img", { name: /wallpaper/i }))

    expect(NProgress.done).toHaveBeenCalled()
    expect(onError).toHaveBeenCalledTimes(1)
  })

  it("skips progress when no src is provided", () => {
    render(<Image alt="Empty wallpaper" />)

    expect(NProgress.start).not.toHaveBeenCalled()
    expect(screen.getByRole("img", { name: /empty wallpaper/i })).not.toHaveAttribute("src")
  })
})