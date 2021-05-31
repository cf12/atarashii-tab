const bg = document.querySelector('.bg')

bg.addEventListener('load', () => {
  bg.classList.add('load')
}, false)


const query = new URLSearchParams({
  q: 'flair:"Desktop"',
  restrict_sr: 1
})

fetch(`https://www.reddit.com/r/Animewallpaper/search.json?${query}`)
  .then(res => res.json())
  .then(data => {
    const posts = data.data.children

    let post

    do {
      post = posts[Math.floor(Math.random() * posts.length)].data
      console.log(post.url)
    } while (post && !post.url.includes('i.redd.it'))

    bg.src = post.url
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
