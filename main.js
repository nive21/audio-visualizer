const audio = document.getElementById("audio");
const playButton = document.getElementById("playButton");

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
const source = audioCtx.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioCtx.destination);
analyser.fftSize = 256;

const dataArray = new Uint8Array(analyser.frequencyBinCount);

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

playButton.addEventListener("click", () => {
  audioCtx.resume().then(() => {
    audio.play();
    playButton.style.display = "none";
    animate();
  });
});

function animate() {
  requestAnimationFrame(animate);
  analyser.getByteFrequencyData(dataArray);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawVisualizer(dataArray);
}

function drawVisualizer(data) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const numPoints = data.length;
  const numRadials = 6; // Ensure 6 radials are used
  const maxRadius = Math.min(centerX, centerY) * 0.6;

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#ffcc00";

  for (let j = 0; j < numRadials; j++) {
    const angle = (Math.PI * 2 * j) / numRadials; // Evenly space 6 radials
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    ctx.beginPath();
    for (let i = 0; i < numPoints; i++) {
      const normalizedT = (i / numPoints) * 2 - 1; // Normalize -1 to 1
      const amplitude = (data[i] / 255) * maxRadius * 0.3; // Scale amplitude

      // Compute X along radial line
      const radialX = centerX + normalizedT * maxRadius * cosA;
      const waveOffset = Math.sin(normalizedT * Math.PI * 2) * amplitude;

      // Draw wave on both positive & negative Y-axis
      const y1 = centerY + waveOffset * sinA;
      const y2 = centerY - waveOffset * sinA;

      if (i === 0) ctx.moveTo(radialX, y1);
      else ctx.lineTo(radialX, y1);
    }
    ctx.stroke();

    // Mirror the wave on the opposite side of the radial
    ctx.beginPath();
    for (let i = 0; i < numPoints; i++) {
      const normalizedT = (i / numPoints) * 2 - 1;
      const amplitude = (data[i] / 255) * maxRadius * 0.3;

      const radialX = centerX + normalizedT * maxRadius * cosA;
      const waveOffset = Math.sin(normalizedT * Math.PI * 2) * amplitude;
      const mirroredY = centerY - waveOffset * sinA;

      if (i === 0) ctx.moveTo(radialX, mirroredY);
      else ctx.lineTo(radialX, mirroredY);
    }
    ctx.stroke();
  }
}
