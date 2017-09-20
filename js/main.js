const giphy = new GiphyAPI('4j0wjZpgM62bUjK05smgdgb76PKZoktd')

const DEFAULT_BANNER = 'Type what you want to show and press <b>enter</b> or <b>?</b> for help'

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
let maxVideos = MAX_VIDEOS

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
    cont = (cont + 1) % maxVideos
    playVideo(cont, 0)
  }, interval)
}

const loadTopVideos = () => {
  currentVideosCounter = 0
  maxVideos = MAX_VIDEOS
  giphy.trending((err, res) => {
    if (err) {
      console.log('Error', err)
      return
    }
    let container = document.getElementById('main')
    let { data } = res
    for (let i=0; i<data.length; i++) {
      if (!data[i].images.downsized_small) {
        // Failed to load MP4 for some GIF, should expect less videos
        maxVideos -= 1
        continue
      }
      if (!data[i].images.downsized_small.mp4) {
        // Failed to load MP4 for some GIF, should expect less videos
        maxVideos -= 1
        continue
      }

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
        if (currentVideosCounter >= maxVideos)
          playVideosEvery(playDelay)
      }, false)
    }
  })
}

const loadVideosAbout = (query) => {
  currentVideosCounter = 0
  // Initially we expect a default max of videos but if something goes wrong it
  // can change
  maxVideos = MAX_VIDEOS
  giphy.search({
    q: query
  }, (err, res) => {
    if (err) {
      console.log('Error', err)
      return
    }
    let container = document.getElementById('main')
    let { data } = res
    for (let i=0; i<data.length; i++) {
      if (!data[i].images.downsized_small) {
        // Failed to load MP4 for some GIF, should expect less videos
        maxVideos -= 1
        continue
      }
      if (!data[i].images.downsized_small.mp4) {
        // Failed to load MP4 for some GIF, should expect less videos
        maxVideos -= 1
        continue
      }

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
        if (currentVideosCounter >= maxVideos)
          playVideosEvery(playDelay)
      }, false)
    }
  })
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
  // Load trending GIFs by default
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
