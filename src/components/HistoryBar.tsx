import { useContext } from "react"

import "./styles/HistoryBar.scss"
import AppContext from "../contexts/AppContext"
import { FaThumbtack } from "react-icons/fa"

const History = () => {
  const { history, setHistory, setData, setConfig, setLoaded } =
    useContext(AppContext)

  return (
    <div className="history">
      <div className="cards-container">
        {history.map((data, i) => (
          <div
            key={`history-card-${i}`}
            className="card"
            onClick={() => {
              setLoaded(false)
              setData(data)
              setConfig((config) => {
                return { ...config, num: data.num }
              })
            }}
          >
            {/* {JSON.stringify(data)} */}
            <div className="card-cover">
              <FaThumbtack />
            </div>

            <img src={data.url} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default History
