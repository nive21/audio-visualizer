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
  const numRadials = 6;
  const maxRadius = Math.min(centerX, centerY) * 0.6;

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#ffcc00";

  // Draw each radial line and its waves
  for (let j = 0; j < numRadials; j++) {
    const angle = (Math.PI * 2 * j) / numRadials;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    // Draw positive wave
    ctx.beginPath();
    for (let i = 0; i < numPoints; i++) {
      const normalizedT = (i / numPoints) * 2 - 1; // -1 to 1
      const amplitude = (data[i] / 255) * maxRadius * 0.3;

      // Calculate position along the radial line
      const radialX = centerX + normalizedT * maxRadius * cosA;
      const radialY = centerY + normalizedT * maxRadius * sinA;

      // Add wave displacement perpendicular to the radial (positive side)
      const waveX =
        radialX - amplitude * Math.sin(normalizedT * Math.PI * 2) * sinA;
      const waveY =
        radialY + amplitude * Math.sin(normalizedT * Math.PI * 2) * cosA;

      if (i === 0) ctx.moveTo(waveX, waveY);
      else ctx.lineTo(waveX, waveY);
    }
    ctx.stroke();

    // Draw negative wave
    ctx.beginPath();
    for (let i = 0; i < numPoints; i++) {
      const normalizedT = (i / numPoints) * 2 - 1; // -1 to 1
      const amplitude = (data[i] / 255) * maxRadius * 0.3;

      // Calculate position along the radial line
      const radialX = centerX + normalizedT * maxRadius * cosA;
      const radialY = centerY + normalizedT * maxRadius * sinA;

      // Add wave displacement perpendicular to the radial (negative side)
      const waveX =
        radialX + amplitude * Math.sin(normalizedT * Math.PI * 2) * sinA;
      const waveY =
        radialY - amplitude * Math.sin(normalizedT * Math.PI * 2) * cosA;

      if (i === 0) ctx.moveTo(waveX, waveY);
      else ctx.lineTo(waveX, waveY);
    }
    ctx.stroke();
  }
}
