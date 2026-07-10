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

function hexToRgb(hex) {
  const cleanHex = hex.replace("#", "");

  return {
    r: parseInt(cleanHex.substring(0, 2), 16),
    g: parseInt(cleanHex.substring(2, 4), 16),
    b: parseInt(cleanHex.substring(4, 6), 16)
  };
}

function applySelectedColour() {
  if (!originalPhoto || !selectedMask) {
    return;
  }

  const output = new ImageData(
    new Uint8ClampedArray(originalPhoto.data),
    originalPhoto.width,
    originalPhoto.height
  );

  const colour = hexToRgb(selectedColour);

  const canvasWidth = originalPhoto.width;
  const canvasHeight = originalPhoto.height;

  const maskWidth = selectedMask.width;
  const maskHeight = selectedMask.height;
  const maskData = selectedMask.data;

  for (let y = 0; y < canvasHeight; y++) {
    const maskY = Math.min(
      maskHeight - 1,
      Math.floor((y / canvasHeight) * maskHeight)
    );

    for (let x = 0; x < canvasWidth; x++) {
      const maskX = Math.min(
        maskWidth - 1,
        Math.floor((x / canvasWidth) * maskWidth)
      );

      const maskIndex = maskY * maskWidth + maskX;

      /*
        MediaPipe uses 0 for the background.
        Values above 0 belong to the selected object.
      */
      if (maskData[maskIndex] === 0) {
        continue;
      }

      const pixelIndex = (y * canvasWidth + x) * 4;

      const originalRed = originalPhoto.data[pixelIndex];
      const originalGreen = originalPhoto.data[pixelIndex + 1];
      const originalBlue = originalPhoto.data[pixelIndex + 2];

      const brightness =
        (
          originalRed * 0.299 +
          originalGreen * 0.587 +
          originalBlue * 0.114
        ) / 255;

      /*
        Keeps the object's existing light, shadow and texture.
      */
      const shade = 0.4 + brightness * 0.75;
      const strength = 0.82;

      output.data[pixelIndex] =
        originalRed * (1 - strength) +
        colour.r * shade * strength;

      output.data[pixelIndex + 1] =
        originalGreen * (1 - strength) +
        colour.g * shade * strength;

      output.data[pixelIndex + 2] =
        originalBlue * (1 - strength) +
        colour.b * shade * strength;
    }
  }

  ctx.putImageData(output, 0, 0);
}

colourButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    selectedColour = button.dataset.colour;

    colourButtons.forEach(function (item) {
      item.classList.remove("active");
    });

    button.classList.add("active");

    if (!photoLoaded || !originalPhoto) {
      status.textContent =
        "Choose an item and upload a photo first.";
      return;
    }

    if (!selectedMask) {
      status.textContent =
        "Tap the item in your photo before choosing a colour.";
      return;
    }

    applySelectedColour();

    status.textContent =
      "Colour preview applied. Choose another colour or tap a different item.";
  });
});

resetButton.addEventListener("click", function () {
  if (originalPhoto) {
    ctx.putImageData(originalPhoto, 0, 0);
  }

  selectedMask = null;

  colourButtons.forEach(function (button) {
    button.classList.remove("active");
  });

  status.textContent = photoLoaded
    ? "Preview reset. Tap the item you want to recolour."
    : "Choose an item, then upload a photo.";
});

serviceSelect.addEventListener("change", function () {
  selectedMask = null;

  if (originalPhoto) {
    ctx.putImageData(originalPhoto, 0, 0);
  }

  colourButtons.forEach(function (button) {
    button.classList.remove("active");
  });

  status.textContent = photoLoaded
    ? "Item changed. Tap the item you want to recolour."
    : "Upload a photo to begin.";
});