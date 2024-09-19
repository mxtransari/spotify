console.log('Let\'s write JavaScript');

let currentSongIndex = 0;
let songs = [];

// Function to fetch the songs from the server
async function getSongs() {
    let a = await fetch("http://127.0.0.1:5500/songs/");
    let response = await a.text();
    console.log(response);

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let fetchedSongs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            fetchedSongs.push(element.href.split("/songs/")[1]);
        }
    }

    return fetchedSongs;
}

// Function to play music and update the UI with song details
const playMusic = (track, songName) => {
    const currentSong = document.getElementById('audio'); // Find the audio element
    if (!currentSong) {
        console.error("Audio element not found!"); // Log error if it's missing
        return;
    }
    console.log("Playing:", track); // Log which song is playing

    currentSong.src = "/songs/" + track; // Set the song source to play
    currentSong.play(); // Play the song

    // Update the song name in the UI
    document.getElementById('song-name').innerText = songName;

    // Update play/pause icon
    document.getElementById('play').src = "./img/pause.svg"; 
};

// Function to play the next song
const playNextSong = () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length; // Loop back to the first song
    const nextSong = songs[currentSongIndex];
    playMusic(nextSong, nextSong.replaceAll("%20", " ")); // Play the next song
};

// Function to play the previous song
const playPreviousSong = () => {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length; // Loop back to the last song if needed
    const prevSong = songs[currentSongIndex];
    playMusic(prevSong, prevSong.replaceAll("%20", " ")); // Play the previous song
};

// Main function to fetch songs and create the song list
async function main() {
    songs = await getSongs(); // Get the list of all the songs
    console.log(songs);

    let songUL = document.querySelector(".songList ul");
    for (const song of songs) {
        songUL.innerHTML += `
            <li>
                <img class="invert" src="./img/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Honey Singh</div>
                </div>
                <img class="invert" src="./img/play.svg" alt="">
            </li>`;
    }

    // Add event listeners to the song list items
    Array.from(document.querySelectorAll(".songList li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            let songName = e.querySelector(".info div:first-child").textContent.trim();
            currentSongIndex = index; // Set the current song index when a song is clicked
            playMusic(songName, songName);  // Ensure the song name is passed to playMusic
        });
    });
}

// Play and pause functionality for the playbar
const audio = document.getElementById('audio');
const playPauseBtn = document.getElementById('play');
const seekbar = document.getElementById('seekbar');
const currentTimeEl = document.getElementById('current-time');
const totalDurationEl = document.getElementById('total-duration');

// Toggle play and pause
playPauseBtn.addEventListener("click", () => {
    if (audio.paused) {
        audio.play();
        playPauseBtn.src = "./img/pause.svg";
    } else {
        audio.pause();
        playPauseBtn.src = "./img/play.svg";
    }
});

// Update seek bar as the song progresses
audio.ontimeupdate = () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    seekbar.value = progress;

    // Update current time display
    let minutes = Math.floor(audio.currentTime / 60);
    let seconds = Math.floor(audio.currentTime % 60);
    if (seconds < 10) seconds = "0" + seconds;
    currentTimeEl.textContent = minutes + ":" + seconds;
};

// Seek song position when the user interacts with seek bar
seekbar.addEventListener('input', () => {
    const seekTo = (seekbar.value / 100) * audio.duration;
    audio.currentTime = seekTo;
});

// Update total duration when the song loads
audio.onloadedmetadata = () => {
    let minutes = Math.floor(audio.duration / 60);
    let seconds = Math.floor(audio.duration % 60);
    if (seconds < 10) seconds = "0" + seconds;
    totalDurationEl.textContent = minutes + ":" + seconds;
};

// Change volume using the volume slider
const volumeSlider = document.getElementById('volume');
volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

// Add event listeners for Next and Previous buttons
const nextButton = document.getElementById('next');
const previousButton = document.getElementById('previous');

nextButton.addEventListener('click', playNextSong);
previousButton.addEventListener('click', playPreviousSong);

// Call the main function to load songs and set up event listeners
main();
