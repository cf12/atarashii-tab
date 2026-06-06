import "./styles/Menu.scss"
import { type CSSProperties, useEffect, useRef, useState } from "react"
import {
  FaCog,
  FaEyeDropper,
  FaHistory,
  FaStar,
  FaThumbtack,
  FaTrash,
} from "react-icons/fa"
import { ConfigStore, PRIMARY_COLOR_PRESETS } from "../stores/ConfigStore"
import { useSnapshot } from "valtio"
import {
  clearHistory,
  HistoryStore,
  removeHistoryAt,
  toggleFavoriteAt,
} from "../stores/HistoryStore"
import { LoadState, setLoaded } from "../stores/AppStore"

type MenuTab = "history" | "settings"

type MenuCardProps = {
  data: (typeof HistoryStore.history)[number]
  index: number
  isCurrent: boolean
  isEntering: boolean
  isNewest: boolean
  isPinned: boolean
  onFavorite: () => void
  onRemove: () => void
}

function MenuCard({
  data,
  index,
  isCurrent,
  isEntering,
  isNewest,
  isPinned,
  onFavorite,
  onRemove,
}: MenuCardProps) {
  return (
    <div
      data-index={index}
      className={`card ${isPinned ? "pinned" : ""} ${isCurrent ? "current" : ""} ${isEntering ? "entering" : ""}`}
      onClick={
        () => {
          if (isPinned) {
            ConfigStore.pinned = false
            setLoaded(LoadState.LOADED)
          } else {
            ConfigStore.pinned = true
            HistoryStore.i = index
            setLoaded(isCurrent ? LoadState.LOADED : LoadState.LOADING)
          }
        }
      }
    >
      <div className="card-image">
        <img
          src={data.thumbnailUrl || data.url}
          loading="lazy"
          decoding="async"
          onLoad={(event) => {
            event.currentTarget.classList.add("loaded")
          }}
        />
      </div>

      <p className="card-details">
        <strong title={data.title || "Untitled Wallpaper"}>
          {data.title || "Untitled Wallpaper"}
        </strong>
        {data.res && <small>{data.res}</small>}
      </p>

      <p className="card-status">
        <span>#{String(index + 1).padStart(2, "0")}</span>
        {isPinned ? <FaThumbtack size={14} /> : isNewest ? "NEW" : null}
      </p>

      <div className="card-actions">
        <button
          type="button"
          className={`card-action-button card-favorite-button ${data.favorite ? "active" : ""}`}
          aria-label={`${data.favorite ? "Remove" : "Add"} ${data.title || "wallpaper"} ${data.favorite ? "from" : "to"} favorites`}
          onClick={(event) => {
            event.stopPropagation()
            onFavorite()
          }}
        >
          <FaStar size={13} />
        </button>

        <button
          type="button"
          className="card-action-button card-remove-button"
          aria-label={`Remove ${data.title || "wallpaper"} from history`}
          onClick={(event) => {
            event.stopPropagation()
            onRemove()
          }}
        >
          <FaTrash size={13} />
        </button>
      </div>
    </div>
  )
}

export default function Menu () {
  const { history, i: historyIndex } = useSnapshot(HistoryStore)
  const { pinned, isMenuVisible, theme, settings } = useSnapshot(ConfigStore)
  const [activeTab, setActiveTab] = useState<MenuTab>("history")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const previousHistoryLength = useRef(history.length)
  const [enteringIndex, setEnteringIndex] = useState<number | null>(null)
  const primaryColor = theme.primary
  const isCustomPrimaryColor = !PRIMARY_COLOR_PRESETS.includes(
    primaryColor as (typeof PRIMARY_COLOR_PRESETS)[number]
  )
  const backgroundDim = theme.backgroundDim ?? 0.35
  const historyCards = [...history]
    .map((data, index) => ({ data, index }))
    .filter(({ data }) => !showFavoritesOnly || data.favorite)
    .reverse()

  useEffect(() => {
    if (history.length > previousHistoryLength.current) {
      setEnteringIndex(history.length - 1)
    }

    previousHistoryLength.current = history.length
  }, [history.length])

  const clearAllHistory = () => {
    ConfigStore.pinned = false
    clearHistory()
  }

  const removeHistoryCard = (index: number) => {
    if (pinned && historyIndex === index) ConfigStore.pinned = false
    removeHistoryAt(index)
  }

  const toggleHistoryFavorite = (index: number) => {
    toggleFavoriteAt(index)
  }

  return (
    <div className={`menu ${isMenuVisible ? "visible" : ""}`}>
      <aside className="menu-sidebar" aria-label="Menu tabs">
        <button
          type="button"
          className={activeTab === "history" ? "active" : ""}
          onClick={() => setActiveTab("history")}
        >
          <FaHistory size={16} />
          History
        </button>

        <button
          type="button"
          className={activeTab === "settings" ? "active" : ""}
          onClick={() => setActiveTab("settings")}
        >
          <FaCog size={16} />
          Settings
        </button>

      </aside>

      <div className="menu-content">
        {activeTab === "history" ? (
          <section className="history-panel" aria-label="History">
            <div className="cards-container">
              {historyCards.map(({ data, index }) => {
                const isPinned = pinned && historyIndex === index
                const isCurrent = historyIndex === index
                const isEntering = enteringIndex === index
                const isNewest = index === history.length - 1

                return (
                  <MenuCard
                    key={`menu-card-${index}`}
                    data={data}
                    index={index}
                    isCurrent={isCurrent}
                    isEntering={isEntering}
                    isNewest={isNewest}
                    isPinned={isPinned}
                    onFavorite={() => toggleHistoryFavorite(index)}
                    onRemove={() => removeHistoryCard(index)}
                  />
                )
              })}
            </div>

            <nav className="history-actions" aria-label="History actions">
              <button
                type="button"
                className={showFavoritesOnly ? "active" : ""}
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              >
                <FaStar size={14} />
                Favorites
              </button>

              <button
                type="button"
                disabled={!history.some(({ favorite }) => !favorite)}
                onClick={clearAllHistory}
              >
                <FaTrash size={14} />
                Clear
              </button>
            </nav>
          </section>
        ) : (
          <div className="settings-panel" aria-label="Settings">
            <section className="settings-section">
              <div className="settings-header">
                <h2>Accent Color</h2>
                <p>Customize the primary color used for highlights and links.</p>
              </div>

              <div className="color-presets" aria-label="Primary color presets">
                {PRIMARY_COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={primaryColor === color ? "active" : ""}
                    style={{ "--preset-color": color } as CSSProperties}
                    aria-label={`Set primary color to ${color}`}
                    onClick={() => {
                      ConfigStore.theme.primary = color
                    }}
                  />
                ))}
                <label
                  className={
                    "custom-color-button" +
                    (isCustomPrimaryColor ? " active" : "")
                  }
                  style={{ "--preset-color": primaryColor } as CSSProperties}
                  aria-label="Choose custom primary color"
                >
                  <FaEyeDropper size={15} aria-hidden="true" />
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(event) => {
                      ConfigStore.theme.primary = event.currentTarget.value
                    }}
                  />
                </label>
              </div>
            </section>

            <section className="settings-section">
              <div className="settings-header">
                <h2>Background Dim</h2>
                <p>
                  Choose the background dim opacity percentage.
                </p>
              </div>

              <label className="range-picker-row">
                <span>Opacity</span>
                <strong>{Math.round(backgroundDim * 100)}%</strong>
              </label>

              <input
                className="dim-opacity-slider"
                type="range"
                min="0"
                max="0.75"
                step="0.01"
                value={backgroundDim}
                onChange={(event) => {
                  ConfigStore.theme.backgroundDim = Number(
                    event.currentTarget.value
                  )
                }}
              />
            </section>

            <section className="settings-section">
              <div className="settings-header">
                <h2>Reroll Effects</h2>
                <p>Choose which effects play when rolling a new wallpaper.</p>
              </div>

              <span className="small-section">
                <label className="toggle-picker-row">
                  <span>Reroll jingle</span>
                  <button
                    type="button"
                    className={settings.soundEffects ? "active" : ""}
                    onClick={() => {
                      ConfigStore.settings.soundEffects = !ConfigStore.settings.soundEffects
                    }}
                  >
                    {settings.soundEffects ? "on" : "off"}
                  </button>
                </label>

                <label className="toggle-picker-row">
                  <span>Large flash</span>
                  <button
                    type="button"
                    className={settings.rerollFlash ? "active" : ""}
                    onClick={() => {
                      ConfigStore.settings.rerollFlash = !ConfigStore.settings.rerollFlash
                    }}
                  >
                    {settings.rerollFlash ? "on" : "off"}
                  </button>
                </label>
              </span>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
