import { persist } from "valtio-persist"

export type CacheStore = {
  lastUpdated: number
  data: any[]
}

export const { store: CacheStore } = await persist<CacheStore>(
  {
    lastUpdated: -1,
    data: [],
  },
  "cache"
)

export const clearCache = () => {
  CacheStore.data = []
  CacheStore.lastUpdated = -1
}
