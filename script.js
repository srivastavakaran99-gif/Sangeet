// Global variables
let songs = []; 
let audio = new Audio();


// Async function to fetch songs
async function loadSongs() {
  try {
    const res = await fetch("http://127.0.0.1:3000/song.json");
    
    if (!res.ok) { //taki error console me dekhe
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json(); //
    songs = data;  // 🔥 store in global variable
    console.log("API se data aaya:", songs);

    let songlist = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songlist.innerHTML = ""; // clear first
    for(const music of songs){
        songlist.innerHTML +=  `<li data-id="${music.id}">
                                <img class="invert" src="music.svg" alt=""> 
                          <div class="info">
                          <div>${music.title}</div>
                          <div>${music.artist}</div>
                          </div>
                          <div class="playnow">
                          <span>Play Now</span>
                          <img class="invert" src="play.svg" alt="">
                          </div>
                          </li>`
                        }

                    
                      } 
  catch (err) {
  console.log("Error:", err);
  }
}
  

// Call the async function
loadSongs();
  
//=========================================================================================================================================
 
//library ke songs ko click krne par song ka play hona aur playbar me song k details show hona----
document.querySelector(".songlist").addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;

  const id = li.dataset.id;
  const song = songs.find(s => s.id == id);

  if (!song) return;
  audio.src = song.file;
  audio.play();  

  // playbar me info show
  document.querySelector(".songinfo").innerText =
    `${song.title} - ${song.artist}`;

  console.log("Playing from library:", song.title);
}); 
   
//-----------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------
//PHASE_2
//                               [================= PLAYBAR LOGIC (FIXED) =================]

// Globals
let currentIndex = 0;
// ================= PLAYBAR ELEMENTS =================
const songInfo = document.querySelector(".songinfo");
const playBtn  = document.querySelector(".playbtn");
const prevBtn  = document.querySelector(".prev-btn");
const nextBtn  = document.querySelector(".next-btn");

// ================= PLAY SONG =================
function playSong(index) {
  currentIndex = index;
  const song = songs[index];
  if (!song) return;

  audio.src = song.file;
  audio.play();

  songInfo.innerText = `${song.title} - ${song.artist}`;
}

// ================= PLAY / PAUSE =================
function togglePlay() {
  if (!audio.src) {
    playSong(currentIndex);
    return;
  }

  audio.paused ? audio.play() : audio.pause();
}

// ================= PREVIOUS / NEXT =================
function prevSong() {
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  playSong(currentIndex);
}

function nextSong() {
  currentIndex = (currentIndex + 1) % songs.length;
  playSong(currentIndex);
}

// ================= BUTTON EVENTS =================
playBtn.addEventListener("click", togglePlay);
prevBtn.addEventListener("click", prevSong);
nextBtn.addEventListener("click", nextSong);

// ================= ICON CHANGE =================
audio.addEventListener("play", () => {
  playBtn.src = "pause.svg";   // pause icon
});

audio.addEventListener("pause", () => {
  playBtn.src = "play1.svg"; // play icon
});

// ================= LIBRARY CLICK =================
document.querySelector(".songlist").addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;

  const id = li.dataset.id;
  const index = songs.findIndex(s => s.id == id);
  if (index !== -1) {
    playSong(index);
  }
});

// ================= CARD PLAY BUTTON =================
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".play-btn");
  if (!btn) return;

  const id = btn.dataset.id;
  const index = songs.findIndex(s => s.id == id);
  if (index !== -1) {
    playSong(index);
  }
});
// //---------------------------------------------------------------------------------
                                                //[ SEEKBAR KE LIYE KYA KYA CHAHIYE]
                                           // ================= SEEKBAR ELEMENTS =================
const seekbar = document.querySelector(".seekbar");
const circle = document.querySelector(".circle");

// ================= SEEKBAR MOVE WITH SONG =================
audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;  

  const percent = (audio.currentTime / audio.duration) * 100;
  circle.style.left = percent + "%";
});

// ================= CLICK TO SEEK =================
seekbar.addEventListener("click", (e) => {
  const rect = seekbar.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const width = rect.width;

  const newTime = (clickX / width) * audio.duration;
  audio.currentTime = newTime;
});

//===========================================================[Current time and total time update]================================

 const currentTimeEl = document.querySelector(".current-time");
const totalTimeEl = document.querySelector(".total-time");

// seconds → mm:ss
function formatTime(seconds) {
  if (isNaN(seconds)) return "00:00";
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? "0" + sec : sec}`;
}

// jab song load ho → total duration set
audio.addEventListener("loadedmetadata", () => {
  totalTimeEl.innerText = formatTime(audio.duration);
});

// song chalte waqt → current time + total duration ek saath
audio.addEventListener("timeupdate", () => {
  currentTimeEl.innerText = `${formatTime(audio.currentTime)} / `;
});
 
//=============================================[MEDIA QUERY]====================================================
//Hamburger close and open the Left Side
document.querySelector(".hamburger").addEventListener("click",() => {
  document.querySelector(".left").style.left= "0"
})
document.querySelector(".close").addEventListener("click",() => {
  document.querySelector(".left").style.left= "-120%"
})


//=============================[volume button and range seekbar]=======================================================
const volumeRange = document.querySelector(".volume-range");
const volumeIcon = document.querySelector(".volume-icon");
const volumePercent = document.querySelector(".volume-percent");

// ===== Default volume =====
audio.volume = volumeRange.value / 100;

// ===== Slider move → volume change =====
volumeRange.addEventListener("input", () => {
  let value = volumeRange.value;

  audio.volume = value / 100;        // 0–1
  volumePercent.innerText = value + "%";

  // mute icon change
  if (value == 0) {
    volumeIcon.src = "mute.svg";
  } else {
    volumeIcon.src = "volume.svg";
  }
});

// ===== Icon click → mute / unmute =====
volumeIcon.addEventListener("click", () => {

  if (audio.muted) {
    // unmute
    audio.muted = false;
    volumeRange.value = 70;
    audio.volume = 0.7;
    volumePercent.innerText = "70%";
    volumeIcon.src = "volume.svg";
  } else {
    // mute
    audio.muted = true;
    volumeRange.value = 0;
    volumePercent.innerText = "0%";
    volumeIcon.src = "mute.svg";
  }

});

//----------------------------------------















































//----------------------------------------------------------------------------------------------------------
// // Play button click logic
// document.addEventListener("click", (e) => {
//   const btn = e.target.closest(".play-btn");
//   if (!btn) return;

//   const id = btn.dataset.id;   // button me data-id hona chahiye
//   console.log("Clicked ID:", id);

//   const song = songs.find(s => s.id == id);

//   if (song) {
//     audio.src = song.file;
//     audio.play();
//     console.log("Playing:", song.title);
    
//     //Audio duration:-
//     audio.addEventListener("loadeddata",()=>{
//         let duration = audio.duration;
//         console.log("duration:",audio.duration,"currentTime:",audio.currentTime,"currentSrc:",audio.currentSrc);
//     });
// }
//   else {
//     console.log("Song not found for id:", id);
//   }
// });

// // ----- GLOBALS -----
// let currentIndex = 0; // current song index

 
// // Playbar elements
// const songInfo = document.querySelector(".songinfo");
// const playBtn = document.querySelector(".playbtn");   // Play/Pause button
// const prevBtn = document.querySelector(".prev-btn");   // Previous button
// const nextBtn = document.querySelector(".next-btn");   // Next button
  
// // ----- FUNCTION: play song by index -----
// function playSong(index) {
//   currentIndex = index;
//   const song = songs[index];
//   if (!song) return;

//   audio.src = song.file;
//   audio.play();

//   // Update playbar info
//   songInfo.innerText = `${song.title} - ${song.artist}`;

//   // Update play button to "pause"
//   if(playBtn) playBtn.innerText = "⏸";
// }

// // ----- FUNCTION: toggle play/pause -----
// function togglePlay() {
//   if(audio.paused) {
//     audio.play();
//   } else {
//     audio.pause();
//   }
// }

// // ----- FUNCTION: previous song -----
// function prevSong() {
//   let newIndex = (currentIndex - 1 + songs.length) % songs.length;
//   playSong(newIndex);
// }

// // ----- FUNCTION: next song -----
// function nextSong() {
//   let newIndex = (currentIndex + 1) % songs.length;
//   playSong(newIndex);
// }

// // ----- BUTTON EVENT LISTENERS -----
// if(playBtn) playBtn.addEventListener("click", togglePlay);
// if(prevBtn) prevBtn.addEventListener("click", prevSong);
// if(nextBtn) nextBtn.addEventListener("click", nextSong);

// // ----- LIBRARY SONG CLICK -----
// document.querySelector(".songlist").addEventListener("click", (e)=>{
//   const li = e.target.closest("li");
//   if(!li) return;

//   const id = li.dataset.id;
//   const index = songs.findIndex(s => s.id == id);
//   if(index >= 0){
//     playSong(index);  // library click → song play & playbar update
//   }
// });
// //------------------------------------------------------------------
// // Elements
// const playBtn = document.querySelector(".play1"); // play button image in playbar

// function updatePlayBtn(paused){
//     if(!playBtn) return;
//     if(paused){
//         playBtn.src = "play.svg"; // song paused → show play icon
//     } else {
//         playBtn.src = "mute.svg"; // song playing → show pause/mute icon
//     }
// }

// // Toggle play/pause
// function togglePlay(){
//     if(audio.paused){
//         audio.play();
//     } else {
//         audio.pause();
//     }
// }

// // Listen to play/pause events on audio
// audio.addEventListener("play", ()=> updatePlayBtn(false));   // song is playing
// audio.addEventListener("pause", ()=> updatePlayBtn(true));   // song paused



