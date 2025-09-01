import React, { useEffect, useContext } from "react"
import {
  FaExclamationTriangle,
  FaSync,
  FaThumbtack,
  FaEye,
  FaEyeSlash,
  FaUserSecret,
} from "react-icons/fa"

import { useShallow } from "zustand/react/shallow"

import AppContext from "../contexts/AppContext"

import "./styles/Config.scss"
import { useConfigStore  } from "../stores/useConfigStore"
import type { ConfigStore } from "../stores/useConfigStore"

const ValuePicker = ({ valueKey, values }) => {
  const { cache, setCache, loaded, setLoaded } = useContext(AppContext)

  const config = useConfigStore(useShallow(
    (state) => {
      
    }
  ))

  const set = useConfigStore(state => state.set)

  const curValue = config[valueKey]

  return (
    <div className="hideable">
      {values
        .map((value) => {
          if (value === curValue)
            return (
              <a key={value} className="selected">
                {value}
              </a>
            )
          else
            return (
              <a
                key={value}
                onClick={(e) => {
                  if (valueKey === "sort" && value === "new")
                    set("t", "all")

                  set(valueKey, value)
                  set("num", null)
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
        })
        .reduce((prev, cur) => [prev, "•", cur])}
    </div>
  )
}

function Config() {
  const { setLoaded, setCache, setConfig, data } = useContext(AppContext)

  const config = useConfigStore(
    useShallow((state) => ({
      hideGui: state.hideGui,
      incognito: state.incognito,
      num: state.num,
      sort: state.sort,
    }))
  )

  const toggle = useConfigStore((state) => state.toggle)

  useEffect(() => {
    if (!config || !setLoaded || !toggle) return

    const action = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) return
      else if (e.code === "KeyH") toggle("hideGui")
      else if (config.hideGui) return
      else if (e.code === "KeyI") toggle("incognito")
      else if (config.incognito) return
      else if (e.code === "KeyR" && config.num === null) setLoaded(false)
      else if (e.code === "KeyP") toggle("pinned")
    }

    document.addEventListener("keydown", action)

    return () => {
      document.removeEventListener("keydown", action)
    }
  }, [config, setLoaded, toggle])

  return (
    <div className="config">
      <ValuePicker
        valueKey=
        values={["relevance", "hot", "top", "new"]}
      />

      {config.sort !== "new" && (
        <ValuePicker
          valueKey="t"
          values={["hour", "day", "week", "month", "year", "all"]}
        />
      )}

      <span className="buttons">
        <div
          className={"button" + (config.nsfw ? " active" : "")}
          onClick={() => {
            set("num", null)
            toggle("nsfw")

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
        </div>

        <div
          className={"button" + (config.num !== null ? " active" : "")}
          onClick={() => toggle("pinned")}
          disabled={config.incognito}
        >
          pin
          <FaThumbtack size={16} />
        </div>

        <div
          className="button"
          onClick={() => setLoaded(false)}
          disabled={config.incognito || config.num !== null}
        >
          reroll
          <FaSync size={16} />
        </div>

        <div
          className={"button" + (config.incognito ? " active" : "")}
          onClick={() => toggle("incognito")}
        >
          incognito
          <FaUserSecret size={16} />
        </div>

        <div
          className="button"
          id="btnHideGui"
          onClick={() => toggle("hideGui")}
        >
          {!config.hideGui ? "hide" : "show"} gui
          {!config.hideGui ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
        </div>
      </span>

      {/* <span>
        <FaCog size={24} onClick={() => setModalOpen(e => !e)} />
        <p>More Settings</p>
      </span> */}
    </div>
  )
}

export default Config
