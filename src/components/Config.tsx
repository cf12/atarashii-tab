import React, { useEffect, useContext } from "react"
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
  togglePin,
  pickValue,
  type ConfigStatePickableFields,
  CONFIG_STATE_PICKABLE_FIELDS_MAP,
} from "../stores/ConfigStore"
import { useSnapshot } from "valtio"

const ValuePicker = ({
  valueKey,
}: {
  valueKey: keyof ConfigStatePickableFields
}) => {
  const { cache, setCache, loaded, setLoaded } = useContext(AppContext)

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
                setCache({
                  lastUpdated: -1,
                  data: [],
                })
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
  const { setLoaded, setCache, data } = useContext(AppContext)

  const config = useSnapshot(ConfigStore)

  useEffect(() => {
    if (!config) return

    const action = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return
      else if (e.code === "KeyH") toggle("hideGui")
      else if (config.hideGui) return
      else if (e.code === "KeyI") toggle("incognito")
      else if (config.incognito) return
      else if (e.code === "KeyR" && config.num === null) setLoaded(false)
      else if (e.code === "KeyP") togglePin()
    }

    document.addEventListener("keydown", action)

    return () => {
      document.removeEventListener("keydown", action)
    }
  }, [config, setLoaded])

  return (
    <div className="config">
      <ValuePicker valueKey="sort" />
      {config.sort !== "new" && <ValuePicker valueKey="t" />}

      <span className="buttons">
        <button
          className={config.nsfw ? " active" : ""}
          onClick={() => {
            toggleNsfw()

            setCache({
              lastUpdated: -1,
              data: [],
            })
            setLoaded(false)
          }}
          disabled={config.incognito}
        >
          nsfw
          <FaExclamationTriangle size={16} />
        </button>

        <button
          className={config.num !== null ? " active" : ""}
          onClick={() => togglePin()}
          disabled={config.incognito}
        >
          pin
          <FaThumbtack size={16} />
        </button>

        <button
          onClick={() => setLoaded(false)}
          disabled={config.incognito || config.num !== null}
        >
          reroll
          <FaSync size={16} />
        </button>

        <button
          className={config.incognito ? " active" : ""}
          onClick={() => toggle("incognito")}
        >
          incognito
          <FaUserSecret size={16} />
        </button>

        <button id="btnHideGui" onClick={() => toggle("hideGui")}>
          {!config.hideGui ? "hide" : "show"} gui
          {!config.hideGui ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
        </button>
      </span>

      {/* <span>
        <FaCog size={24} onClick={() => setModalOpen(e => !e)} />
        <p>More Settings</p>
      </span> */}
    </div>
  )
}

export default Config
