import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { TimeDate } from "../src/components/TimeDate"

const now = new Date("2024-09-10T15:49:00")

function setup() {
  vi.useFakeTimers()
  vi.setSystemTime(now)
  return render(<TimeDate />)
}

describe("TimeDate", () => {
  it("should render current time", () => {
    setup()

    // format: 3:49 PM
    const time = now.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

    expect(screen.getByText(time)).toBeVisible()
  })

  it("should render current date", () => {
    setup()

    // format: Wednesday, Sep 10
    const date = now.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    })
    expect(screen.getByText(date)).toBeVisible()
  })
})
