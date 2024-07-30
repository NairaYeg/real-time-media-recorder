class MediaRecorderBase {
  initializeStream({ constraints, onSuccess, onError }) {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(onSuccess.bind(this))
      .catch(onError.bind(this));
  }

  stopStream(stream) {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }

  static isRecordingSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  checkRecordingSupport() {
    if (!MediaRecorderBase.isRecordingSupported()) {
      throw new Error(
        "mediaDevices API or getUserMedia method is not supported in this browser."
      );
    }
  }

  setupMediaRecorder({
    stream,
    onRecordingStart,
    onRecordingStop,
    onDataAvailable,
  }) {
    this.mediaRecorder = new MediaRecorder(stream);

    this.mediaRecorder.ondataavailable = onDataAvailable.bind(this);
    this.mediaRecorder.onstart = onRecordingStart.bind(this);
    this.mediaRecorder.onstop = onRecordingStop.bind(this)(this.mediaRecorder);
  }
}

export default MediaRecorderBase;
