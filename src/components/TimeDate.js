import React, { useState, useEffect } from "react"

export default () => {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    setInterval(() => setNow(new Date()), 1000)
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
