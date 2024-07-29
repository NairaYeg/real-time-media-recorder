class VideoRecorder {
  constructor(canvas, playbackVideoElement, imageInputElement) {
    this.canvas = canvas;
    this.playbackVideo = playbackVideoElement;
    this.imageInputElement = imageInputElement;

    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.liveVideoElement = null;
    this.canvasSize = 400;

    this.uploadedImage = null;
    this.uploadedImages = [];

    this.audioStream = null;
    this.videoStream = null;
    this.canvasStream = null;

    this.animationFrameId = null;
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

  async #startRecording() {
    this.canvasStream = this.canvas.captureStream(30); // 30 FPS
    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    } catch (err) {
      console.error("Failed to get audio stream:", err);
      return;
    }

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

  #initializeCamera() {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        this.liveVideoElement = document.createElement("video");
        this.videoStream = stream;
        this.liveVideoElement.srcObject = stream;
        this.liveVideoElement.play();

        this.liveVideoElement.onplaying = () => {
          const ctx = this.canvas.getContext("2d");
          this.#startRecording();
          this.#drawFrame(ctx);
        };
      })
      .catch((err) => {
        alert("Camera Error");
      });
  }

  startRecording() {
    this.#initializeCanvas();
    this.#initializeCamera();
  }

  #stopStream(stream) {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }

  stopRecording() {
    cancelAnimationFrame(this.animationFrameId);

    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }

    this.#stopStream(this.audioStream);
    this.#stopStream(this.videoStream);
    this.#stopStream(this.canvasStream);

    this.recordedChunks = [];
    this.videoStream = null;
    this.audioStream = null;
    this.uploadedImage = "";
    this.uploadedImages = [];
    this.imageInputElement.value = "";
  }
}

export default VideoRecorder;
