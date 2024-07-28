import AudioRecorder from "./core/AudioRecorder.js";
import VideoRecorder from "./core/VideoRecorder.js";

const startBtn = document.querySelector("#audioStartBtn");
const stopBtn = document.querySelector("#audioStopBtn");
const audioPlayback = document.querySelector("#audioPlayback");
const startVideoRecordingBtn = document.querySelector("#videoStartBtn");
const stopVideoRecordingBtn = document.querySelector("#videoStopBtn");
const toggleMediaSectionBtn = document.querySelector(".toggleMediaSectionBtn");
const recordAudioSection = document.querySelector("#audioSection");
const recordVideoSection = document.querySelector("#videoSection");
const imageUploadInput = document.getElementById("imageUpload");
const audioRecorder = new AudioRecorder(audioPlayback);
const videoRecorder = new VideoRecorder(
  "canvas",
  "recordedVideo",
  "imageUpload"
);

function toggleMediaSection() {
  if (recordAudioSection.classList.contains("hidden")) {
    recordAudioSection.classList.remove("hidden");
    recordVideoSection.classList.add("hidden");
    toggleMediaSectionBtn.innerHTML = "Record Video";
  } else {
    recordAudioSection.classList.add("hidden");
    recordVideoSection.classList.remove("hidden");
    toggleMediaSectionBtn.innerHTML = "Record Audio";
  }
}
toggleMediaSectionBtn.addEventListener("click", toggleMediaSection);

startBtn.addEventListener("click", async () => {
  startBtn.disabled = true;
  try {
    audioPlayback.src = "";
    await audioRecorder.start();
  } catch (err) {
    console.error("Failed to start recording", err);
  }
});

stopBtn.addEventListener("click", () => {
  startBtn.disabled = false;
  audioRecorder
    .stop()
    .then((audioBlob) => {
      let audioUrl = window.URL.createObjectURL(audioBlob);
      audioPlayback.src = audioUrl;
    })
    .catch((err) => {
      console.error("Failed to stop recording", err);
    });
});

startVideoRecordingBtn.addEventListener("click", () => {
  startVideoRecordingBtn.disabled = true;
  videoRecorder.startRecording();
});

stopVideoRecordingBtn.addEventListener("click", () => {
  startVideoRecordingBtn.disabled = false;
  videoRecorder.stopRecording();
});

imageUploadInput.addEventListener("change", (event) => {
  videoRecorder.handleImageUpload(event);
});
