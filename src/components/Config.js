import React, { useContext } from "react"

import AppContext from '../contexts/AppContext'

import "./styles/Config.scss"

const ValuePicker = ({ valueKey, values }) => {
  const {
    cache, setCache,
    config, setConfig,
    loaded, setLoaded
  } = useContext(AppContext)

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
                  setConfig({
                    ...config,
                    [valueKey]: value,
                  })
                  setCache({
                    lastUpdated: -1,
                    data: []
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
  // TODO: Spinner for !config
  // if (!config || !open) return null

  return (
    <div className="config">
      <ValuePicker
        valueKey="t"
        values={["hour", "day", "week", "month", "year", "all"]}
      />

      <ValuePicker
        valueKey="sort"
        values={["relevance", "hot", "top", "new"]}
      />
    </div>
  )
}
