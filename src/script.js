const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const output = document.getElementById("output");
const downloadButton = document.getElementById("download");

function processImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => drawImageWithWatermark(e.target.result);
  reader.readAsDataURL(file);
}

function drawImageWithWatermark(src) {
  const img = new Image();
  img.onload = () => {
    const { newWidth, newHeight } = scaleImage(img);
    setupCanvas(newWidth, newHeight);
    ctx.drawImage(img, 0, 0, newWidth, newHeight);
    addWatermark(newWidth, newHeight);
    updateOutput();
  };
  img.src = src;
}

function scaleImage(img) {
  const scale = Math.min(
    window.innerWidth / img.width,
    window.innerHeight / img.height
  );
  return { newWidth: img.width * scale, newHeight: img.height * scale };
}

function setupCanvas(width, height) {
  canvas.width = width;
  canvas.height = height;
}

function addWatermark(width, height) {
  ctx.font = "32px Arial";
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText(new Date().toLocaleString(), width - 20, height - 20);
}

function updateOutput() {
  output.src = canvas.toDataURL("image/png");
  downloadButton.style.display = "inline-block";
}

function downloadImage() {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "带水印的图片.png";
  link.click();
}

upload.addEventListener("change", (event) =>
  processImage(event.target.files[0])
);
downloadButton.addEventListener("click", downloadImage);
