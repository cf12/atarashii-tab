export type ImageData = {
  title: string
  res: string
  url: string
  link: string
  nums: readonly [i: number, total: number]

  backgroundUrl?: string
  thumbnailUrl?: string

  favorite?: boolean
}
