import AudioRecorder from "./core/AudioRecorder.js";
import VideoRecorder from "./core/VideoRecorder.js";
import processImageUpload from "./utils/processImageUpload.js";

const startAudioRecordingBtn = document.querySelector("#audioStartBtn");
const stopAudioRecordingBtn = document.querySelector("#audioStopBtn");
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

const audioRecorder = new AudioRecorder(audioPlayback);
const videoRecorder = new VideoRecorder(
  canvas,
  videoElement,
  imageInputElement
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

startAudioRecordingBtn.addEventListener("click", async () => {
  startAudioRecordingBtn.disabled = true;
  stopAudioRecordingBtn.disabled = false;
  audioPlayback.src = "";
  audioRecorder.startRecording();
});

stopAudioRecordingBtn.addEventListener("click", () => {
  startAudioRecordingBtn.disabled = false;
  stopAudioRecordingBtn.disabled = true;
  audioRecorder.stopRecording();
});

startVideoRecordingBtn.addEventListener("click", () => {
  startVideoRecordingBtn.disabled = true;
  stopVideoRecordingBtn.disabled = false;
  fileUploadButton.classList.remove("hidden");
  videoRecorder.startRecording();
});

stopVideoRecordingBtn.addEventListener("click", () => {
  fileUploadButton.classList.add("hidden");
  stopVideoRecordingBtn.disabled = true;
  startVideoRecordingBtn.disabled = false;
  videoRecorder.stopRecording();
});

imageUploadInput.addEventListener("change", (event) => {
  processImageUpload(event, videoRecorder);
});
