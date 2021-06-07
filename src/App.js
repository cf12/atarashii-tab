import React, { useState, useEffect } from "react"
import { decode } from "html-entities"
import { FaReddit, FaCog, FaSadTear, FaGithub, FaHeart } from "react-icons/fa"
import { PuffLoader, RotateLoader } from "react-spinners"

import useLocalStorage from "./hooks/useLocalStorage"

import TimeDate from "./components/TimeDate"
import ConfigModal from "./components/ConfigModal"
import Config from "./components/Config"
import Icons from "./components/Icons"
import Image from "./components/Image"

import AppContext from "./contexts/AppContext"

import "./App.scss"

export default () => {
  const [data, setData] = useState(undefined)
  const [loaded, setLoaded] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [config, setConfig] = useLocalStorage("config", {
    q: `flair:"Desktop"`,
    sort: "top",
    t: "all",
    theme: {
      primary: "#ffc400",
    },
  })

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
    if (!cache || loaded) return

    console.log('[i] Fetching w/ config:', config)

    async function run() {
      let posts = []

      // Cache for 12 hours
      if (Date.now() - cache.lastUpdated < 1000 * 60 * 60 * 12) {
        console.log('[i] Using cached posts')
        posts = cache.data
      } else {
        let after = null

        while (posts.length < 100) {
          const query = new URLSearchParams({
            q: config.q,
            sort: config.sort,
            t: config.t,
            show: "all",
            restrict_sr: 1,
            after,
          })

          const res = await fetch(
            `https://www.reddit.com/r/Animewallpaper/search.json?${query}`
          )
          const json = await res.json()

          after = json.data.after
          if (!after) break

          // Collect posts w/ i.redd.it only
          let tmpPosts = json.data.children
            .map((e) => e.data)
            .filter((e) => e.url.includes("i.redd.it"))

          posts = posts.concat(tmpPosts)
        }

        setCache({ lastUpdated: Date.now(), data: posts })
      }

      if (!posts.length) {
        setData(null)
        setLoaded(true)
        return
      }

      const num = Math.floor(Math.random() * posts.length)
      const post = posts[num]
      const link = `https://redd.it/${post.id}`

      const rawTitle = decode(post.title)

      const parts = rawTitle
        .match(/\[.*?\]|\(.*?\)|\{.*?\}/g)
        .map((e) => e.slice(1, -1))
      const title = '"' + rawTitle.replace(/\[.*?\]|\(.*?\)|\{.*?\}/g, '').trim() + '"'

      let resolution = parts.filter((e) => e.match(/[\d\s]+[x×*][\d\s]+/g))?.[0]

      if (resolution) {
        parts.splice(parts.indexOf(resolution), 1)
        resolution = resolution.split(/[x×*]/).join(" × ")
      }

      parts.unshift(title)

      setData({
        title: parts.join(" • "),
        res: resolution || "",
        url: post.url,
        link,
        num,
      })
    }

    run()
  }, [cache, loaded])

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
      }}
    >
      <div className={loaded ? "load" : ""}>
        <div className="content">
          <header>
            <div className="header-left">
              <TimeDate />

              <div className="details">
                <p className="to-load to-delay-1">{data?.title}</p>
                <p className="to-load to-delay-2">{data?.res}</p>
              </div>

              {data && <Icons link={data.link} url={data.url} />}
            </div>

            <div className="header-right to-right">
              {/* <FaCog size={24} onClick={() => setModalOpen(e => !e)} /> */}
              <Config />
            </div>
          </header>

          <footer className="to-bottom">
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

              {!loaded && (
                <span className="attr-loader">
                  <PuffLoader color="white" size={24} />
                </span>
              )}
            </div>

            <div className="credits to-right">
              <p>
                Created with <FaHeart /> •{" "}<a href="https://github.com/cf12/atarashii-tab">@cf12</a>
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
      </div>
    </AppContext.Provider>
  )
}
