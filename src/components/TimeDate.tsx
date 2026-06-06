import { useState, useEffect } from "react"

import './styles/TimeDate.scss'

export const TimeDate = function () {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <h1 className="time">
        {now.toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "numeric",
          second: undefined,
        })}
      </h1>

      <h2 className="date">
        {now.toLocaleDateString(undefined, {
          weekday: "long",
          month: "short",
          day: "numeric",
        })}
      </h2>
    </>
  )
}

export default TimeDate
