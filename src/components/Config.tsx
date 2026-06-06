import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaSync,
  FaThumbtack,
  FaUserSecret,
} from "react-icons/fa"

import { useSnapshot } from "valtio"
import { clearCache } from "../stores/CacheStore"
import {
  CONFIG_STATE_PICKABLE_FIELDS_MAP,
  ConfigStore,
  pickValue,
  toggle,
  toggleNsfw,
  type ConfigStatePickableFields,
} from "../stores/ConfigStore"
import "./styles/Config.scss"

import { LoadState, setLoaded, setShowRollOverlay } from "../stores/AppStore"

function playRollSound() {
  const AudioContextClass = window.AudioContext
  const audio = new AudioContextClass()
  const notes = [880, 1174.66, 1567.98]

  notes.forEach((frequency, index) => {
    const start = audio.currentTime + index * 0.07
    const gain = audio.createGain()
    const oscillator = audio.createOscillator()

    oscillator.type = "triangle"
    oscillator.frequency.setValueAtTime(frequency, start)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.055, start + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.09)

    oscillator.connect(gain)
    gain.connect(audio.destination)
    oscillator.start(start)
    oscillator.stop(start + 0.1)
  })
}

const ValuePicker = ({
  valueKey,
}: {
  valueKey: keyof ConfigStatePickableFields
}) => {
  const config = useSnapshot(ConfigStore)
  const values = CONFIG_STATE_PICKABLE_FIELDS_MAP[valueKey]
  const curValue = config[valueKey]

  return (
    <div className="hideable">
      {values
        .map((value) =>
          value === curValue ? (
            <a key={value} className="selected">
              {value}
            </a>
          ) : (
            <a
              key={value}
              onClick={() => {
                pickValue(valueKey, value)
                clearCache()
                setLoaded(LoadState.FETCH_NEW)
              }}
            >
              {value}
            </a>
          )
        )
        .reduce((prev, cur) => <>{prev} • {cur}</>)}
    </div>
  )
}

function Config() {
  const config = useSnapshot(ConfigStore)
  const [isRolling, setIsRolling] = useState(false)
  const rollOverlayTimeout = useRef<number | null>(null)

  const reroll = useCallback(() => {
    if (config.settings.soundEffects) playRollSound()
    setIsRolling(false)
    setShowRollOverlay(false)
    if (rollOverlayTimeout.current) window.clearTimeout(rollOverlayTimeout.current)

    requestAnimationFrame(() => setIsRolling(true))
    if (config.settings.rerollFlash) {
      requestAnimationFrame(() => setShowRollOverlay(true))

      rollOverlayTimeout.current = window.setTimeout(
        () => setShowRollOverlay(false),
        900
      )
    }

    setLoaded(LoadState.FETCH_NEW)
  }, [config.settings.rerollFlash, config.settings.soundEffects])

  useEffect(() => {
    if (!isRolling) return

    const timeout = window.setTimeout(() => setIsRolling(false), 500)
    return () => window.clearTimeout(timeout)
  }, [isRolling])

  const buttons = useMemo(
    () => [
      {
        id: "nsfw",
        icon: FaExclamationTriangle,
        action: () => {
          if (config.pinned) ConfigStore.pinned = false
          toggleNsfw()
          clearCache()
          setLoaded(LoadState.FETCH_NEW)
        },
        isActive: config.nsfw,
        isDisabled: config.incognito,
        // keyBinding: "KeyN",
      },
      {
        id: "pin",
        icon: FaThumbtack,
        action: () => toggle("pinned"),
        isActive: config.pinned,
        isDisabled: config.incognito,
        keyBinding: "KeyP",
      },
      {
        id: "reroll",
        icon: FaSync,
        action: reroll,
        isActive: isRolling,
        isDisabled: config.incognito || config.pinned,
        keyBinding: "KeyR",
      },
      {
        id: "incognito",
        icon: FaUserSecret,
        action: () => toggle("incognito"),
        isActive: config.incognito,
        keyBinding: "KeyI",
      },
      {
        id: "hideGui",
        label: () => `${!config.hideGui ? "hide" : "show"} gui`,
        icon: config.hideGui ? FaEye : FaEyeSlash,
        action: () => toggle("hideGui"),
        keyBinding: "KeyH",
      },
    ],
    [
      config.hideGui,
      config.incognito,
      config.nsfw,
      config.pinned,
      isRolling,
      reroll,
    ]
  )

  // Simplified keyboard event handler
  useEffect(() => {
    if (!config) return

    const action = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return

      const button = buttons.find((btn) => btn.keyBinding === e.code)
      if (button && !button.isDisabled) button.action()
    }

    document.addEventListener("keydown", action)
    return () => document.removeEventListener("keydown", action)
  }, [config, buttons])

  return (
    <div className="config">
      <ValuePicker valueKey="sort" />
      {config.sort !== "new" && <ValuePicker valueKey="t" />}

      <span className="buttons">
        {buttons.map((button) => (
          <button
            key={button.id}
            className={
              `button-${button.id}` + (button.isActive ? " active" : "")
            }
            onClick={button.action}
            disabled={button.isDisabled}
          >
            {button.label ? button.label() : button.id}
            <button.icon size={16} />
          </button>
        ))}
      </span>
    </div>
  )
}

export default Config
