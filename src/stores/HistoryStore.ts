import { decode } from "html-entities"
import { persist } from "valtio-persist"
import type { ImageData } from "../types/ImageData"

type RedditPreviewImage = {
  url: string
  width: number
  height: number
}

export type RedditPost = {
  id: string
  title: string
  url: string
  preview?: {
    images?: Array<{
      source?: RedditPreviewImage
      resolutions?: RedditPreviewImage[]
    }>
  }
}

export type HistoryStore = {
  history: ImageData[]
  i: number
}

export const { store: HistoryStore } = await persist<HistoryStore>(
  {
    history: [],
    i: -1,
  },
  "history",
)

const pickImageUrl = (
  post: RedditPost,
  targetWidth: number,
  targetHeight: number
) => {
  const image = post.preview?.images?.[0]
  const candidates = [...(image?.resolutions || []), image?.source]
    .filter((candidate): candidate is RedditPreviewImage => !!candidate)
    .sort((a, b) => a.width * a.height - b.width * b.height)

  const candidate =
    candidates.find(
      ({ width, height }) => width >= targetWidth && height >= targetHeight
    ) || candidates[candidates.length - 1]

  return candidate ? decode(candidate.url) : post.url
}

export const createImageData = (
  post: RedditPost,
  index: number,
  total: number
): ImageData => {
  const rawTitle = decode(post.title)
  const parts =
    rawTitle
      .match(/\[.*?\]|\(.*?\)|\{.*?\}/g)
      ?.filter((e) => !!e)
      .map((e) => e.slice(1, -1)) || []
  const title = rawTitle.replace(/\[.*?\]|\(.*?\)|\{.*?\}/g, "").trim()

  let resolution = parts.filter((e) => e.match(/[\d\s]+[x×*][\d\s]+/g))?.[0]

  if (resolution) {
    parts.splice(parts.indexOf(resolution), 1)
    resolution = resolution.split(/[x×*]/).join(" × ")
  }

  if (title) parts.unshift(title)

  return {
    title: parts.join(" • "),
    res: resolution || "",
    url: post.url,
    backgroundUrl: pickImageUrl(post, window.innerWidth, window.innerHeight),
    thumbnailUrl: pickImageUrl(post, 192, 108),
    link: `https://redd.it/${post.id}`,
    nums: [index, total],
  }
}

export const pushPostToHistory = (
  post: RedditPost,
  index: number,
  total: number
) => {
  HistoryStore.history.push(createImageData(post, index, total))
  HistoryStore.i = HistoryStore.history.length - 1
}

export const clearHistory = () => {
  const current = HistoryStore.i
  const favorites = HistoryStore.history.filter(({ favorite }) => favorite)

  if (current >= 0 && HistoryStore.history[current]?.favorite) {
    HistoryStore.i = HistoryStore.history
      .slice(0, current + 1)
      .filter(({ favorite }) => favorite).length - 1
  } else {
    HistoryStore.i = favorites.length - 1
  }

  HistoryStore.history = favorites
}

export const removeHistoryAt = (index: number) => {
  if (index < 0 || index >= HistoryStore.history.length) return

  HistoryStore.history.splice(index, 1)

  if (!HistoryStore.history.length) {
    HistoryStore.i = -1
    return
  }

  if (HistoryStore.i > index) {
    HistoryStore.i -= 1
    return
  }

  if (HistoryStore.i === index) {
    HistoryStore.i = Math.min(index, HistoryStore.history.length - 1)
  }
}

export const toggleFavoriteAt = (index: number) => {
  const data = HistoryStore.history[index]
  if (!data) return

  data.favorite = !data.favorite
}
