import { persist, LocalStorageStrategy } from "valtio-persist"

export const CONFIG_STATE_PICKABLE_FIELDS_MAP = {
  sort: ["relevance", "hot", "top", "new"],
  t: ["hour", "day", "week", "month", "year", "all"],
}

export type ConfigState = {
  num?: number | null
  q: string
  sort: (typeof CONFIG_STATE_PICKABLE_FIELDS_MAP.sort)[number]
  t: (typeof CONFIG_STATE_PICKABLE_FIELDS_MAP.t)[number]

  nsfw: boolean
  incognito: boolean
  hideGui: boolean
  pinned: boolean

  theme: {
    primary: string
  }
}

export type ConfigStatePickableFields = {
  sort: ConfigState["sort"]
  t: ConfigState["t"]
}

export type ConfigStateToggleableFields = {
  nsfw: ConfigState["nsfw"]
  incognito: ConfigState["incognito"]
  hideGui: ConfigState["hideGui"]
  pinned: ConfigState["pinned"]
}

export const { store: ConfigStore } = await persist<ConfigState>(
  {
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

    // set: (data) => set(data),
    // toggle: (key) => set({ [key]: !get()[key] }),

    theme: {
      primary: "#ffc400",
    },
  },
  "config",
  { storageStrategy: LocalStorageStrategy }
)

export const toggle = (key: keyof ConfigStateToggleableFields) => {
  ConfigStore[key] = !ConfigStore[key]
}

export const togglePin = () => {
  ConfigStore.num = ConfigStore.num !== null ? null : ConfigStore.num
  ConfigStore.pinned = !ConfigStore.pinned
}

export const toggleNsfw = () => {
  ConfigStore.num = null
  ConfigStore.nsfw = !ConfigStore.nsfw
}

export const pickValue = <K extends keyof ConfigStatePickableFields>(
  key: K,
  value: ConfigState[K]
) => {
  // Sorting by new on Reddit needs to be all
  if (key === "sort" && value === "new") ConfigStore.t = "all"
  ConfigStore[key] = value
  ConfigStore.num = null
}
