const upload = document.getElementById("upload");
const previewCanvas = document.getElementById("canvas");
const previewCtx = previewCanvas.getContext("2d");
const downloadButton = document.getElementById("download");
const fontSelect = document.getElementById("fontSelect");
const positionSelect = document.getElementById("positionSelect");
const photoContainer = document.getElementById("photoContainer");
const placeholder = document.getElementById("placeholder");

const downloadCanvas = document.createElement("canvas");
const downloadCtx = downloadCanvas.getContext("2d");
const colorSelect = document.getElementById("colorSelect");

let currentImageSrc = null;
let imageTimestamp = null;

// 处理图片
function processImage(file) {
  imageTimestamp = new Date(file.lastModified);
  const reader = new FileReader();
  reader.onload = (e) => {
    currentImageSrc = e.target.result;
    drawImageWithWatermark(currentImageSrc, imageTimestamp);
    // 隐藏提示信息，显示图片
    placeholder.style.display = "none";
    previewCanvas.style.display = "block";
  };
  reader.readAsDataURL(file);
}

// 绘制带水印的图片
function drawImageWithWatermark(src, timestamp) {
  const img = new Image();
  img.onload = () => {
    const maxWidth = window.innerWidth * 0.7;
    const maxHeight = window.innerHeight * 0.7;

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

    downloadButton.style.display = "inline-block"; // 显示下载按钮
  };
  img.src = src;
}

// 设置画布
function setupCanvas(canvas, ctx, width, height) {
  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height);
}

// 添加水印
function addWatermark(ctx, width, height, timestamp) {
  const fontSize = Math.max(Math.min(width, height) * 0.05, 16);
  const selectedFont = fontSelect.value;
  const selectedColor = colorSelect.value; // 获取选择的颜色
  ctx.font = `${fontSize}px ${selectedFont}`;
  ctx.fillStyle = selectedColor; // 使用用户选择的颜色

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

colorSelect.addEventListener("change", () => {
  if (currentImageSrc) {
    drawImageWithWatermark(currentImageSrc, imageTimestamp);
  }
});

// 下载图片
function downloadImage() {
  const link = document.createElement("a");
  link.href = downloadCanvas.toDataURL("image/png", 1.0);
  link.download = "带水印的图片.png";
  link.click();
}

// 照片池点击触发上传
photoContainer.addEventListener("click", () => upload.click());

// 上传文件变化时处理
upload.addEventListener("change", (event) =>
  processImage(event.target.files[0])
);

// 监听字体和位置选择变化
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

// 下载按钮点击事件
downloadButton.addEventListener("click", downloadImage);
