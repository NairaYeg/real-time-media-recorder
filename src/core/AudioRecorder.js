class AudioRecorder {
  constructor() {
    this.recordedAudioChunks = [];
    this.mediaRecorder = null;
    this.activeAudioStream = null;
    this.audioContext = null;
    this.gainNode = null;
  }

  static isRecordingSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  async start() {
    if (!AudioRecorder.isRecordingSupported()) {
      throw new Error(
        "mediaDevices API or getUserMedia method is not supported in this browser."
      );
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.activeAudioStream = stream;
      this.setupAudioContext(stream);
      this.setupMediaRecorder();
      this.setupVolumeControl();
      this.mediaRecorder.start();
    } catch (error) {
      console.error("Error starting audio recording:", error);
    }
  }

  setupAudioContext(stream) {
    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(stream);
    this.gainNode = this.audioContext.createGain();
    const destination = this.audioContext.createMediaStreamDestination();
    source.connect(this.gainNode).connect(destination);
    this.destinationStream = destination.stream;
  }

  setupMediaRecorder() {
    // Create a new MediaRecorder instance using the destination stream from the audio context.
    // This is necessary to record the audio after it has been processed by the gainNode,
    // allowing us to capture real-time volume adjustments.
    this.mediaRecorder = new MediaRecorder(this.destinationStream);
    this.recordedAudioChunks = [];
    this.mediaRecorder.addEventListener("dataavailable", (event) => {
      this.recordedAudioChunks.push(event.data);
    });
  }

  setupVolumeControl() {
    const volumeSlider = document.getElementById("volume");
    this.gainNode.gain.value = parseFloat(volumeSlider.value);

    volumeSlider.addEventListener(
      "input",
      function () {
        this.gainNode.gain.value = parseFloat(volumeSlider.value);
      }.bind(this)
    );
  }

  stop() {
    return new Promise((resolve) => {
      let mimeType = this.mediaRecorder.mimeType;

      this.mediaRecorder.addEventListener("stop", () => {
        let audioBlob = new Blob(this.recordedAudioChunks, { type: mimeType });
        resolve(audioBlob);
      });
      this.cancel();
    });
  }

  cancel() {
    this.mediaRecorder.stop();
    this.stopStream();
    this.resetRecordingProperties();
  }

  stopStream() {
    this.activeAudioStream.getTracks().forEach((track) => track.stop());
  }

  resetRecordingProperties() {
    this.mediaRecorder = null;
    this.activeAudioStream = null;
    this.audioContext = null;
    this.gainNode = null;
  }
}

export default AudioRecorder;
