import { useSnapshot } from "valtio"
import { ConfigStore, toggleMenu } from "../stores/ConfigStore"
import { useEffect, useState } from "react"
import { FaArrowDown, FaArrowUp } from "react-icons/fa"

import "./styles/MenuButton.scss"

const TIMEOUT_MS = 3000

function MenuButton() {
  const { isMenuVisible: isVisible } = useSnapshot(ConfigStore)
  const [isHovered, setIsHovered] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsHovered(false)
    }, TIMEOUT_MS)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div
      className={`menu-button ${
        isVisible || isHovered ? "visible" : ""
      }`}
    >
      <button
        onClick={toggleMenu}
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
            Hide Menu <FaArrowDown size={16} />
          </>
        ) : (
          <>
            Show Menu <FaArrowUp size={16} />
          </>
        )}
      </button>
    </div>
  )
}

export default MenuButton
