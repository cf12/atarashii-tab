import React, { useState, useEffect } from "react"
import NProgress from "nprogress"

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement>

function Image({ src, ...props }: ImageProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!src) return

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

export default Image
