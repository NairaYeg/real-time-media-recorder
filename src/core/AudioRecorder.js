import MediaRecorderBase from "./MediaRecorderBase.js";
class AudioRecorder extends MediaRecorderBase {
  constructor() {
    super();
    this.recordedAudioChunks = [];
    this.mediaRecorder = null;
    this.stream = null;
    this.audioContext = null;
    this.gainNode = null;
  }

  startRecording() {
    this.checkRecordingSupport();

    this.initializeStream({
      constraints: { audio: true },
      onSuccess: this.handleStreamSuccess,
      onError: this.handleStreamError,
    });
  }

  stopRecording() {
    this.mediaRecorder.stop(this.mediaRecorder);
    this.stopStream(this.stream);
    this.resetRecordingProperties();
  }

  handleDataAvailable(event) {
    this.recordedAudioChunks.push(event.data);
  }

  handleRecordingStop(mediaRecorder) {
    return () => {
      console.info("Recording ended......");
      let mimeType = mediaRecorder.mimeType;
      let audioBlob = new Blob(this.recordedAudioChunks, { type: mimeType });
      let audioUrl = window.URL.createObjectURL(audioBlob);
      audioPlayback.src = audioUrl;
    };
  }

  handleStreamSuccess(stream) {
    this.stream = stream;
    this.setupAudioContext(stream);
    this.recordedAudioChunks = [];
    // Create a new MediaRecorder instance using the destination stream from the audio context.
    // This is necessary to record the audio after it has been processed by the gainNode,
    // allowing us to capture real-time volume adjustments.
    this.setupMediaRecorder({
      stream: this.destinationStream,
      onRecordingStart: () => console.info("Recording started......"),
      onRecordingStop: this.handleRecordingStop,
      onDataAvailable: this.handleDataAvailable,
    });
    this.setupVolumeControl();
    this.mediaRecorder.start();
  }

  handleStreamError(error) {
    alert("Error starting audio recording. Please try again.");
    console.error("Error starting audio recording:", error);
  }

  setupAudioContext(stream) {
    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(stream);
    this.gainNode = this.audioContext.createGain();
    const destination = this.audioContext.createMediaStreamDestination();
    source.connect(this.gainNode).connect(destination);
    this.destinationStream = destination.stream;
  }

  setupVolumeControl() {
    const volumeSlider = document.getElementById("volume");
    this.gainNode.gain.value = parseFloat(volumeSlider.value);

    volumeSlider.addEventListener("input", () => {
      if (this.gainNode) {
        this.gainNode.gain.value = parseFloat(volumeSlider.value);
      }
    });
  }

  resetRecordingProperties() {
    this.mediaRecorder = null;
    this.stream = null;
    this.audioContext = null;
    this.gainNode = null;
  }
}

export default AudioRecorder;
