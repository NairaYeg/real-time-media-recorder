import AudioRecorder from "./core/AudioRecorder.js";
import VideoRecorder from "./core/VideoRecorder.js";
import processImageUpload from "./utils/processImageUpload.js";
import { RECORD_AUDIO_LABEL, RECORD_VIDEO_LABEL } from "./utils/constants.js";

const toggleMediaSectionBtn = document.querySelector(".toggleMediaSectionBtn");
const recordAudioSection = document.querySelector("#audioSection");
const recordVideoSection = document.querySelector("#videoSection");

const startAudioRecordingBtn = document.querySelector("#audioStartBtn");
const stopAudioRecordingBtn = document.querySelector("#audioStopBtn");
const audioPlayback = document.querySelector("#audioPlayback");

const startVideoRecordingBtn = document.querySelector("#videoStartBtn");
const stopVideoRecordingBtn = document.querySelector("#videoStopBtn");
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
  canvas.classList.remove("hidden");
  videoElement.classList.add("hidden");
  fileUploadButton.classList.remove("hidden");

  startVideoRecordingBtn.disabled = true;
  stopVideoRecordingBtn.disabled = false;
  videoRecorder.startRecording();
});

stopVideoRecordingBtn.addEventListener("click", () => {
  canvas.classList.add("hidden");
  videoElement.classList.remove("hidden");
  fileUploadButton.classList.add("hidden");

  stopVideoRecordingBtn.disabled = true;
  startVideoRecordingBtn.disabled = false;
  videoRecorder.stopRecording();
});

imageUploadInput.addEventListener("change", (event) => {
  processImageUpload(event, videoRecorder);
});

function toggleMediaSection() {
  if (recordAudioSection.classList.contains("hidden")) {
    recordAudioSection.classList.remove("hidden");
    recordVideoSection.classList.add("hidden");
    toggleMediaSectionBtn.innerHTML = RECORD_VIDEO_LABEL;
  } else {
    recordAudioSection.classList.add("hidden");
    recordVideoSection.classList.remove("hidden");
    toggleMediaSectionBtn.innerHTML = RECORD_AUDIO_LABEL;
  }
}
toggleMediaSectionBtn.addEventListener("click", toggleMediaSection);
