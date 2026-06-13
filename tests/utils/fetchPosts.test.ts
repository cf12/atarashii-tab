import { describe, expect, it, vi } from "vitest"
import { fetchPosts } from "../../src/utils/fetchPosts"
import { makeListing } from "../helpers"

describe("fetchPosts", () => {
  it("builds the query, paginates, and filters image posts", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ json: async () => makeListing([
        { url: "https://i.redd.it/1.jpg", thumbnail: "default" },
        { url: "https://example.com/skip.jpg", thumbnail: "default" },
      ], "after-1") })
      .mockResolvedValueOnce({ json: async () => makeListing([
        { url: "https://i.redd.it/2.jpg", thumbnail: "default" },
      ], null) })

    vi.stubGlobal("fetch", fetchMock)

    const posts = await fetchPosts({
      q: 'flair:"Desktop"',
      sort: "top",
      t: "year",
      nsfw: false,
    } as never)

    expect(fetchMock).toHaveBeenCalledTimes(2)

    const firstUrl = fetchMock.mock.calls[0]?.[0] as string
    const secondUrl = fetchMock.mock.calls[1]?.[0] as string
    expect(firstUrl).toContain("include_over_18=off")
    expect(firstUrl).not.toContain("after=")
    expect(firstUrl).toContain("restrict_sr=1")
    expect(secondUrl).toContain("after=after-1")

    expect(posts).toEqual([
      { url: "https://i.redd.it/1.jpg", thumbnail: "default" },
      { url: "https://i.redd.it/2.jpg", thumbnail: "default" },
    ])
  })

  it("filters to nsfw i.redd.it posts when nsfw is enabled", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      json: async () => makeListing([
        { url: "https://i.redd.it/nsfw.jpg", thumbnail: "nsfw" },
        { url: "https://i.redd.it/sfw.jpg", thumbnail: "default" },
        { url: "https://example.com/nsfw.jpg", thumbnail: "nsfw" },
      ], null),
    })

    vi.stubGlobal("fetch", fetchMock)

    const posts = await fetchPosts({
      q: 'flair:"Desktop"',
      sort: "top",
      t: "year",
      nsfw: true,
    } as never)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect((fetchMock.mock.calls[0]?.[0] as string)).toContain("include_over_18=on")
    expect(posts).toEqual([
      { url: "https://i.redd.it/nsfw.jpg", thumbnail: "nsfw" },
    ])
  })
})
