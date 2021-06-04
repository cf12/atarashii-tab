import React from "react"
import { render } from "react-dom"
import NProgress from 'nprogress/nprogress'

import "normalize.css"
import './css/nprogress.css'

NProgress.configure({
  showSpinner: false,
  trickle: false
})

import App from './App'

render(<App />, document.getElementById("root"))
