const upload = document.getElementById("visualiserUpload");
const canvas = document.getElementById("visualiserCanvas");
const ctx = canvas.getContext("2d");
const img = document.getElementById("visualiserImage");
const status = document.getElementById("visualiserStatus");

let painting = false;
let colour = "#383e42";

const colours = document.querySelectorAll("[data-colour]");
const reset = document.getElementById("resetVisualiser");

upload.addEventListener("change", () => {

    const file = upload.files[0];
    if (!file) return;

    img.src = URL.createObjectURL(file);

    img.onload = () => {

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        status.textContent =
            "Photo loaded. Tap the window, door or cupboard you want to recolour.";

    };

});

let originalPhoto = null;
let selectedArea = null;

function hexToRgb(hex) {
    const value = hex.replace("#", "");

    return {
        r: parseInt(value.substring(0, 2), 16),
        g: parseInt(value.substring(2, 4), 16),
        b: parseInt(value.substring(4, 6), 16)
    };
}

colours.forEach((button) => {
    button.addEventListener("click", () => {

        colour = button.dataset.colour;

        colours.forEach((item) => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        if (selectedArea && originalPhoto) {
            applyColour();
        } else {
            status.textContent =
                "Colour selected. Now tap the part of the photo you want to change.";
        }
    });
});

canvas.addEventListener("click", (event) => {

    if (!canvas.width || !canvas.height) {
        status.textContent = "Please upload a photo first.";
        return;
    }

    if (!originalPhoto) {
        originalPhoto = ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );
    }

    const box = canvas.getBoundingClientRect();

    const startX = Math.floor(
        (event.clientX - box.left) *
        (canvas.width / box.width)
    );

    const startY = Math.floor(
        (event.clientY - box.top) *
        (canvas.height / box.height)
    );

    selectedArea = findConnectedArea(startX, startY);
    applyColour();

    status.textContent =
        "Area selected. Choose another colour or tap a different area.";
});

function findConnectedArea(startX, startY) {
    const width = canvas.width;
    const height = canvas.height;
    const data = originalPhoto.data;

    const startPixel = startY * width + startX;
    const startIndex = startPixel * 4;

    const targetRed = data[startIndex];
    const targetGreen = data[startIndex + 1];
    const targetBlue = data[startIndex + 2];

    const threshold = 65;
    const mask = new Uint8Array(width * height);
    const visited = new Uint8Array(width * height);
    const stack = [startPixel];

    while (stack.length > 0) {
        const pixel = stack.pop();

        if (visited[pixel]) continue;
        visited[pixel] = 1;

        const x = pixel % width;
        const y = Math.floor(pixel / width);
        const index = pixel * 4;

        const redDifference = data[index] - targetRed;
        const greenDifference = data[index + 1] - targetGreen;
        const blueDifference = data[index + 2] - targetBlue;

        const distance = Math.sqrt(
            redDifference * redDifference +
            greenDifference * greenDifference +
            blueDifference * blueDifference
        );

        if (distance > threshold) continue;

        mask[pixel] = 1;

        if (x > 0) stack.push(pixel - 1);
        if (x < width - 1) stack.push(pixel + 1);
        if (y > 0) stack.push(pixel - width);
        if (y < height - 1) stack.push(pixel + width);
    }

    return mask;
}

function applyColour() {
    if (!originalPhoto || !selectedArea) return;

    const output = new ImageData(
        new Uint8ClampedArray(originalPhoto.data),
        originalPhoto.width,
        originalPhoto.height
    );

    const selectedRgb = hexToRgb(colour);
    const strength = 0.72;

    for (let pixel = 0; pixel < selectedArea.length; pixel++) {
        if (!selectedArea[pixel]) continue;

        const index = pixel * 4;

        const originalRed = originalPhoto.data[index];
        const originalGreen = originalPhoto.data[index + 1];
        const originalBlue = originalPhoto.data[index + 2];

        const brightness =
            (
                originalRed * 0.299 +
                originalGreen * 0.587 +
                originalBlue * 0.114
            ) / 255;

        const shade = 0.45 + brightness * 0.8;

        output.data[index] =
            originalRed * (1 - strength) +
            selectedRgb.r * shade * strength;

        output.data[index + 1] =
            originalGreen * (1 - strength) +
            selectedRgb.g * shade * strength;

        output.data[index + 2] =
            originalBlue * (1 - strength) +
            selectedRgb.b * shade * strength;
    }

    ctx.putImageData(output, 0, 0);
}

reset.addEventListener("click", () => {
    if (originalPhoto) {
        ctx.putImageData(originalPhoto, 0, 0);
    }

    selectedArea = null;

    colours.forEach((button) => {
        button.classList.remove("active");
    });

    status.textContent = originalPhoto
        ? "Preview reset. Tap another area to begin again."
        : "Upload a photo to begin.";
});

upload.addEventListener("change", () => {
    originalPhoto = null;
    selectedArea = null;

    colours.forEach((button) => {
        button.classList.remove("active");
    });
});