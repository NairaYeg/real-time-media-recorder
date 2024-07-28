export class MediaRecorderBase {
  constructor() {
    this.mediaRecorder = null;
    this.recordedMediaChunks = [];
  }

  static isMediaRecordingSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  setupMediaRecorder(stream) {
    this.mediaRecorder = new MediaRecorder(stream);
    this.recordedMediaChunks = [];
    this.mediaRecorder.addEventListener("dataavailable", (event) => {
      this.recordedMediaChunks.push(event.data);
    });
  }

  startRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.start();
    }
  }

  async stopRecording() {
    return new Promise((resolve) => {
      if (this.mediaRecorder) {
        this.mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(this.recordedMediaChunks, {
            type: this.mediaRecorder.mimeType,
          });
          resolve(audioBlob);
        });
        this.mediaRecorder.stop();
      } else {
        resolve(null);
      }
    });
  }
}

export default MediaRecorderBase;
