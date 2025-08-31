import React, { useState, useEffect } from "react"
import { decode } from "html-entities"
import { FaReddit, FaSadTear, FaHeart, FaArrowDown } from "react-icons/fa"
import { PuffLoader } from "react-spinners"

import { useLocalStorage } from "@uidotdev/usehooks"

import TimeDate from "./components/TimeDate"
import Config from "./components/Config"
import Icons from "./components/Icons"
import Image from "./components/Image"
import HistoryBar from "./components/HistoryBar"

import AppContext from "./contexts/AppContext"

import pkg from "../package.json"

import "./App.scss"

function App() {
  const [data, setData] = useState(undefined)
  const [loaded, setLoaded] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [config, setConfig] = useLocalStorage("config", {
    num: null,
    q: `flair:"Desktop"`,
    sort: "top",
    t: "year",
    nsfw: false,
    theme: {
      primary: "#ffc400",
    },
  })

  const [history, setHistory] = useLocalStorage("history", [])
  const [cache, setCache] = useLocalStorage("cache", {
    lastUpdated: -1,
    data: [],
  })

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--primary",
      config.theme.primary
    )
  }, [config])

  useEffect(() => {
    if (loaded || config.incognito) return

    console.log("[i] Fetching w/ config:", config)

    async function run() {
      let posts = []

      // Cache for 24 hours, also never refresh cache if pinned
      // If (never cached OR (not pinned AND cache expired))
      if (
        cache.lastUpdated === -1 ||
        (config.num === null &&
          Date.now() - cache.lastUpdated >= 1000 * 60 * 60 * 24)
      ) {
        let after = null

        while (posts.length < 200) {
          const query = new URLSearchParams({
            q: config.q,
            sort: config.sort,
            t: config.t,
            show: "all",
            restrict_sr: 1,
            include_over_18: config.nsfw && "on",
            after,
          })

          const res = await fetch(
            `https://www.reddit.com/r/Animewallpaper/search.json?${query}`
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

        setCache({ lastUpdated: Date.now(), data: posts })
      } else {
        console.log("[i] Using cached posts")
        posts = cache.data
      }

      if (!posts.length) {
        setData(null)
        setLoaded(true)
        return
      }

      const num = config.num || Math.floor(Math.random() * posts.length)
      const post = posts[num]
      const link = `https://redd.it/${post.id}`

      console.log("[i] Loading post:", post)

      const rawTitle = decode(post.title)

      const parts = rawTitle
        .match(/\[.*?\]|\(.*?\)|\{.*?\}/g)
        .filter((e) => !!e)
        .map((e) => e.slice(1, -1))
      const title = rawTitle.replace(/\[.*?\]|\(.*?\)|\{.*?\}/g, "").trim()

      let resolution = parts.filter((e) => e.match(/[\d\s]+[x×*][\d\s]+/g))?.[0]

      if (resolution) {
        parts.splice(parts.indexOf(resolution), 1)
        resolution = resolution.split(/[x×*]/).join(" × ")
      }

      if (title) parts.unshift(title)

      const data = {
        title: parts.join(" • "),
        res: resolution || "",
        url: post.url,
        link,
        num,
      }

      setData(data)
      setHistory((history) => [data, ...history])
    }

    run()
  }, [config.incognito, loaded])

  return (
    <AppContext.Provider
      value={{
        data,
        setData,
        cache,
        setCache,
        config,
        setConfig,
        loaded,
        setLoaded,
        history,
        setHistory,
      }}
    >
      <div
        className={
          (!config.incognito && loaded ? "load" : "") +
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

              {data && <Icons link={data.link} url={data.url} />}
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
                    Post <strong>#{data?.num + 1}</strong> of{" "}
                    <strong>{cache.data.length}</strong> •{" "}
                    <a href={data?.link}>{data?.link}</a>
                  </>
                )}
              </p>

              {!loaded && !config.incognito && (
                <span className="attr-loader">
                  <PuffLoader color="white" size={24} />
                </span>
              )}
            </div>

            <div className="history-chevron">
              <FaArrowDown />
            </div>

            <div className="credits">
              <p>
                Created with <FaHeart /> •{" "}
                <a href="https://github.com/cf12/atarashii-tab">
                  v{pkg.version}
                </a>
              </p>
            </div>
          </footer>
        </div>

        {data === null ? null : (
          <Image
            className="bg to-load-bg"
            src={data?.url}
            alt=""
            onLoad={() => setLoaded(true)}
          />
        )}

        <HistoryBar />
      </div>
    </AppContext.Provider>
  )
}

export default App
