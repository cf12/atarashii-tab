import React, { useContext } from "react"
import { FaSync } from "react-icons/fa"

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
  const { config, setLoaded, setConfig } = useContext(AppContext)

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

      <div
        className="reroll"
        onClick={() => {
          setLoaded(false)
        }}
      >
        reroll
        <FaSync size={16} />
      </div>
    </div>
  )
}
