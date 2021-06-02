import React, { useState, useEffect } from 'react'
import { FaReddit } from "react-icons/fa"
import { decode } from 'html-entities'

import TimeDate from "./components/TimeDate"
import Icons from "./components/Icons"

import "./App.scss"

export default () => {
  const [data, setData] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const query = new URLSearchParams({
      q: 'flair:"Desktop"',
      count: "5",
      sort: "top",
      t: "all",
      show: "all",
      restrict_sr: 1,
    })

    fetch(`https://www.reddit.com/r/Animewallpaper/search.json?${query}`)
      .then((res) => res.json())
      .then((data) => {
        const posts = data.data.children
        console.log(posts)

        let post

        do {
          post = posts[Math.floor(Math.random() * posts.length)].data
        } while (post && !post.url.includes("i.redd.it"))

        const link = `https://redd.it/${post.id}`
        let title = decode(post.title)
        // TODO: Optimize into one match?
        let parts = []
          .concat(title.match(/\[.*?\]/g))
          .concat(title.match(/\(.*?\)/g))
          .concat(title.match(/\{.*?\}/g))
          .filter((e) => !!e)
        const cutoff = Math.min(...parts.map((e) => title.indexOf(e)))
        parts = parts.map((e) => e.slice(1, -1))
        title = '"' + title.slice(0, cutoff).trim() + '"'

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
        })
      })
  }, [])

  return (
    <div className={loaded ? "load" : ""}>
      <div className="content">
        <header>
          <TimeDate />

          <div className="details">
            <p className="to-load to-delay-1">{data?.title}</p>
            <p className="to-load to-delay-2">{data?.res}</p>
          </div>

          {data && <Icons link={data.link} url={data.url} />}
        </header>

        <footer className="to-bottom">
          <div className="attr">
            <p className="attr-from to-load to-delay-3">
              Image from{" "}
              <a href="https://reddit.com/r/animewallpaper">
                <FaReddit size={20} /> r/Animewallpaper
              </a>
            </p>
            <p className="attr-bottom to-load to-delay-4">
              <a href={data?.link}>{data?.link}</a>
            </p>
            {/* <div className="attr-loader"></div> */}
          </div>

          <div className="credits to-right">
            <p>
              Created with &lt;3 • <a href="https://github.com/cf12">@cf12</a>
            </p>
          </div>
        </footer>
      </div>

      <img
        className="bg to-load-bg"
        src={data?.url}
        alt=""
        onLoad={() => setLoaded(true)}
      />

      <div className="modal"></div>
    </div>
  )
}