import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import NProgress from "nprogress/nprogress"

import "normalize.css"
import "./css/nprogress.css"

import App from "./App"

NProgress.configure({
  showSpinner: false,
  trickle: false,
})

// Prevent transitions from preloading
window.addEventListener("load", () => {
  document.body.classList.remove("preload")

  // Render after window load to prevent instant img loading
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
})
