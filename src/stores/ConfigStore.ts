import { persist } from "valtio-persist"

export const PRIMARY_COLOR_PRESETS = [
  "#ffc400",
  "#ff6b6b",
  "#7c5cff",
  "#00d2ff",
  "#2ee59d",
] as const

export const CONFIG_STATE_PICKABLE_FIELDS_MAP = {
  sort: ["relevance", "hot", "top", "new"],
  t: ["hour", "day", "week", "month", "year", "all"],
}

export const CONFIG_STATE_TOGGLEABLE_FIELDS = [
  "nsfw",
  "incognito",
  "hideGui",
  "pinned",
] as const

export type ConfigState = {
  num?: number
  q: string
  sort: (typeof CONFIG_STATE_PICKABLE_FIELDS_MAP.sort)[number]
  t: (typeof CONFIG_STATE_PICKABLE_FIELDS_MAP.t)[number]

  nsfw: boolean
  incognito: boolean
  hideGui: boolean
  pinned: boolean

  isMenuVisible: boolean

  theme: {
    primary: string
    backgroundDim: number
  }

  settings: {
    soundEffects: boolean
    rerollFlash: boolean
  }
}

export type ConfigStatePickableFields = {
  [K in keyof typeof CONFIG_STATE_PICKABLE_FIELDS_MAP]: ConfigState[K]
}

export type ConfigStateToggleableFields = {
  [K in (typeof CONFIG_STATE_TOGGLEABLE_FIELDS)[number]]: ConfigState[K]
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

    isMenuVisible: false,

    //   toggleNsfw: () => set({ nsfw: !get().nsfw }),
    //   toggleIncognito: () => set({ incognito: !get().incognito }),
    //   toggleHideGui: () => set({ hideGui: !get().hideGui }),
    //   togglePinned: (v) => set({ pinned: v ?? !get().pinned }),

    // set: (data) => set(data),
    // toggle: (key) => set({ [key]: !get()[key] }),

    theme: {
      primary: PRIMARY_COLOR_PRESETS[0],
      backgroundDim: 0.35,
    },

    settings: {
      soundEffects: true,
      rerollFlash: true,
    },
  },
  "config"
)

export const toggle = (key: keyof ConfigStateToggleableFields) => {
  ConfigStore[key] = !ConfigStore[key]
}

// export const togglePin = () => {
//   ConfigStore.num = ConfigStore.num ? undefined : ConfigStore.num
//   ConfigStore.pinned = !ConfigStore.pinned
// }

export const toggleNsfw = () => {
  ConfigStore.nsfw = !ConfigStore.nsfw
}

export const pickValue = <K extends keyof ConfigStatePickableFields>(
  key: K,
  value: ConfigState[K]
) => {
  // Sorting by new on Reddit needs to be all
  if (key === "sort" && value === "new") ConfigStore.t = "all"
  ConfigStore[key] = value
}

export const toggleMenu = () => {
  ConfigStore.isMenuVisible = !ConfigStore.isMenuVisible
}
