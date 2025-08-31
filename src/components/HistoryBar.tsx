import { useContext } from "react"

import "./styles/HistoryBar.scss"
import AppContext from "../contexts/AppContext"

const History = () => {
  const { history, setHistory } = useContext(AppContext)

  return (
    <div className="history">
      {history.map((data) => (
        <div className="card">
          {/* {JSON.stringify(data)} */}

          <img src={data.url} />
        </div>
      ))}
    </div>
  )
}

export default History
