import React, { useState } from "react"

import './styles/Icons.scss'

export default ({ link, url }) => {
  const [data, setData] = useState({
    method: "GET",
    url: "",
    values: {},
  })

  return (
    <div className="hideable">
      <form
        className="icons to-load to-delay-3"
        method={data.method}
        action={data.url}
      >
        <button
          type="submit"
          service="reddit"
          title="Reddit"
          onClick={() => {
            setData({
              method: "GET",
              url: link,
            })
          }}
        >
          <img src="https://reddit.com/favicon.ico" alt="" />
        </button>

        <button
          type="submit"
          service="saucenao"
          title="SauceNAO"
          onClick={() => {
            setData({
              method: "POST",
              url: "https://saucenao.com/search.php",
              values: { url },
            })
          }}
        >
          <img src="https://saucenao.com/favicon.ico" alt="" />
        </button>

        <button
          type="submit"
          service="iqdb"
          title="iqdb.org"
          onClick={() => {
            setData({
              method: "POST",
              url: "https://iqdb.org/",
              values: { url },
            })
          }}
        >
          <img src="https://iqdb.org/favicon.ico" alt="" />
        </button>

        <button
          type="submit"
          service="ascii2d"
          title="ascii2d.net"
          onClick={() => {
            setData({
              method: "POST",
              url: "https://ascii2d.net/search/uri",
              values: { uri: url },
            })
          }}
        >
          <img src="https://ascii2d.net/favicon.ico" alt="" />
        </button>

        {data.values &&
          Object.entries(data.values).map(([k, v]) => (
            <input type="hidden" name={k} value={v} key={k} />
          ))}
      </form>
    </div>
  )
}
