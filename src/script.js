const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const output = document.getElementById("output");
const downloadButton = document.getElementById("download");
const fontSelect = document.getElementById("fontSelect");
const positionRadios = document.getElementsByName("position");

let currentImageSrc = null; // 保存当前图片的 src
let imageTimestamp = null; // 保存图片文件的时间戳

function processImage(file) {
  imageTimestamp = new Date(file.lastModified); // 获取文件的时间戳
  const reader = new FileReader();
  reader.onload = (e) => {
    currentImageSrc = e.target.result; // 保存当前图片 src
    drawImageWithWatermark(currentImageSrc, imageTimestamp);
  };
  reader.readAsDataURL(file);
}

function drawImageWithWatermark(src, timestamp) {
  const img = new Image();
  img.onload = () => {
    setupCanvas(img.width, img.height);
    ctx.drawImage(img, 0, 0, img.width, img.height);
    addWatermark(img.width, img.height, timestamp);
    updateOutput();
  };
  img.src = src;
}

function setupCanvas(width, height) {
  canvas.width = width;
  canvas.height = height;
}

function addWatermark(width, height, timestamp) {
  const fontSize = Math.max(Math.min(width, height) * 0.05, 16);
  const selectedFont = fontSelect.value;
  ctx.font = `${fontSize}px ${selectedFont}`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";

  const selectedPosition = [...positionRadios].find(
    (radio) => radio.checked
  ).value;

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
  output.src = canvas.toDataURL("image/png");
  downloadButton.style.display = "inline-block";
}

function downloadImage() {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png", 1.0);
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

positionRadios.forEach((radio) =>
  radio.addEventListener("change", () => {
    if (currentImageSrc) {
      drawImageWithWatermark(currentImageSrc, imageTimestamp);
    }
  })
);
