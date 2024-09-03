const upload = document.getElementById("upload");
const previewCanvas = document.getElementById("canvas");
const previewCtx = previewCanvas.getContext("2d");
const output = document.getElementById("output");
const downloadButton = document.getElementById("download");
const fontSelect = document.getElementById("fontSelect");
const positionSelect = document.getElementById("positionSelect");

const downloadCanvas = document.createElement("canvas");
const downloadCtx = downloadCanvas.getContext("2d");

let currentImageSrc = null;
let imageTimestamp = null;

function processImage(file) {
  imageTimestamp = new Date(file.lastModified);
  const reader = new FileReader();
  reader.onload = (e) => {
    currentImageSrc = e.target.result;
    drawImageWithWatermark(currentImageSrc, imageTimestamp);
  };
  reader.readAsDataURL(file);
}

function drawImageWithWatermark(src, timestamp) {
  const img = new Image();
  img.onload = () => {
    const maxWidth = window.innerWidth * 0.7; // 最大宽度为视口宽度的 70%
    const maxHeight = window.innerHeight * 0.7; // 最大高度为视口高度的 70%

    let width = img.width;
    let height = img.height;
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const ratio = Math.min(widthRatio, heightRatio);

    width *= ratio;
    height *= ratio;

    setupCanvas(downloadCanvas, downloadCtx, img.width, img.height);
    downloadCtx.drawImage(img, 0, 0, img.width, img.height);
    addWatermark(downloadCtx, img.width, img.height, timestamp);

    setupCanvas(previewCanvas, previewCtx, width, height);
    previewCtx.drawImage(img, 0, 0, width, height);
    addWatermark(previewCtx, width, height, timestamp);

    updateOutput();
  };
  img.src = src;
}

function setupCanvas(canvas, ctx, width, height) {
  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height);
}

function addWatermark(ctx, width, height, timestamp) {
  const fontSize = Math.max(Math.min(width, height) * 0.05, 16);
  const selectedFont = fontSelect.value;
  ctx.font = `${fontSize}px ${selectedFont}`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";

  const selectedPosition = positionSelect.value;

  let x, y;

  switch (selectedPosition) {
    case "bottom-right":
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      x = width - 20;
      y = height - 20;
      break;
    case "bottom-left":
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      x = 20;
      y = height - 20;
      break;
    case "top-right":
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      x = width - 20;
      y = 20;
      break;
    case "top-left":
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      x = 20;
      y = 20;
      break;
  }

  ctx.fillText(timestamp.toLocaleString(), x, y);
}

function updateOutput() {
  output.src = previewCanvas.toDataURL("image/jpeg", 0.2); // 降低预览图的画质
  downloadButton.style.display = "inline-block";
}

function downloadImage() {
  const link = document.createElement("a");
  // 使用高质量导出下载图像
  link.href = downloadCanvas.toDataURL("image/png", 1.0);
  link.download = "带水印的图片.png";
  link.click();
}

upload.addEventListener("change", (event) =>
  processImage(event.target.files[0])
);
downloadButton.addEventListener("click", downloadImage);

fontSelect.addEventListener("change", () => {
  if (currentImageSrc) {
    drawImageWithWatermark(currentImageSrc, imageTimestamp);
  }
});

positionSelect.addEventListener("change", () => {
  if (currentImageSrc) {
    drawImageWithWatermark(currentImageSrc, imageTimestamp);
  }
});
