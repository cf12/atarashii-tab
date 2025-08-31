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

// Prevent transitions from preloading
window.addEventListener('load', () => {
  document.body.classList.remove('preload')

  // Render after window load to prevent instant img loading
  render(<App />, document.getElementById("root"))
})

