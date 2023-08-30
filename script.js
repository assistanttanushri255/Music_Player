let play_list = document.querySelectorAll('.play-list source'),
    track_card = document.querySelector('.track'),
    now_playing = document.querySelector('.now-playing'),
    track_img = document.querySelector('.track-img'),
    track_name = document.querySelector('.track-name'),
    track_artist = document.querySelector('.track-artist');

let playpause_btn = document.querySelector('.playpause-track'),
    next_btn = document.querySelector('.next-track'),
    prev_btn = document.querySelector('.prev-track');

let seek = document.querySelector('.seek-slider'),
    seek_slider = document.querySelector('.seek-slider .slider'),
    volume_slider = document.querySelector('.volume-slider'),
    curr_time = document.querySelector('.current-time'),
    total_duration = document.querySelector('.duration'),
    wave = document.getElementById('wave'),
    waves = document.querySelectorAll('#wave span'),
    randomIcon = document.querySelector('.random-track'),
    repeatIcon = document.querySelector('.repeat-track'),
    curr_track = document.createElement('audio');

let track_index = 0,
    isPlaying = false,
    isRandom = false,
    updateTimer,
    music_list = [];

const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
});
for (let i = 0; i < play_list.length; i++) {
    const track_info = play_list[i],
        track_img = track_info.getAttribute('data-image'),
        track_name = track_info.getAttribute('data-name'),
        track_artist = track_info.getAttribute('data-artist'),
        track_source = track_info.src;

    let info = {
        img: track_img,
        name: track_name,
        artist: track_artist,
        music: track_source
    }
    music_list.push(info)
}
function formatDuration(time) {
    if (isNaN(time)) {
        time = 0;
    }
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60) % 60;
    const hours = Math.floor(time / 3600);
    if (hours === 0) {
        return `${minutes}:${leadingZeroFormatter.format(seconds)}`;
    } else {
        return `${hours}:${leadingZeroFormatter.format(minutes)}:${leadingZeroFormatter.format(seconds)}`;
    }
}

var init = function () {
    document.addEventListener('touchstart', handler, true);
    document.addEventListener('touchmove', handler, true);
    document.addEventListener('touchend', handler, true);
    document.addEventListener('touchcancel', handler, true);
};
var handler = function touch(event) {
    var touch = event.changedTouches[0],
        simulatedEvent = document.createEvent('MouseEvent');

    simulatedEvent.initMouseEvent(
        { touchstart: 'mousedown', touchmove: 'mousemove', touchend: 'mouseup' }[event.type],
        true, true, window, 1,
        touch.screenX, touch.screenY, touch.clientX, touch.clientY,
        false, false, false, false, 0, null);

    touch.target.dispatchEvent(simulatedEvent);
};

loadTrack(track_index);

function loadTrack(track_index) {
    clearInterval(updateTimer);
    reset();
    curr_track.autoplay;
    curr_track.src = music_list[track_index].music;
    curr_track.load();

    track_img.querySelector('img').src = music_list[track_index].img;
    track_name.textContent = music_list[track_index].name;
    track_artist.textContent = music_list[track_index].artist;
    now_playing.textContent = "Playing music " + (track_index + 1) + " of " + music_list.length;

    curr_track.addEventListener("play", playTrack)
    curr_track.addEventListener("timeupdate", setUpdate)
    curr_track.addEventListener('ended', nextTrack);
    random_bg_color();
}
curr_track.addEventListener("pause", pauseTrack)
curr_track.addEventListener("waiting", () => {
    playpause_btn.classList.add("pending");
})
curr_track.addEventListener("canplay", () => {
    playpause_btn.classList.remove("pending");
})

function random_bg_color() {
    let hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e'];

    function populate(a) {
        for (let i = 0; i < 6; i++) {
            let x = Math.round(Math.random() * 14);
            let y = hex[x];
            a += y;
        }
        return a;
    }
    for (let i = 0; i < waves.length; i++) {
        let span = waves[i];
        span.style.background = populate('#');
    }
    let Color1 = populate('#');
    let Color2 = populate('#');

    var angle = 'to right';
    let gradient = 'linear-gradient(' + angle + ',' + Color1 + ', ' + Color2 + ")";
    document.body.style.background = gradient;
}
function reset() {
    curr_track.currentTime = 0
    seek_slider.style.setProperty("--t", '0');
}
function randomTrack() {
    isRandom ? pauseRandom() : playRandom();
}
function playRandom() {
    isRandom = true;
    randomIcon.classList.remove('disabled');
}
function pauseRandom() {
    isRandom = false;
    randomIcon.classList.add('disabled');
}
function repeatTrack() {
    let current_index = track_index;
    loadTrack(current_index);
    playTrack();
}
function playpauseTrack() {
    isPlaying ? pauseTrack() : playTrack();
}
function playTrack() {
    curr_track.play();
    isPlaying = true;
    track_img.querySelector('img').classList.add('rotate');
    wave.classList.add('loader');
    track_card.classList.remove("paused");
}
function pauseTrack() {
    curr_track.pause();
    isPlaying = false;
    track_img.querySelector('img').classList.remove('rotate');
    wave.classList.remove('loader');
    track_card.classList.add("paused");
}
function nextTrack() {
    if (track_index < music_list.length - 1 && isRandom === false) {
        track_index += 1;
    } else if (track_index < music_list.length - 1 && isRandom === true) {
        let random_index = Number.parseInt(Math.random() * music_list.length);
        track_index = random_index;
    } else {
        track_index = 0;
    }
    loadTrack(track_index);
    playTrack();
}
function prevTrack() {
    if (track_index > 0) {
        track_index -= 1;
    } else {
        track_index = music_list.length - 1;
    }
    loadTrack(track_index);
    playTrack();
}
function seekTo(e) {
    let seekto = e.offsetX / seek.clientWidth;
    seek_slider.style.setProperty("--t", (seekto * 100) + '%')
    seek_pos = Math.floor(seekto * curr_track.duration);
    curr_track.currentTime = seek_pos;
}
function setUpdate() {
    let seekPosition = 0;
    if (!isNaN(curr_track.duration)) {
        seekPosition = (curr_track.currentTime / curr_track.duration) * 100;
        seek_slider.style.setProperty("--t", seekPosition + '%')

        let current = formatDuration(curr_track.currentTime);
        let duration = formatDuration(curr_track.duration)

        curr_time.textContent = current;
        total_duration.textContent = duration;
    }
}
function autoScroll(el) {
    let scrollPx;
    setInterval(() => {
        if (el.scrollWidth - el.scrollLeft === el.clientWidth) {
            scrollPx = -1;
        }
        if (el.scrollLeft === 0) {
            scrollPx = 1;
        }
        el.scrollBy(scrollPx, 0);
    }, 90);
}
autoScroll(track_name);
autoScroll(track_artist);

volume_slider.addEventListener("touchstart", init, true);
volume_slider.addEventListener("mousemove",  () => {
    curr_track.volume = volume_slider.value / 100;
});
seek.addEventListener("touchstart", init, true);
seek.addEventListener("click", seekTo);
seek.addEventListener("mousedown", () => {
    seek.addEventListener("mousemove", seekTo)
    document.addEventListener("mouseup", () => {
        seek.removeEventListener("mousemove", seekTo)
    })
})
next_btn.onclick = nextTrack;
prev_btn.onclick = prevTrack;
playpause_btn.onclick = playpauseTrack;
randomIcon.onclick = randomTrack;
repeatIcon.onclick = reset;