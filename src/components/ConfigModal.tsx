/* eslint-disable */

import "./styles/ConfigModal.scss"

interface ConfigModalProps {
  open: boolean
  config: any
  setOpen: (open: boolean) => void
  setConfig: (config: any) => void
}

export const ConfigModal = function ({ open, setOpen, config, setConfig }: ConfigModalProps) {

  // useEffect(() => {
  //   chrome.storage.sync.get(["config"], (res) => {
  //     console.log(res)
  //     setData(JSON.parse(res.config || '{}'))
  //   })
  // }, [])

  // TODO: Spinner for !config
  if (!config || !open) return null

  return (
    <div className="modal">
      <div className="modal-bg" onClick={() => setOpen(false)} />
      <form className="modal-content" onSubmit={(e) => {
        e.preventDefault()

        // const toSet = {
        //   ...data,
        //   t: 'all'
        // }



        // chrome.storage.sync.set({ config: JSON.stringify(toSet) }, () => {
        //   console.log('[i] Settings saved')
        // })
      }}>
        <h1>Settings</h1>

        <label>
          <span>Time span</span>
          <select name="t" onChange={(e) => setConfig({ ...config, t: e.currentTarget.value })}>
            <option value="hour">Hour</option>
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
            <option value="all">All</option>
          </select>
        </label>

        <label>
          <span>Sort by</span>
          <select name="sort">
            <option value="relevance">Relevance</option>
            <option value="hot">Hot</option>
            <option value="top">Top</option>
            <option value="new">New</option>
            <option value="comments">Comments</option>
          </select>
        </label>

        <button type="reset">Reset</button>
        <button type="submit">Save</button>
      </form>
    </div>
  )
}
