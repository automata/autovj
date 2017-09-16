const giphy = new GiphyAPI()

const MAX_VIDEOS = 25
const RANDOM_QUERIES = [
  'party', 'monsters', 'magic', 'bacon',
  'xfiles', 'breakingbad', 'strangerthings',
  'iwanttobelieve', 'crazy', 'puppies', 'beer'
]

let lastDisplayedIndex = 0
let scheduler
let allVideos = []
let currentVideosCounter = 0
let currentRandomQuery = 0

const playVideo = (index, time) => {
  let lastVideoDisplayed = document.getElementById('video' + lastDisplayedIndex)
  if (lastVideoDisplayed) {
    lastVideoDisplayed.style.display = 'none'
    lastDisplayedIndex = index
  }

  let video = document.getElementById('video' + index)
  if (video) {
    video.style.display = 'block'
    video.currentTime = time
  }
}

const playVideosEvery = (interval) => {
  let cont = -1
  // First clear all previous setIntervals
  clearInterval(scheduler)
  scheduler = setInterval(() => {
    cont = (cont + 1) % 25
    playVideo(cont, 0)
  }, interval)
}

const loadVideosAbout = (query) => {
  // First remove all children from container (previous videos)
  // let container = document.getElementById('main')
  // while (container.firstChild)
  //   container.removeChild(container.firstChild)
  // And reset the global video counter
  currentVideosCounter = 0
  giphy.search({
    q: query
  }, (err, res) => {
    console.log('Loaded GIFs', res)
    let container = document.getElementById('main')
    let { data } = res
    for (let i=0; i<data.length; i++) {
      // let img = document.createElement('img')
      // img.src = data[i].images.downsized.url
      // container.appendChild(img)
      let video = document.createElement('video')
      video.setAttribute('class', 'video')
      video.src = data[i].images.downsized_small.mp4
      video.controls = false
      video.autoplay = true
      video.loop = true
      container.appendChild(video)
      video.addEventListener('loadeddata', () => {
        currentVideosCounter += 1
        let oldVideo = document.getElementById('video' + i)
        if (oldVideo) {
          let parentNode = oldVideo.parentNode
          parentNode.removeChild(oldVideo)
        }
        video.setAttribute('id', 'video' + i)
        if (currentVideosCounter >= MAX_VIDEOS)
          playVideosEvery(500)
      }, false)
    }
  })
}

const playRandomQueries = () => {
  setInterval(() => {
    currentRandomQuery = (currentRandomQuery + 1) % RANDOM_QUERIES.length
    console.log(RANDOM_QUERIES[currentRandomQuery])
    loadVideosAbout(RANDOM_QUERIES[currentRandomQuery])
  }, 10000)
}

window.onload = () => {
  playRandomQueries()
}
