import { useEffect } from "react"
import { FaHeart, FaReddit, FaSadTear, FaSync } from "react-icons/fa"
import { PuffLoader } from "react-spinners"

import Config from "./components/Config"
import Menu from "./components/Menu"
import Image from "./components/Image"
import { TimeDate } from "./components/TimeDate"

import pkg from "../package.json"

import { useSnapshot } from "valtio"
import "./App.scss"
import {
  AppStore,
  LoadState,
  setLoaded,
} from "./stores/AppStore"
import { CacheStore } from "./stores/CacheStore"
import { ConfigStore } from "./stores/ConfigStore"
import {
  HistoryStore,
  pushPostToHistory,
  type RedditPost,
} from "./stores/HistoryStore"
import { fetchPosts } from "./utils/fetchPosts"
import MenuButton from "./components/MenuButton"

function App() {
  const { loaded, showRollOverlay } = useSnapshot(AppStore)
  const config = useSnapshot(ConfigStore)
  const cache = useSnapshot(CacheStore)
  const { history, i } = useSnapshot(HistoryStore)

  // const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--primary",
      config.theme.primary
    )

    document.documentElement.style.setProperty(
      "--background-dim",
      String(config.theme.backgroundDim)
    )
  }, [config.theme.primary, config.theme.backgroundDim])

  console.log(config.theme)

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
      let posts: RedditPost[] = []

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
        posts = cache.data as RedditPost[]
      }

      if (!posts.length || ignore) return

      const num = Math.floor(Math.random() * posts.length)
      const post = posts[num]

      console.log("[i] Loading post:", post)

      pushPostToHistory(post, num, posts.length)
      setLoaded(LoadState.LOADING)
    }

    run()

    return () => {
      ignore = true
    }
  }, [cache.data, cache.lastUpdated, config, loaded])

  const data =
    history && loaded !== LoadState.FETCH_NEW
      ? history[i] || history[history.length - 1]
      : undefined

  return (
    <div className={showRollOverlay ? "roll-flashing" : ""}>
      {showRollOverlay && (
        <div className="roll-overlay" aria-label="Rolling wallpaper">
          <FaSync size={48} />
        </div>
      )}

      <div
        className={
          "app-frame " +
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

            <MenuButton />
            <Menu />
          </footer>
        </div>

        {data === null ? null : (
          <Image
            className="bg to-load-bg"
            src={data?.backgroundUrl || data?.url}
            alt=""
            onLoad={() => {
              setLoaded(LoadState.LOADED)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default App
