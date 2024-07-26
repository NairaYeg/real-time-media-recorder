import AudioRecorder from "./core/AudioRecorder.js";

const startBtn = document.querySelector("#startBtn");
const stopBtn = document.querySelector("#stopBtn");
const audioPlayback = document.querySelector("#audioPlayback");

const audioRecorder = new AudioRecorder(audioPlayback);

startBtn.addEventListener("click", async () => {
  try {
    await audioRecorder.start();
  } catch (err) {
    console.error("Failed to start recording", err);
  }
});

stopBtn.addEventListener("click", () => {
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
