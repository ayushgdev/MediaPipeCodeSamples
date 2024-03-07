
import {
  ObjectDetector,
  FilesetResolver,
  Detection,
  ObjectDetectionResult
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";

const demosSection = document.getElementById("demos") as HTMLElement;

let objectDetector: ObjectDetector;
let runningMode = "VIDEO";

// Initialize the object detector.
async function initializeObjectDetector() {
  const visionFilesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  objectDetector = await ObjectDetector.createFromOptions(visionFilesetResolver, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-assets/dogs.tflite"
    },
    scoreThreshold: 0.3,
    runningMode: runningMode
  });
}
initializeObjectDetector();

const imageContainers = document.getElementsByClassName(
  "detectOnClick"
) as HTMLDivElement;

for (let imageContainer of imageContainers) {
  imageContainer.children[0].addEventListener("click", handleClick);
}

/**
 * Detect objects in still images on click
 */
async function handleClick(event) {
  const highlighters = event.target.parentNode.getElementsByClassName(
    "highlighter"
  );
  while (highlighters[0]) {
    highlighters[0].parentNode.removeChild(highlighters[0]);
  }

  const infos = event.target.parentNode.getElementsByClassName("info");
  while (infos[0]) {
    infos[0].parentNode.removeChild(infos[0]);
  }

  if (!objectDetector) {
    alert("Object Detector is still loading. Please try again.");
    return;
  }

  // if video mode is initialized, set runningMode to image
  if (runningMode === "VIDEO") {
    runningMode = "IMAGE";
    await objectDetector.setOptions({ runningMode: "IMAGE" });
  }

  const ratio = event.target.height / event.target.naturalHeight;

  // objectDetector.detect returns a promise which, when resolved, is an array of Detection objects
  const detections = objectDetector.detect(event.target);
  displayImageDetections(detections, event.target);
}

function displayImageDetections(
  result: ObjectDetectionResult,
  resultElement: HTMLElement
) {
  const ratio = resultElement.height / resultElement.naturalHeight;
  console.log(ratio);

  for (let detection of result.detections) {
    // Description text
    const p = document.createElement("p");
    p.setAttribute("class", "info");
    p.innerText =
      detection.categories[0].categoryName +
      " - with " +
      Math.round(parseFloat(detection.categories[0].score) * 100) +
      "% confidence.";
    // Positioned at the top left of the bounding box.
    // Height is whatever the text takes up.
    // Width subtracts text padding in CSS so fits perfectly.
    p.style =
      "left: " +
      detection.boundingBox.originX * ratio +
      "px;" +
      "top: " +
      detection.boundingBox.originY * ratio +
      "px; " +
      "width: " +
      (detection.boundingBox.width * ratio - 10) +
      "px;";
    const highlighter = document.createElement("div");
    highlighter.setAttribute("class", "highlighter");
    highlighter.style =
      "left: " +
      detection.boundingBox.originX * ratio +
      "px;" +
      "top: " +
      detection.boundingBox.originY * ratio +
      "px;" +
      "width: " +
      detection.boundingBox.width * ratio +
      "px;" +
      "height: " +
      detection.boundingBox.height * ratio +
      "px;";

    resultElement.parentNode.appendChild(highlighter);
    resultElement.parentNode.appendChild(p);
  }
}