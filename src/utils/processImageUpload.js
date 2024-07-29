/**
 * Processes the image upload and sets the uploaded image to the video recorder.
 *
 * @param {Event} event - The event object triggered by the file input change.
 * @param {Object} videoRecorder - The video recorder object.
 */
function processImageUpload(event, videoRecorder) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const image = new Image();
      image.onload = () => {
        videoRecorder.uploadedImage = image;
      };
      image.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

export default processImageUpload;
