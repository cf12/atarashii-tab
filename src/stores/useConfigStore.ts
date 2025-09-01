import { create } from "zustand"
import { persist } from "zustand/middleware"

type KeysOfValue<T, TCondition> = {
  [K in keyof T]: T[K] extends TCondition ? K : never
}[keyof T]

export type ConfigStore = {
  num?: number | null
  q: string
  sort: "relevance" | "hot" | "top" | "new"
  t: "hour" | "day" | "week" | "month" | "year" | "all"

  nsfw: boolean
  incognito: boolean
  hideGui: boolean
  pinned: boolean

  theme: {
    primary: string
  }
}

type ConfigStoreActions = {
  //   toggleNsfw: () => void
  //   toggleIncognito: () => void
  //   toggleHideGui: () => void
  //   togglePinned: (v?: boolean) => void
  set: (data: Partial<ConfigStore>) => void
  toggle: (key: KeysOfValue<ConfigStore, boolean>) => void
  // updateQueryParams: ()
}

export const useConfigStore = create<ConfigStore & ConfigStoreActions>()(
  persist(
    (set, get) => ({
      num: undefined,
      q: `flair:"Desktop"`,
      sort: "top",
      t: "year",

      nsfw: false,
      incognito: false,
      hideGui: false,
      pinned: false,

      //   toggleNsfw: () => set({ nsfw: !get().nsfw }),
      //   toggleIncognito: () => set({ incognito: !get().incognito }),
      //   toggleHideGui: () => set({ hideGui: !get().hideGui }),
      //   togglePinned: (v) => set({ pinned: v ?? !get().pinned }),

      set: (data) => set(data),
      toggle: (key) => set({ [key]: !get()[key] }),

      updateQueryParams: (key, value) => {
        const newState = {
          [key]: value,
          num: null,
        }

        // Sorting by new on Reddit needs to be all
        if (key === "sort" && value === "new") newState["t"] = "all"

        set(newState)
      },

      theme: {
        primary: "#ffc400",
      },
    }),
    {
      name: "config",
    }
  )
)
