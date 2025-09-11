import { useSnapshot } from "valtio"
import { ConfigStore, toggleHistoryBar } from "../stores/ConfigStore"
import { useEffect, useState } from "react"
import { FaArrowDown, FaArrowUp } from "react-icons/fa"

import "./styles/HistoryBarButton.scss"

const TIMEOUT_MS = 3000

function HistoryBarButton() {
  const { isHistoryBarVisible: isVisible } = useSnapshot(ConfigStore)
  const [isHovered, setIsHovered] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsHovered(false)
    }, TIMEOUT_MS)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div
      className={`history-bar-button ${
        isVisible || isHovered ? "visible" : ""
      }`}
    >
      <button
        onClick={toggleHistoryBar}
        onMouseEnter={() => {
          setIsHovered(true)
        }}
        onMouseLeave={() => {
          if (isVisible || !isHovered) return

          setTimeout(() => {
            setIsHovered(false)
          }, TIMEOUT_MS)
        }}
      >
        {isVisible ? (
          <>
            Hide History <FaArrowDown size={16} />
          </>
        ) : (
          <>
            Show History <FaArrowUp size={16} />
          </>
        )}
      </button>
    </div>
  )
}

export default HistoryBarButton
