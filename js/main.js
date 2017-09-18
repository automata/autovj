const giphy = new GiphyAPI()

const DEFAULT_BANNER = 'Type what you want to show and press <b>enter</b>. Or <b>?</b> for help'

const MAX_VIDEOS = 25
const RANDOM_QUERIES = [
  'party', 'monsters', 'magic', 'bacon',
  'xfiles', 'breakingbad', 'strangerthings',
  'iwanttobelieve', 'crazy', 'puppies', 'beer',
  'heisenberg', 'explosion', 'hack the planet', 'boom',
  'omg', 'wtf', 'twinpeaks', 'minions'
]

let lastDisplayedIndex = 0
let scheduler
let allVideos = []
let currentVideosCounter = 0
let currentRandomQuery = 0
let playDelay = 500

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
    cont = (cont + 1) % MAX_VIDEOS
    playVideo(cont, 0)
  }, interval)
}

const loadTopVideos = () => {
  currentVideosCounter = 0
  giphy.trending((err, res) => {
    let container = document.getElementById('main')
    let { data } = res
    for (let i=0; i<data.length; i++) {
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
          playVideosEvery(playDelay)
      }, false)
    }
  })
}

const loadVideosAbout = (query) => {
  currentVideosCounter = 0
  giphy.search({
    q: query
  }, (err, res) => {
    let container = document.getElementById('main')
    let { data } = res
    for (let i=0; i<data.length; i++) {
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
          playVideosEvery(playDelay)
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

let menuOpen = false

const toggleMenu = () => {
  if (menuOpen) {
    document.getElementById("menu").style.height = "0"
    document.getElementById("cmd").blur()
  } else {
    document.getElementById("menu").style.height = "50px"
    document.getElementById("cmd").focus()
  }
  menuOpen = !menuOpen
}

// Keyboard handling
keyboardJS.bind('command + .', (e) => {
  toggleMenu()
})

const setBanner = (msg) => {
  const banner = document.getElementById('banner')
  banner.innerHTML = msg
}

let lastCommand
let lastSearch

window.onload = () => {
  // setTimeout(loadTopVideos, 5000)
  loadTopVideos()

  const node = document.getElementById("cmd")
  setBanner(DEFAULT_BANNER)

  node.addEventListener('keydown', (event) => {
    document.getElementById('loading').style.display = 'none'
    if (!lastCommand)
      setBanner(DEFAULT_BANNER)
    // If we are reading the first letter of input
    if (node.value.length == 0) {
      if (event.key === "t") {
        lastCommand = 't'
        setBanner('Press <b>enter</b> to show trending GIFs')
      } else if (event.key === 'd') {
        lastCommand = 'd'
        setBanner('Type delay time between GIFs (in ms) and press <b>enter</b>')
      } else if (event.key === "?" || event.key === 'h') {
        lastCommand = '?'
        setBanner('Type <b>t</b> for trending GIF; <b>d</b> to set delay')
      } else {
        setBanner(DEFAULT_BANNER)
      }
    }

    if (event.key === "Enter") {
      if (lastCommand === 't') {
        lastCommand = null
        loadTopVideos()
      } else if (lastCommand === '?') {
        lastCommand = null
      } else if (lastCommand === 'd') {
        lastCommand = null
        playDelay = parseInt(node.value.match(/\d+/)[0])
        if (lastSearch)
          loadVideosAbout(lastSearch)
        else
          loadTopVideos()
      } else {
        loadVideosAbout(node.value)
        lastSearch = node.value
      }
      node.value = ''
      setBanner(DEFAULT_BANNER)
      toggleMenu()
    }
  })
}
