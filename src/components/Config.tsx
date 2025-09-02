import React, { useEffect, useContext, useMemo } from "react"
import {
  FaExclamationTriangle,
  FaSync,
  FaThumbtack,
  FaCog,
  FaEye,
  FaEyeSlash,
  FaUserSecret,
} from "react-icons/fa"

import AppContext from "../contexts/AppContext"

import "./styles/Config.scss"
import {
  ConfigStore,
  toggle,
  toggleNsfw,
  pickValue,
  type ConfigStatePickableFields,
  CONFIG_STATE_PICKABLE_FIELDS_MAP,
} from "../stores/ConfigStore"
import { useSnapshot } from "valtio"
import { clearCache } from "../stores/CacheStore"

const ValuePicker = ({
  valueKey,
}: {
  valueKey: keyof ConfigStatePickableFields
}) => {
  const { loaded, setLoaded } = useContext(AppContext)

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
                setLoaded(false)
              }}
            >
              {value}
            </a>
          )
        )
        .reduce((prev, cur) => [prev, "•", cur])}
    </div>
  )
}

function Config() {
  const { setLoaded, data } = useContext(AppContext)

  const config = useSnapshot(ConfigStore)

  const buttons = useMemo(
    () => [
      {
        id: "nsfw",
        icon: FaExclamationTriangle,
        action: () => {
          toggleNsfw()
          clearCache()
          setLoaded(false)
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
        action: () => setLoaded(false),
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
    [config, setLoaded]
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
