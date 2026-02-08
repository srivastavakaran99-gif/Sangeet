// Global variables
let songs = []; 
let audio = new Audio();


const libraryUL = document.getElementById("library");
async function loadSongs() {
  try {
    const res = await fetch("./song.json");
    if (!res.ok) throw new Error("Song load failed");

    songs = await res.json();

    // ================= LIBRARY Song List=================
    libraryUL.innerHTML = "";

    songs.forEach(song => {
      const li = document.createElement("li");
      li.dataset.id = song.id;

      li.innerHTML = `
        <img class="invert" src="music.svg">
        <div class="info">
          <div>${song.title}</div>
          <div>${song.artist}</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="play.svg">
        </div>
      `;

      libraryUL.appendChild(li);
    });

    // =================Songs CARDS in Card Container =================
    renderCards();

  } catch (err) {
    console.error(err);
  }
}
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

//----------------------------------------
//===========================[ SONG CARD CONATINER]===========================

const cardContainer = document.querySelector(".cardContainer");
function renderCards() {
  cardContainer.innerHTML = "";

  songs.forEach(song => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${song.cover}" alt="${song.title}">
      <button class="play-btn" data-id="${song.id}">
        <svg viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"></path>
        </svg>
      </button>
      <h3>${song.title}</h3>
      <p>${song.artist}</p>
    `;

    cardContainer.appendChild(card);
  });
}
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

//=================[Seekbar Circle ko Drag krwana]==============
// ================= HELPER FUNCTION =================

let isDragging = false;

// ================= HELPER =================
function seekTo(clientX) {
  const rect = seekbar.getBoundingClientRect();
  let x = clientX - rect.left;

  if (x < 0) x = 0;
  if (x > rect.width) x = rect.width;

  const percent = x / rect.width;
  circle.style.left = percent * 100 + "%";

  if (audio.duration) {
    audio.currentTime = percent * audio.duration;
  }
}

// ================= DESKTOP =================
circle.addEventListener("mousedown", (e) => {
  isDragging = true;
  e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  seekTo(e.clientX);
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

// ================= MOBILE (TOUCH) =================
circle.addEventListener("touchstart", (e) => {
  isDragging = true;
  e.preventDefault();
});

document.addEventListener("touchmove", (e) => {
  if (!isDragging) return;
  seekTo(e.touches[0].clientX);
});

document.addEventListener("touchend", () => {
  isDragging = false;
});

// ================= TAP ON SEEKBAR (MOBILE + DESKTOP) =================
seekbar.addEventListener("click", (e) => {
  seekTo(e.clientX);
});

seekbar.addEventListener("touchstart", (e) => {
  seekTo(e.touches[0].clientX);
});

// ================= AUTO UPDATE =================
audio.addEventListener("timeupdate", () => {
  if (!audio.duration || isDragging) return;

  const percent = (audio.currentTime / audio.duration) * 100;
  circle.style.left = percent + "%";
  currentTimeEl.innerText = formatTime(audio.currentTime);
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


//=============================[Login/signup ]=========================================
// ===================== ELEMENTS =====================
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const modal = document.getElementById("authModal");
const title = document.getElementById("authTitle");
const submitBtn = document.getElementById("submitAuth");
const errorBox = document.getElementById("authError");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const usernameEl = document.getElementById("username");

const logoutBtn = document.getElementById("logoutBtn");


let mode = "login"; // login | signup

// ===================== OPEN MODAL =====================
signupBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
  title.innerText = "Sign Up";
  nameInput.style.display = "block";
  mode = "signup";
});

loginBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
  title.innerText = "Login";
  nameInput.style.display = "none";
  mode = "login";
});

// ===================== SUBMIT =====================
submitBtn.addEventListener("click", () => {
  errorBox.innerText = "";

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  // ---------- SIGNUP ----------
  if (mode === "signup") {
    if (!name || !email || !password) {
      errorBox.innerText = "All fields are required";
      return;
    }

    localStorage.setItem(
      "user",
      JSON.stringify({ name, email, password })
    );

    alert("Signup successful 🎉");
    modal.classList.add("hidden");

    nameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
  }

  // ---------- LOGIN ----------
  if (mode === "login") {
    if (!email || !password) {
      errorBox.innerText = "Email & password required";
      return;
    }

    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (!savedUser) {
      errorBox.innerText = "No user found. Please signup first";
      return;
    }

    if (
      email === savedUser.email &&
      password === savedUser.password
    ) {
      // 🔥 IMPORTANT FIX
      localStorage.setItem(
        "loggedUser",
        JSON.stringify({
          name: savedUser.name,
          email: savedUser.email
        })
      );

      alert("Login successful ✅");
      modal.classList.add("hidden");
      updateHeaderUser();
    } else {
      errorBox.innerText = "Invalid credentials ❌";
    }

    emailInput.value = "";
    passwordInput.value = "";
  }
});

// ===================== HEADER UPDATE =====================
function updateHeaderUser() {
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

  if (loggedUser && loggedUser.name) {
    usernameEl.innerText = `Hi, ${loggedUser.name} 👋`;
    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
  } else {
    usernameEl.innerText = "";
    loginBtn.style.display = "inline-block";
    signupBtn.style.display = "inline-block";
  }
}

// ===================== PAGE LOAD =====================
document.addEventListener("DOMContentLoaded", () => {
  updateHeaderUser();
});
//------------------------------------------------------------------------

//==================Logout===========================
function updateHeaderUser() {
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

  if (loggedUser && loggedUser.name) {
    usernameEl.innerText = `Hi, ${loggedUser.name} 👋`;

    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
    logoutBtn.classList.remove("hidden");
  } else {
    usernameEl.innerText = "";

    loginBtn.style.display = "inline-block";
    signupBtn.style.display = "inline-block";
    logoutBtn.classList.add("hidden");
  }
}
//LOgin Button click logic
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("loggedUser");

  alert("Logged out successfully 👋");

  updateHeaderUser();
});

//================================[Logic ke bina music block]============================================
//STEP 1: EK STRONG GUARD FUNCTION banao
//JS ke top me 

function requireLogin() {
  const user = localStorage.getItem("loggedUser");
  if (!user) {
    alert("Please login to play music 🔒");
    audio.pause();            //  FORCE STOP
    audio.currentTime = 0;    // optional
    return false;
  }
  return true;
}

// STEP 2: playSong() ko FINAL boss banao 

//Sirf yahi se song chalega

function playSong(index) {
  if (!requireLogin()) return;   //  FULL BLOCK

  currentIndex = index;
  const song = songs[index];
  if (!song) return;

  audio.src = song.file;
  audio.play();

  songInfo.innerText = `${song.title} - ${song.artist}`;
}





// STEP 4: togglePlay ko bhi LOCK karo
function togglePlay() {
  if (!requireLogin()) return;

  if (!audio.src) {
    playSong(currentIndex);
    return;
  }

  audio.paused ? audio.play() : audio.pause();
}

// STEP 5: Library click (NO direct play)
document.querySelector(".songlist").addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;

  const index = songs.findIndex(s => s.id == li.dataset.id);
  if (index !== -1) playSong(index);
});

// STEP 6: Card play (NO direct play)
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".play-btn");
  if (!btn) return;

  const index = songs.findIndex(s => s.id == btn.dataset.id);
  if (index !== -1) playSong(index);
});


//=====================[Close button in Signup box]==================
const closeModalBtn = document.querySelector(".close1");

closeModalBtn.addEventListener("click", () => {
  modal.classList.add("hidden");   // popup band
  errorBox.innerText = "";         // error clear

  // optional: inputs clear
  nameInput.value = "";
  emailInput.value = "";
  passwordInput.value = "";
});
//Popup ke bahar click karne par bhi close ho jaye
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});







































