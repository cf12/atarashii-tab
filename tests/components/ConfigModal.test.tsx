import "@testing-library/jest-dom"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ConfigModal } from "../../src/components/ConfigModal"

describe("ConfigModal", () => {
  it("renders nothing when closed or missing config", () => {
    const props = {
      open: false,
      config: { t: "year" },
      setOpen: vi.fn(),
      setConfig: vi.fn(),
    }

    const { rerender } = render(<ConfigModal {...props} />)
    expect(screen.queryByRole("heading", { name: /settings/i })).not.toBeInTheDocument()

    rerender(<ConfigModal {...props} open config={null} />)
    expect(screen.queryByRole("heading", { name: /settings/i })).not.toBeInTheDocument()
  })

  it("closes when the backdrop is clicked", async () => {
    const user = userEvent.setup()
    const setOpen = vi.fn()

    render(
      <ConfigModal
        open
        config={{ t: "year", sort: "top" }}
        setOpen={setOpen}
        setConfig={vi.fn()}
      />
    )

    await user.click(document.querySelector(".modal-bg") as HTMLElement)

    expect(setOpen).toHaveBeenCalledWith(false)
  })

  it("updates config from the time-span select and prevents form submit navigation", () => {
    const config = { t: "year", sort: "top" }
    const setConfig = vi.fn()

    render(
      <ConfigModal
        open
        config={config}
        setOpen={vi.fn()}
        setConfig={setConfig}
      />
    )

    fireEvent.change(screen.getByRole("combobox", { name: /time span/i }), {
      target: { value: "all" },
    })
    fireEvent.submit(document.querySelector("form.modal-content") as HTMLFormElement)

    expect(setConfig).toHaveBeenCalledWith({ ...config, t: "all" })
  })
})