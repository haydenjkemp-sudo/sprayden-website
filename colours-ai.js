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