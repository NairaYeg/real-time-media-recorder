class VideoRecorder {
  #canvasId;
  #videoElementId;
  #imageUploadId;
  #mediaRecorder;
  #recordedChunks;
  #videoElement;
  #canvasSize;
  #canvasElement;
  #uploadedImage;
  #stream;

  constructor(canvasId, videoElementId, imageUploadId) {
    this.#canvasId = canvasId;
    this.#videoElementId = videoElementId;
    this.#imageUploadId = imageUploadId;
    this.#mediaRecorder = null;
    this.#recordedChunks = [];
    this.#videoElement = null;
    this.#canvasSize = 400;
    this.#canvasElement = null;
    this.#uploadedImage = null;
    this.#stream = null;
  }

  #initializeCanvas() {
    const canvas = document.getElementById(this.#canvasId);
    canvas.width = this.#canvasSize;
    canvas.height = this.#canvasSize;
    return canvas;
  }

  #drawFrame(ctx) {
    if (this.#videoElement != null) {
      const minDimension = Math.min(
        this.#videoElement.videoWidth,
        this.#videoElement.videoHeight
      );
      const sx = (this.#videoElement.videoWidth - minDimension) / 2;
      const sy = (this.#videoElement.videoHeight - minDimension) / 2;
      ctx.drawImage(
        this.#videoElement,
        sx,
        sy,
        minDimension,
        minDimension,
        0,
        0,
        this.#canvasSize,
        this.#canvasSize
      );

      if (this.#uploadedImage) {
        ctx.drawImage(this.#uploadedImage, 0, 0, 100, 100);
      }
      requestAnimationFrame(() => this.#drawFrame(ctx));
    } else {
      console.warn("Video is not ready");
    }
  }

  async #startRecording(canvas) {
    this.#stream = canvas.captureStream(30); // 30 FPS
    const videoStream = this.#stream;
    let audioStream;
    try {
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.error("Failed to get audio stream:", err);
      return;
    }

    const combinedStream = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...audioStream.getAudioTracks(),
    ]);

    this.#mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: "video/webm",
    });

    this.#mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        console.log({ eventData: event.data });
        this.#recordedChunks.push(event.data);
      }
    };

    this.#mediaRecorder.onstop = () => {
      console.log({ recordedChunks: this.#recordedChunks });
      const blob = new Blob(this.#recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      document.getElementById(this.#videoElementId).src = url;
      console.log({ url });
    };

    this.#mediaRecorder.start();
  }

  #initializeCamera() {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        this.#videoElement = document.createElement("video");
        this.#videoElement.srcObject = stream;
        this.#videoElement.play();

        this.#videoElement.onplaying = () => {
          const canvas = document.getElementById(this.#canvasId);
          const ctx = canvas.getContext("2d");
          this.#startRecording(canvas);
          this.#drawFrame(ctx);
        };
      })
      .catch((err) => {
        alert("Camera Error");
      });
  }

  startRecording() {
    this.#canvasElement = this.#initializeCanvas();
    this.#initializeCamera();
  }

  stopRecording() {
    document.getElementById(this.#imageUploadId).value = "";
    if (this.#mediaRecorder) {
      this.#mediaRecorder.stop();
      this.#mediaRecorder = null;
      this.#stream.getTracks().forEach((track) => track.stop());
      this.#stream = null;
      this.#videoElement.srcObject = null;
    }
  }

  handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.#uploadedImage = new Image();
        this.#uploadedImage.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}

export default VideoRecorder;
