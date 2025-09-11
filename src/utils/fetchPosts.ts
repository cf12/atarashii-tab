import type { ConfigState } from "../stores/ConfigStore"

export async function fetchPosts(config: ConfigState) {
  let posts: any[] = []
  let after = null

  while (posts.length < 200) {
    const query = new URLSearchParams({
      q: config.q.toString(),
      sort: config.sort.toString(),
      t: config.t.toString(),
      show: "all",
      restrict_sr: "1",
      include_over_18: config.nsfw ? "on" : "off",
      after,
    })

    const res = await fetch(
      `https://www.reddit.com/r/Animewallpaper/search.json?${query}`,
    )
    const json = await res.json()

    after = json.data.after
    if (!after) break

    posts = posts.concat(json.data.children)
  }

  // Collect posts w/ i.redd.it only
  posts = posts.map((e) => e.data)

  // Filter by NSFW if enabled
  if (config.nsfw) posts = posts.filter((e) => e.thumbnail === "nsfw")

  posts = posts.filter((e) => e.url.includes("i.redd.it"))
  return posts
}
