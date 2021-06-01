import "./index.scss"
import 'normalize.css'

const bg = document.querySelector(".bg")
const time = document.querySelector(".time")
const attrSource = document.querySelector(".attr-source")
const date = document.querySelector(".date")

function decodeHtml(html) {
  let txt = document.createElement("textarea")
  txt.innerHTML = html
  return txt.value
}

;(function update() {
  time.textContent = new Date().toLocaleTimeString()

  setTimeout(update, 1000)
})()

;(function update() {
  const now = new Date()
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  )

  date.textContent = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  })

  setTimeout(update, tomorrow - now)
})()

bg.addEventListener(
  "load",
  () => {
    bg.classList.add("load")
  },
  false
)

const query = new URLSearchParams({
  q: 'flair:"Desktop"',
  count: '5',
  sort: "new",
  t: "month",
  show: 'all',
  restrict_sr: 1,
})

fetch(`https://www.reddit.com/r/Animewallpaper/search.json?${query}`)
  .then((res) => {
    console.log(res)
    return res.json()
  })
  .then((data) => {
    const posts = data.data.children
    console.log(posts)

    let post

    do {
      post = posts[Math.floor(Math.random() * posts.length)].data
    } while (post && !post.url.includes("i.redd.it"))

    const img = post.preview.images[0].resolutions.pop()
    const title = decodeHtml(post.title)

    console.log(img)

    bg.src = decodeHtml(img.url)
    attrSource.textContent = attrSource.href = `https://redd.it/${post.id}`
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
