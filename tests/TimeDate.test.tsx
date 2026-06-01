import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import TimeDate from "../src/components/TimeDate"

function setup() {
  return {
    user: userEvent.setup(),
    ...render(<TimeDate />),
  }
}

describe("TimeDate", () => {
  it("should render current time", () => {
    setup()

    // format: 3:49 PM
    const time = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

    expect(screen.getByText(time)).toBeVisible()
  })

  it("should render current date", () => {
    setup()

    // format: Wednesday, Sep 10
    const date = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    })
    expect(screen.getByText(date)).toBeVisible()
  })
})
