import { proxy } from "valtio"

export const LoadState = {
  FETCH_NEW: 0,
  LOADING: 1,
  LOADED: 2,
} as const
export type LoadState = (typeof LoadState)[keyof typeof LoadState]

export type AppStore = {
  loaded: LoadState
}

export const AppStore = proxy<AppStore>({
  loaded: LoadState.FETCH_NEW,
})

export const setLoaded = (state: LoadState) => {
  AppStore.loaded = state
}
