import React, { useState, useEffect } from "react"
import NProgress from "nprogress/nprogress.js"

export default ({ src, ...props }) => {
  const [loadedSrc, setLoadedSrc] = useState(null)

  useEffect(() => {
    if (!src)
      return

    const xmlHTTP = new XMLHttpRequest()
    xmlHTTP.open("GET", src, true)
    xmlHTTP.responseType = "arraybuffer"
    xmlHTTP.onload = function () {
      NProgress.done()
      setLoadedSrc(window.URL.createObjectURL(new Blob([this.response])))
    }
    xmlHTTP.onprogress = (e) => {
      NProgress.set(e.loaded / e.total)
    }
    xmlHTTP.onloadstart = () => {
      NProgress.start()
    }
    xmlHTTP.send()
  }, [src])

  return <img src={loadedSrc} {...props} />
}
