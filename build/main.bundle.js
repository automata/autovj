'use strict';

var giphy = new GiphyAPI();

var MAX_VIDEOS = 25;
var RANDOM_QUERIES = ['party', 'monsters', 'magic', 'bacon', 'xfiles', 'breakingbad', 'strangerthings', 'iwanttobelieve', 'crazy', 'puppies', 'beer', 'heisenberg', 'explosion', 'hack the planet', 'boom', 'omg', 'wtf', 'twinpeaks', 'minions'];

var lastDisplayedIndex = 0;
var scheduler = void 0;
var allVideos = [];
var currentVideosCounter = 0;
var currentRandomQuery = 0;

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
    cont = (cont + 1) % 25;
    playVideo(cont, 0);
  }, interval);
};

var loadTopVideos = function loadTopVideos() {
  currentVideosCounter = 0;
  giphy.trending(function (err, res) {
    var container = document.getElementById('main');
    var data = res.data;

    var _loop = function _loop(i) {
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
        if (currentVideosCounter >= MAX_VIDEOS) playVideosEvery(500);
      }, false);
    };

    for (var i = 0; i < data.length; i++) {
      _loop(i);
    }
  });
};

var loadVideosAbout = function loadVideosAbout(query) {
  currentVideosCounter = 0;
  giphy.search({
    q: query
  }, function (err, res) {
    var container = document.getElementById('main');
    var data = res.data;

    var _loop2 = function _loop2(i) {
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
        if (currentVideosCounter >= MAX_VIDEOS) playVideosEvery(500);
      }, false);
    };

    for (var i = 0; i < data.length; i++) {
      _loop2(i);
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

window.onload = function () {
  // setTimeout(loadTopVideos, 5000)
  loadTopVideos();

  var node = document.getElementById("cmd");
  node.addEventListener('keydown', function (event) {
    document.getElementById('loading').style.display = 'none';
    if (event.key === "Enter") {
      console.log(node.value);
      loadVideosAbout(node.value);
      node.value = '';
      toggleMenu();
    }
  });
};
