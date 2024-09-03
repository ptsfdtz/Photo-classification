const upload = document.getElementById("upload");
const previewCanvas = document.getElementById("canvas"); // 用于预览的 Canvas
const previewCtx = previewCanvas.getContext("2d");
const output = document.getElementById("output");
const downloadButton = document.getElementById("download");
const fontSelect = document.getElementById("fontSelect");
const positionRadios = document.getElementsByName("position");

// 新增用于下载的隐藏 Canvas
const downloadCanvas = document.createElement("canvas");
const downloadCtx = downloadCanvas.getContext("2d");

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
    // 设置下载 Canvas 与原始图片相同尺寸
    setupCanvas(downloadCanvas, downloadCtx, img.width, img.height);
    downloadCtx.drawImage(img, 0, 0, img.width, img.height);
    addWatermark(downloadCtx, img.width, img.height, timestamp);

    // 设置预览 Canvas，尺寸缩小，降低画质
    const previewWidth = img.width * 0.5; // 将预览图的分辨率设为原图的 50%
    const previewHeight = img.height * 0.5;
    setupCanvas(previewCanvas, previewCtx, previewWidth, previewHeight);
    previewCtx.drawImage(img, 0, 0, previewWidth, previewHeight);
    addWatermark(previewCtx, previewWidth, previewHeight, timestamp);

    updateOutput();
  };
  img.src = src;
}

function setupCanvas(canvas, ctx, width, height) {
  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height); // 清除之前的内容
}

function addWatermark(ctx, width, height, timestamp) {
  const fontSize = Math.max(Math.min(width, height) * 0.03, 16); // 设置字体大小 3% 至 10px
  const selectedFont = fontSelect.value; // 获取用户选择的字体
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

positionRadios.forEach((radio) =>
  radio.addEventListener("change", () => {
    if (currentImageSrc) {
      drawImageWithWatermark(currentImageSrc, imageTimestamp);
    }
  })
);
