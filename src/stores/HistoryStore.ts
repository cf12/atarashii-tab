import { persist } from "valtio-persist"
import type { ImageData } from "../types/ImageData"

export type HistoryStore = {
  history: ImageData[]
  i: number
}

export const { store: HistoryStore } = await persist<HistoryStore>(
  {
    history: [],
    i: -1,
  },
  "history"
)
