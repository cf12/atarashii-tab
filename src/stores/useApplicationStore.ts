import { create } from "zustand"
import { persist } from "zustand/middleware"

type BearStore = {
  bears: number
  addABear: () => void
}

export const useApplicationStore = create<BearStore>()(
  persist(
    (set, get) => ({
      bears: 0,
      addABear: () => set({ bears: get().bears + 1 }),
    }),
    {
      name: "food-storage",
    }
  )
)
