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
    animate(); // ✅ Start animation only after clicking play
  });
});

let frameCount = 0; // Keep track of frames

function animate() {
  frameCount++; // Increment frame count each frame
  analyser.getByteFrequencyData(dataArray); // ✅ Get live audio data
  drawVisualizer(dataArray, frameCount); // ✅ Pass actual audio data
  requestAnimationFrame(animate); // Keep looping
}

function drawVisualizer(data, frameCount) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const numPoints = data.length;
  const numRadials = 6;
  const maxRadius = Math.min(centerX, centerY) * 0.6;

  // 🌟 Fading Effect (Before Drawing)
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; // Low alpha for smooth fading
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 2;

  for (let j = 0; j < numRadials; j++) {
    const angle = (Math.PI * 2 * j) / numRadials;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    // 🎨 Dynamic Color for Each Radial
    const hue = (frameCount * 2 + j * 60) % 360;
    ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;

    // Draw positive wave
    ctx.beginPath();
    for (let i = 0; i < numPoints; i++) {
      const normalizedT = (i / numPoints) * 2 - 1;
      const amplitude = (data[i] / 255) * maxRadius * 0.3;

      const radialX = centerX + normalizedT * maxRadius * cosA;
      const radialY = centerY + normalizedT * maxRadius * sinA;

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
      const normalizedT = (i / numPoints) * 2 - 1;
      const amplitude = (data[i] / 255) * maxRadius * 0.3;

      const radialX = centerX + normalizedT * maxRadius * cosA;
      const radialY = centerY + normalizedT * maxRadius * sinA;

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
