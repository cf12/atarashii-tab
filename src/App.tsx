import { decode } from "html-entities"
import { useEffect, useState } from "react"
import {
  FaArrowDown,
  FaArrowUp,
  FaHeart,
  FaReddit,
  FaSadTear,
} from "react-icons/fa"
import { PuffLoader } from "react-spinners"

import Config from "./components/Config"
import HistoryBar from "./components/HistoryBar"
import Icons from "./components/Icons"
import Image from "./components/Image"
import TimeDate from "./components/TimeDate"

import pkg from "../package.json"

import { useSnapshot } from "valtio"
import "./App.scss"
import { AppStore, LoadState, setLoaded } from "./stores/AppStore"
import { CacheStore } from "./stores/CacheStore"
import { ConfigStore, toggleHistoryBar } from "./stores/ConfigStore"
import { HistoryStore } from "./stores/HistoryStore"
import type { ImageData } from "./types/ImageData"
import { fetchPosts } from "./utils/fetchPosts"
import HistoryBarButton from "./components/HistoryBarButton"

function App() {
  const { loaded } = useSnapshot(AppStore)
  const config = useSnapshot(ConfigStore)
  const cache = useSnapshot(CacheStore)
  const { history, i } = useSnapshot(HistoryStore)

  // const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--primary",
      config.theme.primary
    )
  }, [config.theme.primary])

  useEffect(() => {
    if (config.pinned && loaded === LoadState.FETCH_NEW) {
      setLoaded(LoadState.LOADING)
    }
  }, [config.pinned, loaded])

  useEffect(() => {
    // No-op if incognito or pinned
    if (config.incognito || config.pinned || loaded !== LoadState.FETCH_NEW)
      return

    let ignore = false

    async function run() {
      let posts: any[] = []

      // Cache for 24 hours
      if (
        cache.lastUpdated === -1 ||
        Date.now() - cache.lastUpdated >= 1000 * 60 * 60 * 24
      ) {
        console.log("[i] Fetching w/ config:", config)
        posts = await fetchPosts(config)

        if (!ignore) {
          CacheStore.lastUpdated = Date.now()
          CacheStore.data = posts
        }
      } else {
        console.log("[i] Using cached posts")
        posts = cache.data as any[]
      }

      if (!posts.length || ignore) return

      // Decode post data into ImageData
      const num = Math.floor(Math.random() * posts.length)
      const post = posts[num]
      const link = `https://redd.it/${post.id}`

      console.log("[i] Loading post:", post)

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

      const data: ImageData = {
        title: parts.join(" • "),
        res: resolution || "",
        url: post.url,
        link,
        nums: [num, posts.length],
      }

      HistoryStore.history.push(data)
      setLoaded(LoadState.LOADING)
    }

    run()

    return () => {
      ignore = true
    }
  }, [cache.data, cache.lastUpdated, config, loaded])

  // Select post from history if pinned, else we pull from last history entry
  const data =
    history && loaded !== LoadState.FETCH_NEW
      ? config.pinned
        ? history[i]
        : history[history.length - 1]
      : undefined

  return (
    <div
      className={
        (!config.incognito && loaded === LoadState.LOADED ? "load" : "") +
        " " +
        (config.hideGui ? "hidden" : "")
      }
    >
      <div className="content">
        <header>
          <div className="header-left">
            <TimeDate />

            <div className="details hideable">
              <p className="to-load to-delay-1">{data?.title}</p>
              <p className="to-load to-delay-2">{data?.res}</p>
            </div>

            {data && <Icons link={data?.link} url={data?.url} />}
          </div>

          <div className="header-right">
            <Config />
          </div>
        </header>

        <footer className="to-bottom hideable">
          <div className="attr">
            <p className="attr-from to-load to-delay-3">
              {data === null ? (
                <strong>
                  No images found <FaSadTear size={20} />
                </strong>
              ) : (
                <>
                  Image from{" "}
                  <a href="https://reddit.com/r/animewallpaper">
                    <FaReddit size={20} /> r/Animewallpaper
                  </a>
                </>
              )}
            </p>

            <p className="attr-bottom to-load to-delay-4">
              {data === null ? (
                <>Try different filters! • Reddit down perhaps?</>
              ) : (
                <>
                  Post <strong>#{(data?.nums[0] || 0) + 1}</strong> of{" "}
                  <strong>{data?.nums[1]}</strong> •{" "}
                  <a href={data?.link}>{data?.link}</a>
                </>
              )}
            </p>

            {loaded !== LoadState.LOADED && !config.incognito && (
              <span className="attr-loader">
                <PuffLoader color="white" size={18} />
              </span>
            )}
          </div>

          <div className="credits">
            <p>
              Created with <FaHeart /> •{" "}
              <a href="https://github.com/cf12/atarashii-tab">v{pkg.version}</a>
            </p>
          </div>

          <HistoryBarButton />
        </footer>

        <HistoryBar />
      </div>

      {data === null ? null : (
        <Image
          className="bg to-load-bg"
          src={data?.url}
          alt=""
          onLoad={() => setLoaded(LoadState.LOADED)}
        />
      )}
    </div>
  )
}

export default App
