import { data } from "autoprefixer"
import React, { useContext } from "react"
import { FaExclamationTriangle, FaSync, FaThumbtack } from "react-icons/fa"

import AppContext from "../contexts/AppContext"

import "./styles/Config.scss"

const ValuePicker = ({ valueKey, values }) => {
  const { cache, setCache, config, setConfig, loaded, setLoaded } =
    useContext(AppContext)

  const curValue = config[valueKey]

  return (
    <div>
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
                    num: null
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
  const { config, setLoaded, setConfig, data } = useContext(AppContext)

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
              nsfw: !config.nsfw
            })
          }}
        >
          nsfw
          <FaExclamationTriangle size={16} />
        </div>

        <div
          className={"button" + (config.num !== null ? " active" : "")}
          onClick={() => {
            setConfig({
              ...config,
              num: config.num !== null ? null : data.num
            })
          }}
        >
          pin
          <FaThumbtack size={16} />
        </div>

        <div
          className="button"
          onClick={() => {
            setLoaded(false)
          }}
          disabled={config.num !== null}
        >
          reroll
          <FaSync size={16} />
        </div>
      </span>
    </div>
  )
}
