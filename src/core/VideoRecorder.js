import MediaRecorderBase from "./MediaRecorderBase.js";
class VideoRecorder extends MediaRecorderBase {
  constructor(canvas, playbackVideoElement, imageInputElement) {
    super();
    this.canvas = canvas;
    this.playbackVideo = playbackVideoElement;
    this.imageInputElement = imageInputElement;

    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.liveVideoElement = null;
    //TODO: Extract this to a config file
    this.canvasSize = 400;

    this.uploadedImage = null;
    this.uploadedImages = [];

    this.audioStream = null;
    this.videoStream = null;
    this.canvasStream = null;

    this.animationFrameId = null;
  }

  startRecording() {
    this.checkRecordingSupport();
    this.#initializeCanvas();
    this.#initializeVideoStream();
  }

  stopRecording() {
    this.stopStream(this.audioStream);
    this.stopStream(this.videoStream);
    this.stopStream(this.canvasStream);

    this.#resetRecordingProperties();
  }

  #initializeCanvas() {
    this.canvas.width = this.canvasSize;
    this.canvas.height = this.canvasSize;
  }

  #drawFrame(ctx) {
    if (this.liveVideoElement != null) {
      const minDimension = Math.min(
        this.liveVideoElement.videoWidth,
        this.liveVideoElement.videoHeight
      );
      const sx = (this.liveVideoElement.videoWidth - minDimension) / 2;
      const sy = (this.liveVideoElement.videoHeight - minDimension) / 2;
      ctx.drawImage(
        this.liveVideoElement,
        sx,
        sy,
        minDimension,
        minDimension,
        0,
        0,
        this.canvasSize,
        this.canvasSize
      );

      const positions = [
        { x: 0, y: 0 },
        { x: this.canvasSize - 100, y: 0 },
        { x: 0, y: this.canvasSize - 100 },
        { x: this.canvasSize - 100, y: this.canvasSize - 100 },
      ];

      this.uploadedImages.forEach((img, index) => {
        if (img) {
          ctx.drawImage(img, positions[index].x, positions[index].y, 100, 100);
        }
      });
      this.animationFrameId = requestAnimationFrame(() => this.#drawFrame(ctx));
    } else {
      console.warn("Video is not ready");
    }
  }

  handleAudioStreamSuccess(stream) {
    this.audioStream = stream;
    this.canvasStream = this.canvas.captureStream(30); // 30 FPS

    const combinedStream = new MediaStream([
      ...this.canvasStream.getVideoTracks(),
      ...this.audioStream.getAudioTracks(),
    ]);

    this.mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: "video/webm",
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      this.playbackVideo.src = url;
    };

    this.mediaRecorder.start();
  }

  handleStreamError(err) {
    console.error("Failed to get audio stream:", err);
    return;
  }

  async #initializeAudioStream() {
    this.initializeStream({
      constraints: { audio: true },
      onSuccess: this.handleAudioStreamSuccess,
      onError: this.handleStreamError,
    });
  }

  #initializeVideoStream() {
    this.initializeStream({
      constraints: { video: true },
      onSuccess: this.hansleVideoStreamSuccess,
      onError: this.handleStreamError,
    });
  }

  hansleVideoStreamSuccess(stream) {
    this.liveVideoElement = document.createElement("video");
    this.videoStream = stream;
    this.liveVideoElement.srcObject = stream;
    this.liveVideoElement.play();

    this.liveVideoElement.onplaying = () => {
      const ctx = this.canvas.getContext("2d");
      this.#initializeAudioStream();
      this.#drawFrame(ctx);
    };
  }

  #resetRecordingProperties() {
    this.recordedChunks = [];
    this.videoStream = null;
    this.audioStream = null;
    this.uploadedImage = "";
    this.uploadedImages = [];
    this.imageInputElement.value = "";
    cancelAnimationFrame(this.animationFrameId);

    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }
  }
}

export default VideoRecorder;
