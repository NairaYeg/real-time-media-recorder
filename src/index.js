import AudioRecorder from "./core/AudioRecorder.js";
import VideoRecorder from "./core/VideoRecorder.js";
import processImageUpload from "./utils/processImageUpload.js";

const startBtn = document.querySelector("#audioStartBtn");
const stopBtn = document.querySelector("#audioStopBtn");
const audioPlayback = document.querySelector("#audioPlayback");
const startVideoRecordingBtn = document.querySelector("#videoStartBtn");
const stopVideoRecordingBtn = document.querySelector("#videoStopBtn");
const toggleMediaSectionBtn = document.querySelector(".toggleMediaSectionBtn");
const recordAudioSection = document.querySelector("#audioSection");
const recordVideoSection = document.querySelector("#videoSection");
const imageUploadInput = document.getElementById("imageUpload");
const canvas = document.getElementById("canvas");
const videoElement = document.getElementById("recordedVideo");
const imageInputElement = document.getElementById("imageUpload");
const fileUploadButton = document.querySelector(".fileUploadButton");

const videoRecorder = new VideoRecorder(
  canvas,
  videoElement,
  imageInputElement
);

const audioRecorder = new AudioRecorder(audioPlayback);

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
      //TODO: Refactore the then block to a separate function
      let audioUrl = window.URL.createObjectURL(audioBlob);
      audioPlayback.src = audioUrl;
    })
    .catch((err) => {
      console.error("Failed to stop recording", err);
    });
});

startVideoRecordingBtn.addEventListener("click", () => {
  startVideoRecordingBtn.disabled = true;
  fileUploadButton.classList.remove("hidden");
  videoRecorder.startRecording();
});

stopVideoRecordingBtn.addEventListener("click", () => {
  fileUploadButton.classList.add("hidden");
  startVideoRecordingBtn.disabled = false;
  videoRecorder.stopRecording();
});

imageUploadInput.addEventListener("change", (event) => {
  processImageUpload(event, videoRecorder);
});
