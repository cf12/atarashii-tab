import { describe, it, expect } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import App from "../src/App"

import userEvent from "@testing-library/user-event"

describe("App", () => {
  it("should be loading initially", () => {
    render(<App />)
    // we want to know if a <PuffLoader> is in the document
  })
})

// describe("Keyboard shortcuts", async () => {
//   const user = userEvent.setup()
//
//   it("should toggle nsfw when pressing ", async () => {
//     const component = render(<App />)
//
//     await user.keyboard("h")
//     expect(screen.getByText(/show gui/)).toBeVisible()
//
//     await waitFor(() => {
//       expect(component.container).to("hidden")
//       // expect(component).toHaveClass("hidden")
//     })
//
//     // await waitFor(() => {
//     //   expect(screen.queryByRole("button", { name: /pin/i })).not.toBeVisible()
//     // })
//   })
//
//   it("should toggle hideGui when pressing H", async () => {
//     const component = render(<App />)
//
//     await user.keyboard("h")
//     expect(screen.getByText(/show gui/)).toBeVisible()
//
//     await waitFor(() => {
//       expect(component.container).to("hidden")
//       // expect(component).toHaveClass("hidden")
//     })
//
//     // await waitFor(() => {
//     //   expect(screen.queryByRole("button", { name: /pin/i })).not.toBeVisible()
//     // })
//   })
//   //
//   // it("should toggle incognito when pressing I", async () => {
//   //   render(<App />)
//   //
//   //   await user.keyboard("i")
//   //   expect(screen.getByText(/incognito/)).toHaveClass("active")
//   // })
//   //
//   // it("should reroll when pressing R", async () => {
//   //   render(<App />)
//   //
//   //   const bg = screen.
//   //
//   //   await user.keyboard("r")
//   //   expect(screen.getByRole("status")).toBeVisible()
//   // })
// })
