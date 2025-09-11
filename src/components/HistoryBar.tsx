import "./styles/HistoryBar.scss"
import { FaThumbtack } from "react-icons/fa"
import { ConfigStore } from "../stores/ConfigStore"
import { useSnapshot } from "valtio"
import { HistoryStore } from "../stores/HistoryStore"
import { LoadState, setLoaded } from "../stores/AppStore"

const History = () => {
  const { history, i: historyIndex } = useSnapshot(HistoryStore)
  const { pinned, isHistoryBarVisible } = useSnapshot(ConfigStore)

  return (
    <div className={`history ${isHistoryBarVisible ? "visible" : ""}`}>
      <div className="cards-container">
        {history.map((data, i) => {
          const isPinned = pinned && historyIndex === i

          return (
            <div
              key={`history-card-${i}`}
              className={`card ${isPinned ? "pinned" : ""}`}
              onClick={
                !isPinned
                  ? () => {
                      ConfigStore.pinned = true
                      setLoaded(LoadState.FETCH_NEW)
                      HistoryStore.i = i
                    }
                  : undefined
              }
            >
              <div className="card-cover">
                <FaThumbtack />
              </div>

              <img src={data.url} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default History
