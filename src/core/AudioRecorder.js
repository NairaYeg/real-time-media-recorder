class AudioRecorder {
  constructor() {
    this.recordedAudioChunks = [];
    this.mediaRecorder = null;
    this.activeAudioStream = null;
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

    return navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        this.activeAudioStream = stream;
        this.mediaRecorder = new MediaRecorder(stream);
        this.recordedAudioChunks = [];
        this.mediaRecorder.addEventListener("dataavailable", (event) => {
          this.recordedAudioChunks.push(event.data);
        });
        this.mediaRecorder.start();
      });
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
  }
}

export default AudioRecorder;
