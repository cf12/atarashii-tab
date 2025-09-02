import { useContext } from "react"

import "./styles/HistoryBar.scss"
import AppContext from "../contexts/AppContext"
import { FaThumbtack } from "react-icons/fa"
import { ConfigStore } from "../stores/ConfigStore"
import { useSnapshot } from "valtio"
import { HistoryStore } from "../stores/HistoryStore"

const History = () => {
  const { setData, setLoaded } = useContext(AppContext)

  const { history } = useSnapshot(HistoryStore)

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
              ConfigStore.num = data.id
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
