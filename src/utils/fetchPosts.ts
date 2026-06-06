import type { ConfigState } from "../stores/ConfigStore"
import type { RedditPost } from "../stores/HistoryStore"

type RedditSearchResponse = {
  data: {
    after: string | null
    children: Array<{ data: RedditPost & { thumbnail?: string } }>
  }
}

export async function fetchPosts(config: ConfigState) {
  let posts: Array<RedditPost & { thumbnail?: string }> = []
  let after: string | null = null

  while (posts.length < 200) {
    const query = new URLSearchParams({
      q: config.q.toString(),
      sort: config.sort.toString(),
      t: config.t.toString(),
      show: "all",
      restrict_sr: "1",
      include_over_18: config.nsfw ? "on" : "off",
    })
    if (after) query.set("after", after)

    const res = await fetch(
      `https://www.reddit.com/r/Animewallpaper/search.json?${query}`,
    )
    const json = (await res.json()) as RedditSearchResponse

    after = json.data.after
    if (!after) break

    posts = posts.concat(json.data.children.map((child) => child.data))
  }

  // Filter by NSFW if enabled
  if (config.nsfw) posts = posts.filter((e) => e.thumbnail === "nsfw")

  posts = posts.filter((e) => e.url.includes("i.redd.it"))
  return posts
}
