import { proxy } from "valtio"
import { persist } from "valtio-persist"

type PostData = {
  
}

type ConfigStore = {
  num?: number
  q: string
  sort: string
  t: string

  nsfw: boolean
  incognito: boolean
  hideGui: boolean

  theme: {
    primary: string
  }
}

type HistoryStore = any[]
type CacheStore = {
  lastUpdated: number,
  data: 
}

export const configStore = persist<ConfigStore>(
  {
    num: undefined,
    q: `flair:"Desktop"`,
    sort: "top",
    t: "year",

    nsfw: false,
    incognito: false,
    hideGui: false,

    theme: {
      primary: "#ffc400",
    },
  },
  "config",
)

export const historyStore = persist<HistoryStore>([], "history")

export const cacheStore = persist<CacheStore>(
  {
    lastUpdated: -1,
    data: [],
  },
  "cache",
)
