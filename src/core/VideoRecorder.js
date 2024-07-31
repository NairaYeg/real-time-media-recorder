import MediaRecorderBase from "./MediaRecorderBase.js";
import {
  CANVAS_SIZE,
  IMAGE_SIZE,
  CAPTURE_STREAM_FPS,
} from "../utils/constants.js";

class VideoRecorder extends MediaRecorderBase {
  constructor(canvas, playbackVideoElement, imageInputElement) {
    super();
    this.canvas = canvas;
    this.canvasSize = CANVAS_SIZE;
    this.playbackVideo = playbackVideoElement;
    this.imageInputElement = imageInputElement;

    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.liveVideoElement = null;

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

  #getCornerPositions(canvasSize, imageSize) {
    return [
      { x: 0, y: 0 },
      { x: canvasSize - imageSize, y: 0 },
      { x: 0, y: canvasSize - imageSize },
      { x: canvasSize - imageSize, y: canvasSize - imageSize },
    ];
  }

  #drawFrame(ctx) {
    if (this.liveVideoElement) {
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

      const positions = this.#getCornerPositions(this.canvasSize, IMAGE_SIZE);

      this.uploadedImages.forEach((img, index) => {
        if (img) {
          ctx.drawImage(
            img,
            positions[index].x,
            positions[index].y,
            IMAGE_SIZE,
            IMAGE_SIZE
          );
        }
      });
      this.animationFrameId = requestAnimationFrame(() => this.#drawFrame(ctx));
    } else {
      console.warn("Video is not ready");
    }
  }

  #handleRecordingStop(mediaRecorder) {
    return () => {
      const { mimeType } = mediaRecorder;
      const blob = new Blob(this.recordedChunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      this.playbackVideo.src = url;
      console.info("Video Recording Ended...");
    };
  }

  #handleDataAvailable(event) {
    if (event.data.size > 0) {
      this.recordedChunks.push(event.data);
    }
  }

  #handleAudioStreamSuccess(stream) {
    this.audioStream = stream;
    this.canvasStream = this.canvas.captureStream(CAPTURE_STREAM_FPS);

    // Combine the video tracks from the canvas stream and the audio tracks from the audio stream
    // to enable real-time video processing effects with synchronized audio.
    const combinedStream = new MediaStream([
      ...this.canvasStream.getVideoTracks(),
      ...this.audioStream.getAudioTracks(),
    ]);

    this.setupMediaRecorder({
      stream: combinedStream,
      onRecordingStart: () => console.info("Video Recording Started..."),
      onRecordingStop: this.#handleRecordingStop,
      onDataAvailable: this.#handleDataAvailable,
    });
    this.mediaRecorder.start();
  }

  #handleStreamError(err) {
    //@TODO Improve error handling
    console.error("Failed to get the stream:", err);
    return;
  }

  async #initializeAudioStream() {
    this.initializeStream({
      constraints: { audio: true },
      onSuccess: this.#handleAudioStreamSuccess,
      onError: this.#handleStreamError,
    });
  }

  #initializeVideoStream() {
    this.initializeStream({
      constraints: { video: true },
      onSuccess: this.#hansleVideoStreamSuccess,
      onError: this.#handleStreamError,
    });
  }

  #hansleVideoStreamSuccess(stream) {
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
