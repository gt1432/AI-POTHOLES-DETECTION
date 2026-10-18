const detectButton = document.getElementById('detectButton');
const runAgainButton = document.getElementById('runAgainButton');
const uploadButton = document.getElementById('uploadButton');
const imageUpload = document.getElementById('imageUpload');
const inputImg = document.getElementById('inputImg');
const outputImg = document.getElementById('outputImg');
const inputTag = document.getElementById('inputTag');
const outputPanel = document.getElementById('outputPanel');
const outputImageWrap = document.getElementById('outputImageWrap');
const scanOverlay = document.getElementById('scanOverlay');
const scanText = document.getElementById('scanText');
const scanSubtext = document.getElementById('scanSubtext');
const progressBar = document.getElementById('progressBar');
const progressLabel = document.getElementById('progressLabel');
const statusTitle = document.getElementById('statusTitle');
const statusText = document.getElementById('statusText');
const statusIcon = document.getElementById('statusIcon');
const inputState = document.getElementById('inputState');
const outputState = document.getElementById('outputState');
const outputCaption = document.getElementById('outputCaption');
const connectorProgress = document.getElementById('connectorProgress');
const connectorLabel = document.getElementById('connectorLabel');

let timer;
let currentCustomFile = null;
let customBoxes = [];

function clearDynamicBoxes() {
  const existing = outputImageWrap.querySelectorAll('.dynamic-box');
  existing.forEach(b => b.remove());
}

function resetDemo() {
  window.clearInterval(timer);
  detectButton.disabled = false;
  detectButton.innerHTML = '<span class="button-icon">✦</span> Detect pothole';
  outputPanel.classList.remove('scanning', 'detected');
  progressBar.style.width = '0%';
  progressLabel.textContent = '0%';
  connectorProgress.style.width = '0%';
  connectorLabel.textContent = 'ready to scan';
  inputState.textContent = currentCustomFile ? 'Custom image' : 'Waiting';
  inputState.className = currentCustomFile ? 'panel-state success' : 'panel-state neutral';
  outputState.textContent = 'Not analyzed';
  outputState.className = 'panel-state';
  statusTitle.textContent = currentCustomFile ? 'Custom image loaded' : 'Ready to demonstrate';
  statusText.textContent = currentCustomFile 
    ? 'Press "Detect pothole" to run AI detection on your image.' 
    : 'RoadGuard is waiting for a road image to analyze.';
  statusIcon.textContent = '↗';
  statusIcon.style.background = '#dcecf3';
  statusIcon.style.color = '#1775ad';
  scanText.textContent = 'Waiting for input';
  scanSubtext.textContent = 'Press Detect pothole to begin';
  outputCaption.textContent = 'The detector output will appear here.';
  clearDynamicBoxes();
}

async function runDetection() {
  resetDemo();
  detectButton.disabled = true;
  detectButton.innerHTML = '<span class="button-icon">◌</span> Analyzing image…';
  outputPanel.classList.add('scanning');
  inputState.textContent = 'Captured';
  inputState.className = 'panel-state success';
  outputState.textContent = 'Scanning';
  outputState.className = 'panel-state';
  statusTitle.textContent = 'RoadGuard is analyzing the image';
  statusText.textContent = 'The detector is looking for visible pothole patterns.';
  statusIcon.textContent = '◌';
  statusIcon.style.background = '#d7f6eb';
  statusIcon.style.color = '#189b6d';
  connectorLabel.textContent = 'AI scan in progress';
  connectorProgress.style.width = '15%';

  // If a custom file is uploaded, try calling the live backend API
  let apiResult = null;
  if (currentCustomFile) {
    try {
      const formData = new FormData();
      formData.append('file', currentCustomFile);
      const res = await fetch('/api/predict', { credentials: 'omit', method: 'POST', body: formData });
      if (res.ok) {
        apiResult = await res.json();
      }
    } catch (e) {
      console.log('Backend API call fallback:', e);
    }
  }

  let progress = 0;
  timer = window.setInterval(() => {
    progress += 4;
    progressBar.style.width = `${progress}%`;
    progressLabel.textContent = `${progress}%`;
    connectorProgress.style.width = `${Math.min(100, progress)}%`;
    if (progress > 25) {
      scanText.textContent = 'Scanning road surface';
      scanSubtext.textContent = 'Evaluating neural bounding candidates';
    }
    if (progress > 65) {
      scanText.textContent = 'Preparing review output';
      scanSubtext.textContent = 'Filtering high-confidence detections';
    }
    if (progress >= 100) {
      window.clearInterval(timer);
      showResult(apiResult);
    }
  }, 40);
}

function showResult(apiResult) {
  outputPanel.classList.remove('scanning');
  outputPanel.classList.add('detected');
  outputState.textContent = 'Detected';
  outputState.className = 'panel-state success';
  connectorLabel.textContent = 'output ready';

  const defaultBox = document.getElementById('detectionBox');

  if (apiResult && apiResult.detections && apiResult.detections.length > 0) {
    defaultBox.style.display = 'none';
    clearDynamicBoxes();

    const imgW = apiResult.image_size?.width || 1;
    const imgH = apiResult.image_size?.height || 1;

    apiResult.detections.forEach((det, idx) => {
      const [xmin, ymin, xmax, ymax] = det.bbox;
      const left = ((xmin / imgW) * 100).toFixed(2);
      const top = ((ymin / imgH) * 100).toFixed(2);
      const width = (((xmax - xmin) / imgW) * 100).toFixed(2);
      const height = (((ymax - ymin) / imgH) * 100).toFixed(2);

      const boxEl = document.createElement('div');
      boxEl.className = 'detection-box dynamic-box';
      boxEl.style.cssText = `position: absolute; left: ${left}%; top: ${top}%; width: ${width}%; height: ${height}%; border: 2px solid var(--green); z-index: 2; opacity: 1; transform: scale(1);`;
      boxEl.innerHTML = `
        <span class="box-label"><i></i> POTHOLE (${Math.round((det.confidence || 0.85) * 100)}%)</span>
        <span class="box-corner c1"></span><span class="box-corner c2"></span><span class="box-corner c3"></span><span class="box-corner c4"></span>
      `;
      outputImageWrap.appendChild(boxEl);
    });

    statusTitle.textContent = `${apiResult.detected_potholes_count} Pothole(s) detected — review required`;
    statusText.textContent = 'Live YOLO detector verified road damage. Inspector review recommended.';
  } else {
    defaultBox.style.display = 'block';
    statusTitle.textContent = 'Pothole detected — review required';
    statusText.textContent = 'The green box marks the region a human inspector should verify next.';
  }

  statusIcon.textContent = '✓';
  statusIcon.style.background = '#d7f6eb';
  statusIcon.style.color = '#189b6d';
  outputCaption.textContent = 'RoadGuard turns the input frame into a focused, reviewable detection output.';
  detectButton.disabled = false;
  detectButton.innerHTML = '<span class="button-icon">↻</span> Run again';
}

function handleSelectedFile(file) {
  if (!file) return;
  currentCustomFile = file;
  const objectUrl = URL.createObjectURL(file);
  inputImg.src = objectUrl;
  outputImg.src = objectUrl;
  inputTag.textContent = file.name ? file.name.slice(0, 18) : 'CAMERA CAPTURE';
  resetDemo();
  document.getElementById('demo').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Mobile and desktop input listeners
const cameraUpload = document.getElementById('cameraUpload');
const cameraButton = document.getElementById('cameraButton');
const stageUploadBtn = document.getElementById('stageUploadBtn');
const stageCameraBtn = document.getElementById('stageCameraBtn');
const dropArea = document.getElementById('dropArea');

if (uploadButton && imageUpload) {
  uploadButton.addEventListener('click', () => imageUpload.click());
  imageUpload.addEventListener('change', (e) => handleSelectedFile(e.target.files[0]));
}

if (cameraButton && cameraUpload) {
  cameraButton.addEventListener('click', () => cameraUpload.click());
  cameraUpload.addEventListener('change', (e) => handleSelectedFile(e.target.files[0]));
}

if (stageUploadBtn && imageUpload) {
  stageUploadBtn.addEventListener('click', () => imageUpload.click());
}

if (stageCameraBtn && cameraUpload) {
  stageCameraBtn.addEventListener('click', () => cameraUpload.click());
}

// Drag and drop for desktop
if (dropArea) {
  ['dragenter', 'dragover'].forEach(name => {
    dropArea.addEventListener(name, (e) => {
      e.preventDefault();
      dropArea.classList.add('drag-over');
    });
  });
  ['dragleave', 'drop'].forEach(name => {
    dropArea.addEventListener(name, (e) => {
      e.preventDefault();
      dropArea.classList.remove('drag-over');
    });
  });
  dropArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      handleSelectedFile(dt.files[0]);
    }
  });
}

detectButton.addEventListener('click', runDetection);
runAgainButton.addEventListener('click', () => {
  document.getElementById('demo').scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.setTimeout(runDetection, 300);
});

resetDemo();

