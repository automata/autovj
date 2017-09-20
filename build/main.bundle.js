'use strict';

var giphy = new GiphyAPI('4j0wjZpgM62bUjK05smgdgb76PKZoktd');

var DEFAULT_BANNER = 'Type what you want to show and press <b>enter</b> or <b>?</b> for help';

var MAX_VIDEOS = 25;
var RANDOM_QUERIES = ['party', 'monsters', 'magic', 'bacon', 'xfiles', 'breakingbad', 'strangerthings', 'iwanttobelieve', 'crazy', 'puppies', 'beer', 'heisenberg', 'explosion', 'hack the planet', 'boom', 'omg', 'wtf', 'twinpeaks', 'minions'];

var lastDisplayedIndex = 0;
var scheduler = void 0;
var allVideos = [];
var currentVideosCounter = 0;
var currentRandomQuery = 0;
var playDelay = 500;
var maxVideos = MAX_VIDEOS;

var playVideo = function playVideo(index, time) {
  var lastVideoDisplayed = document.getElementById('video' + lastDisplayedIndex);
  if (lastVideoDisplayed) {
    lastVideoDisplayed.style.display = 'none';
    lastDisplayedIndex = index;
  }

  var video = document.getElementById('video' + index);
  if (video) {
    video.style.display = 'block';
    video.currentTime = time;
  }
};

var playVideosEvery = function playVideosEvery(interval) {
  var cont = -1;
  // First clear all previous setIntervals
  clearInterval(scheduler);
  scheduler = setInterval(function () {
    cont = (cont + 1) % maxVideos;
    playVideo(cont, 0);
  }, interval);
};

var loadTopVideos = function loadTopVideos() {
  currentVideosCounter = 0;
  maxVideos = MAX_VIDEOS;
  giphy.trending(function (err, res) {
    if (err) {
      console.log('Error', err);
      return;
    }
    var container = document.getElementById('main');
    var data = res.data;

    var _loop = function _loop(i) {
      if (!data[i].images.downsized_small) {
        // Failed to load MP4 for some GIF, should expect less videos
        maxVideos -= 1;
        return 'continue';
      }
      if (!data[i].images.downsized_small.mp4) {
        // Failed to load MP4 for some GIF, should expect less videos
        maxVideos -= 1;
        return 'continue';
      }

      var video = document.createElement('video');
      video.setAttribute('class', 'video');
      video.src = data[i].images.downsized_small.mp4;
      video.controls = false;
      video.autoplay = true;
      video.loop = true;
      container.appendChild(video);
      video.addEventListener('loadeddata', function () {
        currentVideosCounter += 1;
        var oldVideo = document.getElementById('video' + i);
        if (oldVideo) {
          var parentNode = oldVideo.parentNode;
          parentNode.removeChild(oldVideo);
        }
        video.setAttribute('id', 'video' + i);
        if (currentVideosCounter >= maxVideos) playVideosEvery(playDelay);
      }, false);
    };

    for (var i = 0; i < data.length; i++) {
      var _ret = _loop(i);

      if (_ret === 'continue') continue;
    }
  });
};

var loadVideosAbout = function loadVideosAbout(query) {
  currentVideosCounter = 0;
  // Initially we expect a default max of videos but if something goes wrong it
  // can change
  maxVideos = MAX_VIDEOS;
  giphy.search({
    q: query
  }, function (err, res) {
    if (err) {
      console.log('Error', err);
      return;
    }
    var container = document.getElementById('main');
    var data = res.data;

    var _loop2 = function _loop2(i) {
      if (!data[i].images.downsized_small) {
        // Failed to load MP4 for some GIF, should expect less videos
        maxVideos -= 1;
        return 'continue';
      }
      if (!data[i].images.downsized_small.mp4) {
        // Failed to load MP4 for some GIF, should expect less videos
        maxVideos -= 1;
        return 'continue';
      }

      var video = document.createElement('video');
      video.setAttribute('class', 'video');
      video.src = data[i].images.downsized_small.mp4;
      video.controls = false;
      video.autoplay = true;
      video.loop = true;
      container.appendChild(video);
      video.addEventListener('loadeddata', function () {
        currentVideosCounter += 1;
        var oldVideo = document.getElementById('video' + i);
        if (oldVideo) {
          var parentNode = oldVideo.parentNode;
          parentNode.removeChild(oldVideo);
        }
        video.setAttribute('id', 'video' + i);
        if (currentVideosCounter >= maxVideos) playVideosEvery(playDelay);
      }, false);
    };

    for (var i = 0; i < data.length; i++) {
      var _ret2 = _loop2(i);

      if (_ret2 === 'continue') continue;
    }
  });
};

var playRandomQueries = function playRandomQueries() {
  setInterval(function () {
    currentRandomQuery = (currentRandomQuery + 1) % RANDOM_QUERIES.length;
    console.log(RANDOM_QUERIES[currentRandomQuery]);
    loadVideosAbout(RANDOM_QUERIES[currentRandomQuery]);
  }, 10000);
};

var menuOpen = false;

var toggleMenu = function toggleMenu() {
  if (menuOpen) {
    document.getElementById("menu").style.height = "0";
    document.getElementById("cmd").blur();
  } else {
    document.getElementById("menu").style.height = "50px";
    document.getElementById("cmd").focus();
  }
  menuOpen = !menuOpen;
};

// Keyboard handling
keyboardJS.bind('command + .', function (e) {
  toggleMenu();
});

var setBanner = function setBanner(msg) {
  var banner = document.getElementById('banner');
  banner.innerHTML = msg;
};

var lastCommand = void 0;
var lastSearch = void 0;

window.onload = function () {
  // setTimeout(loadTopVideos, 5000)
  loadTopVideos();

  var node = document.getElementById("cmd");
  setBanner(DEFAULT_BANNER);

  node.addEventListener('keydown', function (event) {
    document.getElementById('loading').style.display = 'none';
    if (!lastCommand) setBanner(DEFAULT_BANNER);
    // If we are reading the first letter of input
    if (node.value.length == 0) {
      if (event.key === "t") {
        lastCommand = 't';
        setBanner('Press <b>enter</b> to show trending GIFs');
      } else if (event.key === 'd') {
        lastCommand = 'd';
        setBanner('Type delay time between GIFs (in ms) and press <b>enter</b>');
      } else if (event.key === "?" || event.key === 'h') {
        lastCommand = '?';
        setBanner('Type <b>t</b> for trending GIF; <b>d</b> to set delay');
      } else {
        setBanner(DEFAULT_BANNER);
      }
    }

    if (event.key === "Enter") {
      if (lastCommand === 't') {
        lastCommand = null;
        loadTopVideos();
      } else if (lastCommand === '?') {
        lastCommand = null;
      } else if (lastCommand === 'd') {
        lastCommand = null;
        playDelay = parseInt(node.value.match(/\d+/)[0]);
        if (lastSearch) loadVideosAbout(lastSearch);else loadTopVideos();
      } else {
        loadVideosAbout(node.value);
        lastSearch = node.value;
      }
      node.value = '';
      setBanner(DEFAULT_BANNER);
      toggleMenu();
    }
  });
};
