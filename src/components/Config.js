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

const ValuePicker = ({ valueKey, values }) => {
  const { cache, setCache, config, setConfig, loaded, setLoaded } =
    useContext(AppContext)

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
                  let newConfig = {
                    ...config,
                    [valueKey]: value,
                    num: null,
                  }

                  // Sorting by new on Reddit needs to be all
                  if (valueKey === "sort" && value === "new")
                    newConfig.t = "all"

                  setConfig(newConfig)
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

export default () => {
  const { config, setLoaded, setCache, setConfig, data } =
    useContext(AppContext)

  const toggle = (key) => {
    setConfig((config) => {
      return {
        ...config,
        [key]: !config[key],
      }
    })
  }

  const togglePin = () => {
    setConfig((config) => {
      return {
        ...config,
        num: config.num !== null ? null : data.num,
      }
    })
  }

  useEffect(() => {
    if (!config) return

    const action = (e) => {
      if (e.code === "KeyG") toggle("hideGui")

      if (config.hideGui) return
      else if (e.code === "KeyI") toggle("incognito")
      else if (config.incognito) return
      else if (e.code === "KeyR" && config.num === null) setLoaded(false)
      else if (e.code === "KeyP") togglePin()
    }

    document.addEventListener("keydown", action)

    return () => {
      document.removeEventListener("keydown", action)
    }
  }, [config])

  return (
    <div className="config">
      <ValuePicker
        valueKey="sort"
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
            setConfig({
              ...config,
              num: null,
              nsfw: !config.nsfw,
            })
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
          onClick={() => togglePin()}
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
