import {
  FilesetResolver,
  InteractiveSegmenter
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.mjs";

const upload = document.getElementById("visualiserUpload");
const canvas = document.getElementById("visualiserCanvas");
const status = document.getElementById("visualiserStatus");
const serviceSelect = document.getElementById("visualiserService");
const resetButton = document.getElementById("resetVisualiser");
const colourButtons = document.querySelectorAll(
  ".visualiser-colours button[data-colour]"
);

const ctx = canvas.getContext("2d", {
  willReadFrequently: true
});

const sourceImage = new Image();

let segmenter = null;
let originalPhoto = null;
let selectedMask = null;
let selectedColour = "#383e42";
let photoLoaded = false;

async function initialiseSegmenter() {
  try {
    status.textContent = "Loading the AI visualiser...";

    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    segmenter = await InteractiveSegmenter.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-tasks/interactive_segmenter/ptm_512_hdt_ptm_woid.tflite"
        },
        outputCategoryMask: true,
        outputConfidenceMasks: false
      }
    );

    status.textContent = "Choose an item, then upload a photo.";
  } catch (error) {
    console.error(error);

    status.textContent =
      "The AI visualiser could not load. Please refresh and try again.";
  }
}

initialiseSegmenter();

upload.addEventListener("change", function () {
  const file = upload.files && upload.files[0];

  if (!file) {
    return;
  }

  if (!serviceSelect.value) {
    status.textContent =
      "Choose what you would like to recolour first.";

    upload.value = "";
    return;
  }

  const imageUrl = URL.createObjectURL(file);

  status.textContent = "Preparing your photo...";

  sourceImage.onload = function () {
    const maxWidth = 900;
    const maxHeight = 700;

    const scale = Math.min(
      1,
      maxWidth / sourceImage.naturalWidth,
      maxHeight / sourceImage.naturalHeight
    );

    canvas.width = Math.round(
      sourceImage.naturalWidth * scale
    );

    canvas.height = Math.round(
      sourceImage.naturalHeight * scale
    );

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.drawImage(
      sourceImage,
      0,
      0,
      canvas.width,
      canvas.height
    );

    originalPhoto = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    selectedMask = null;
    photoLoaded = true;

    status.textContent =
      "Photo ready. Tap the item you want to recolour.";

    URL.revokeObjectURL(imageUrl);
  };

  sourceImage.onerror = function () {
    status.textContent =
      "That photo could not be opened. Please try another.";

    URL.revokeObjectURL(imageUrl);
  };

  sourceImage.src = imageUrl;
});

canvas.addEventListener("click", function (event) {
  if (!segmenter) {
    status.textContent =
      "The AI visualiser is still loading. Please wait.";
    return;
  }

  if (!photoLoaded || !originalPhoto) {
    status.textContent = "Choose an item and upload a photo first.";
    return;
  }

  if (!serviceSelect.value) {
    status.textContent =
      "Choose what you would like to recolour first.";
    return;
  }

  const canvasBox = canvas.getBoundingClientRect();

  const normalisedX =
    (event.clientX - canvasBox.left) / canvasBox.width;

  const normalisedY =
    (event.clientY - canvasBox.top) / canvasBox.height;

  status.textContent =
    "Detecting the selected item. This may take a moment...";

  /* Ensure the AI analyses the original photo */
  ctx.putImageData(originalPhoto, 0, 0);

  try {
    segmenter.segment(
      canvas,
      {
        keypoint: {
          x: Math.max(0, Math.min(1, normalisedX)),
          y: Math.max(0, Math.min(1, normalisedY))
        }
      },
      function (result) {
        if (!result.categoryMask) {
          status.textContent =
            "The selected item could not be detected. Try tapping its centre.";
          return;
        }

        const categoryMask = result.categoryMask;
        const maskValues = categoryMask.getAsUint8Array();

        selectedMask = {
          data: new Uint8Array(maskValues),
          width: categoryMask.width,
          height: categoryMask.height
        };

        categoryMask.close();

        status.textContent =
          "Item detected. Choose a colour below.";
      }
    );
  } catch (error) {
    console.error(error);

    ctx.putImageData(originalPhoto, 0, 0);

    status.textContent =
      "Detection failed. Try tapping the centre of the item again.";
  }
});