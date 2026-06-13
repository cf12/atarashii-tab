import { persist } from "valtio-persist"
import type { RedditPost } from "./HistoryStore"

export type CacheStore = {
  lastUpdated: number
  data: RedditPost[]
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
