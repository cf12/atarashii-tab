// TODO: XSS possible through reddit -- sanitize all inputs
import "./index.scss"

import "normalize.css"
import "nprogress/nprogress.css"
import NProgress from "nprogress/nprogress"

import "@fortawesome/fontawesome-free/js/fontawesome"
import "@fortawesome/fontawesome-free/js/brands"
import "@fortawesome/fontawesome-free/js/solid"

const bg = document.querySelector(".bg")
const time = document.querySelector(".time")
const attrSource = document.querySelector(".attr-source")
const date = document.querySelector(".date")
const content = document.querySelector(".content")
const icons = document.querySelector(".icons")

const detailsTitle = document.querySelector(".details-title")
const detailsRes = document.querySelector(".details-res")

const setupIconsForm = (method, url, data = {}) => {
  icons.reset()

  icons.querySelectorAll('input[type=hidden]')
    .forEach(node => icons.removeChild(node))

  icons.method = method
  icons.action = url

  for (const key in data) {
    const node = document.createElement("input")
    node.type = "hidden"
    node.name = key
    node.value = data[key]

    icons.appendChild(node)
  }
}

// https://stackoverflow.com/questions/14218607/javascript-loading-progress-of-an-image
Image.prototype.load = function (url) {
  var thisImg = this
  var xmlHTTP = new XMLHttpRequest()
  xmlHTTP.open("GET", url, true)
  xmlHTTP.responseType = "arraybuffer"
  xmlHTTP.onload = function (e) {
    var blob = new Blob([this.response])
    thisImg.src = window.URL.createObjectURL(blob)
  }
  xmlHTTP.onprogress = function (e) {
    console.log("asd")
    thisImg.completedPercentage = parseInt((e.loaded / e.total) * 100)
    NProgress.set(e.loaded / e.total)
  }
  xmlHTTP.onloadstart = function () {
    thisImg.completedPercentage = 0
  }
  xmlHTTP.send()
}

Image.prototype.completedPercentage = 0

function decodeHtml(html) {
  let txt = document.createElement("textarea")
  txt.innerHTML = html
  return txt.value
}

;(function update() {
  const now = new Date()

  time.textContent = now.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "numeric",
    second: undefined,
  })

  date.textContent = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  })

  setTimeout(update, 1000)
})()

bg.addEventListener(
  "load",
  () => {
    bg.classList.add("load-bg")
    content.classList.add("load")
  },
  false
)

// TODO: Pagination + display number of results on main page
// TODO: Allow user customization for parameters
// TODO: Cache results every 12hr / 24hr
const query = new URLSearchParams({
  q: 'flair:"Desktop"',
  count: "5",
  sort: "top",
  t: "all",
  show: "all",
  restrict_sr: 1,
})

fetch(`https://www.reddit.com/r/Animewallpaper/search.json?${query}`)
  .then((res) => res.json())
  .then((data) => {
    const posts = data.data.children
    console.log(posts)

    let post

    do {
      post = posts[Math.floor(Math.random() * posts.length)].data
    } while (post && !post.url.includes("i.redd.it"))

    const redditUrl = `https://redd.it/${post.id}`
    let title = decodeHtml(post.title)
    let parts = []

    // TODO: Optimize into one match?
    parts = parts.concat(title.match(/\[.*?\]/g))
    parts = parts.concat(title.match(/\(.*?\)/g))
    parts = parts.concat(title.match(/\{.*?\}/g))
    parts = parts.filter((e) => !!e)
    const cutoff = Math.min(...parts.map((e) => title.indexOf(e)))
    parts = parts.map((e) => e.slice(1, -1))
    title = '"' + title.slice(0, cutoff).trim() + '"'

    let resolution = parts.filter((e) => e.match(/\d+[x×*]\d+/g))?.[0]

    if (resolution) {
      parts.splice(parts.indexOf(resolution), 1)
      resolution = resolution.split(/[x×*]/).join(" × ")
    }

    parts.unshift(title)

    icons
      .querySelector("button[service=reddit]")
      .addEventListener("click", () => {
        setupIconsForm("GET", redditUrl)
      })

    icons
      .querySelector("button[service=saucenao]")
      .addEventListener("click", () => {
        setupIconsForm("POST", "https://saucenao.com/search.php", {
          url: post.url,
        })
      })

    icons
      .querySelector("button[service=iqdb]")
      .addEventListener("click", () => {
        setupIconsForm("POST", "https://iqdb.org/", {
          url: post.url,
        })
      })

    icons
      .querySelector("button[service=ascii2d]")
      .addEventListener("click", () => {
        setupIconsForm("POST", "https://ascii2d.net/search/uri", {
          uri: post.url,
        })
      })

    detailsTitle.textContent = parts.join(" • ")
    detailsRes.textContent = resolution || ""

    bg.src = post.url
    attrSource.textContent = attrSource.href = redditUrl
  })

// chrome.identity.launchWebAuthFlow(
//   {
//     url: "https://anilist.co/api/v2/oauth/authorize?client_id=***REMOVED***&response_type=token",
//     interactive: true,
//   },
//   (res) => {
//     const token = res.split("access_token=")[1].split("&")[0]
//     console.log(token)

//     // Here we define our query as a multi-line string
//     // Storing it in a separate .graphql/.gql file is also possible
//     var query = `
// query {
//     Viewer {
//         favourites {
//             anime {
//                 nodes {
//                     title {
//                         native
//                         english
//                         romaji
//                     }
//                 }
//             }
//         }
//         about
//         id
//     }
// }
// `

//     // Define our query variables and values that will be used in the query request
//     var variables = {
//     }

//     // Define the config we'll need for our Api request
//     var url = "https://graphql.anilist.co",
//       options = {
//         method: "POST",
//         headers: {
//           Authorization: "Bearer " + token,
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//         body: JSON.stringify({
//           query: query,
//           variables: variables,
//         }),
//       }

//     // Make the HTTP Api request
//     fetch(url, options).then(handleResponse).then(handleData).catch(handleError)

//     function handleResponse(response) {
//       return response.json().then(function (json) {
//         return response.ok ? json : Promise.reject(json)
//       })
//     }

//     function handleData(data) {
//       console.log(data)
//     }

//     function handleError(error) {
//       alert("Error, check console")
//       console.error(error)
//     }
//   }
// )
