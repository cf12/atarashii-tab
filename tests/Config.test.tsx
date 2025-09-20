import "@testing-library/jest-dom"
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, test } from "vitest"
import Config from "../src/components/Config"
import { AppStore, LoadState } from "../src/stores/AppStore"
import {
  CONFIG_STATE_PICKABLE_FIELDS_MAP,
  CONFIG_STATE_TOGGLEABLE_FIELDS,
  ConfigStore,
  type ConfigStateToggleableFields,
} from "../src/stores/ConfigStore"

function setup() {
  return {
    user: userEvent.setup(),
    ...render(<Config />),
  }
}

describe("Pickeable Fields", async () => {
  it("should default to sort=top, t=all", () => {
    setup()

    // check if defaults from ConfigStore have buttons w/ .selected class
    CONFIG_STATE_PICKABLE_FIELDS_MAP.sort.forEach((sort) => {
      if (sort === ConfigStore.sort) {
        expect(screen.getByText(sort)).toHaveClass("selected")
      } else {
        expect(screen.getByText(sort)).not.toHaveClass("selected")
      }
    })

    CONFIG_STATE_PICKABLE_FIELDS_MAP.t.forEach((t) => {
      if (t === ConfigStore.t) {
        expect(screen.getByText(t)).toHaveClass("selected")
      } else {
        expect(screen.getByText(t)).not.toHaveClass("selected")
      }
    })
  })

  it("should change to sort=relevance, t=hour if picked", async () => {
    const { user } = setup()

    const pickedSortEl = screen.getByText(/relevance/)
    const pickedTEl = screen.getByText(/hour/)

    await user.click(pickedSortEl)
    await user.click(pickedTEl)

    expect(pickedSortEl).toHaveClass("selected")
    CONFIG_STATE_PICKABLE_FIELDS_MAP.sort.forEach((otherSort) => {
      const otherSortEl = screen.getByText(otherSort)
      if (otherSortEl === pickedSortEl) return

      expect(otherSortEl).not.toHaveClass("selected")
    })

    expect(pickedTEl).toHaveClass("selected")
    CONFIG_STATE_PICKABLE_FIELDS_MAP.t.forEach((otherT) => {
      const otherTEl = screen.getByText(otherT)
      if (otherTEl === pickedTEl) return

      expect(otherTEl).not.toHaveClass("selected")
    })
  })

  it("should hide time fields if sort=new is picked", async () => {
    const { user } = setup()

    const newButton = screen.getByText(/new/)
    await user.click(newButton)

    CONFIG_STATE_PICKABLE_FIELDS_MAP.t.forEach((t) => {
      expect(screen.queryByText(t)).not.toBeInTheDocument()
    })
  })
})

describe("All buttons", async () => {
  const fieldsToDisplayNames: Record<
    keyof ConfigStateToggleableFields,
    RegExp
  > = {
    nsfw: /nsfw/i,
    incognito: /incognito/i,
    hideGui: /hide gui/i,
    pinned: /pin/i,
  }

  it("should be enabled by default", () => {
    setup()

    screen.getAllByRole("button").forEach((button) => {
      expect(button).not.toHaveAttribute("disabled")
    })
  })

  it("should toggle all toggleable config values", async () => {
    const { user } = setup()

    for (const key of CONFIG_STATE_TOGGLEABLE_FIELDS) {
      const value = ConfigStore[key]
      const button = screen.getByRole("button", {
        name: fieldsToDisplayNames[key],
      })

      await user.click(button)
      expect(ConfigStore[key]).toBe(!value)

      await user.click(button)
      expect(ConfigStore[key]).toBe(value)
    }
  })

  it("should visually disable buttons when toggled off", async () => {
    const { user } = setup()

    for (const key of CONFIG_STATE_TOGGLEABLE_FIELDS) {
      // Hide gui does not need to toggle
      if (key == "hideGui") continue

      const button = screen.getByRole("button", {
        name: fieldsToDisplayNames[key],
      })

      await user.click(button)
      expect(button).toHaveClass("active")

      await user.click(button)
      expect(button).not.toHaveClass("active")
    }
  })
})

describe("Nsfw Button", async () => {
  it("should set AppStore.loaded to FETCH_NEW when clicked", async () => {
    // Given
    const { user } = setup()
    const button = screen.getByRole("button", { name: /nsfw/i })
    AppStore.loaded = LoadState.LOADED

    // When
    await user.click(button)

    // Then
    expect(AppStore.loaded).toBe(LoadState.FETCH_NEW)
  })

  it("should unpin if pinned already", async () => {
    const { user } = setup()
    const nsfwButton = screen.getByRole("button", { name: /nsfw/ })
    const pinnedButton = screen.getByRole("button", { name: /pin/ })

    await user.click(pinnedButton) // set pinned = true
    expect(pinnedButton).toHaveClass("active")
    await user.click(nsfwButton)
    expect(pinnedButton).not.toHaveClass("active")
  })
})

describe("Pin button", async () => {
  it("should disable reroll when pinned", async () => {
    const { user } = setup()

    const pinButton = screen.getByRole("button", { name: /pin/i })
    const rerollButton = screen.getByRole("button", { name: /reroll/i })

    // Pin
    await user.click(pinButton)
    expect(ConfigStore.pinned).toBe(true)
    expect(pinButton).toHaveClass("active")
    expect(rerollButton).toHaveAttribute("disabled")

    // Unpin
    await user.click(pinButton)
    expect(ConfigStore.pinned).toBe(false)
    expect(pinButton).not.toHaveClass("active")
    expect(rerollButton).not.toHaveAttribute("disabled")
  })
})

describe("Incognito button", async () => {
  it("should toggle nsfw, pin, and reroll buttons when clicked", async () => {
    // Given
    const { user } = setup()
    const incognitoButton = screen.getByRole("button", { name: /incognito/i })
    const nsfwButton = screen.getByRole("button", { name: /nsfw/i })
    const pinButton = screen.getByRole("button", { name: /pin/i })
    const rerollButton = screen.getByRole("button", { name: /reroll/i })

    await user.click(incognitoButton)

    expect(incognitoButton).toHaveClass("active")
    expect(nsfwButton).toHaveAttribute("disabled")
    expect(pinButton).toHaveAttribute("disabled")
    expect(rerollButton).toHaveAttribute("disabled")

    await user.click(incognitoButton) // Disable incognito

    expect(incognitoButton).not.toHaveClass("active")
    expect(nsfwButton).not.toHaveAttribute("disabled")
    expect(pinButton).not.toHaveAttribute("disabled")
    expect(rerollButton).not.toHaveAttribute("disabled")
  })
})

describe("Reroll button", async () => {
  it("should set AppStore.loaded to FETCH_NEW when clicked", async () => {
    // Given
    const { user } = setup()
    const rerollButton = screen.getByRole("button", { name: /reroll/i })
    AppStore.loaded = LoadState.LOADED

    // When
    await user.click(rerollButton)

    // Then
    expect(AppStore.loaded).toBe(LoadState.FETCH_NEW)
  })
})
