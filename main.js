// DARK/LIGHT MODE TOGGLE
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  document.body.classList.toggle("dark");
  showToast("Theme toggled!");
});

// TOAST FUNCTION
function showToast(message) {
  let toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 3000);
}

// CHAT MESSAGES
const messagesEl = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;
  appendMessage("You: " + text);
  messageInput.value = "";
  showToast("Message sent");
  // TODO: send via WebRTC data channel
}

function appendMessage(msg) {
  const msgEl = document.createElement("div");
  msgEl.innerText = msg;
  messagesEl.appendChild(msgEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// VIDEO / VOICE SETUP
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const videoCallBtn = document.getElementById("videoCallBtn");
const voiceCallBtn = document.getElementById("voiceCallBtn");
const endCallBtn = document.getElementById("endCallBtn");

let localStream;
let peerConnection;
const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

// GET USER MEDIA
async function startLocalStream(video = true, audio = true) {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video, audio });
    localVideo.srcObject = localStream;
  } catch (err) {
    showToast("Cannot access camera/mic: " + err.message);
  }
}

// BASIC WEBRTC PEER CONNECTION (without signaling)
function initPeerConnection() {
  peerConnection = new RTCPeerConnection(config);

  if (localStream) {
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
  }

  peerConnection.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("ICE Candidate:", event.candidate);
      // TODO: send candidate to remote peer via signaling
    }
  };
}

// BUTTON ACTIONS
videoCallBtn.addEventListener("click", async () => {
  await startLocalStream(true, true);
  initPeerConnection();
  showToast("Video call ready (needs signaling to connect)");
});

voiceCallBtn.addEventListener("click", async () => {
  await startLocalStream(false, true);
  initPeerConnection();
  showToast("Voice call ready (needs signaling to connect)");
});

endCallBtn.addEventListener("click", () => {
  if (peerConnection) peerConnection.close();
  peerConnection = null;
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localVideo.srcObject = null;
  }
  remoteVideo.srcObject = null;
  showToast("Call ended");
});
