const audio = document.getElementById("audio");
const playButton = document.getElementById("playButton");

// Set up audio context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
const source = audioCtx.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioCtx.destination);
analyser.fftSize = 64;

const dataArray = new Uint8Array(analyser.frequencyBinCount);

// Set up D3 SVG container
const svg = d3
  .select("body")
  .append("svg")
  .attr("width", window.innerWidth)
  .attr("height", window.innerHeight);

const numCircles = dataArray.length;
const circles = svg
  .selectAll("circle")
  .data(dataArray)
  .enter()
  .append("circle")
  .attr(
    "cx",
    (d, i) =>
      window.innerWidth / 2 + Math.sin((i / numCircles) * 2 * Math.PI) * 200
  )
  .attr(
    "cy",
    (d, i) =>
      window.innerHeight / 2 + Math.cos((i / numCircles) * 2 * Math.PI) * 200
  )
  .attr("r", 5)
  .attr("fill", (d, i) => `hsl(${(i / numCircles) * 360}, 100%, 50%)`)
  .attr("opacity", 0.7);

// Start Audio on Button Click
playButton.addEventListener("click", () => {
  audioCtx.resume().then(() => {
    audio.play();
    playButton.style.display = "none";
    animate();
  });
});

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  analyser.getByteFrequencyData(dataArray);

  circles
    .data(dataArray)
    .attr("r", (d) => 5 + d / 50)
    .attr("fill", (d) => `hsl(${d}, 100%, 50%)`);
}
