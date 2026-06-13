import React, { useEffect, useRef, useState } from "react"
import NProgress from "nprogress"

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement>

function Image({ src, onLoad, onError, ...props }: ImageProps) {
  const [loadedSrc, setLoadedSrc] = useState(src)
  const currentSrc = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!src) return
    if (src === currentSrc.current) return

    currentSrc.current = src
    NProgress.start()
    setLoadedSrc(src)

    return () => {
      NProgress.done()
    }
  }, [src])

  return (
    <img
      src={loadedSrc}
      onLoad={(event) => {
        NProgress.done()

        requestAnimationFrame(() => {
          requestAnimationFrame(() => onLoad?.(event))
        })
      }}
      onError={(event) => {
        NProgress.done()
        onError?.(event)
      }}
      {...props}
    />
  )
}

export default Image
