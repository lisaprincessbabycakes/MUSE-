let backgroundHue = 0;
let alpha = 0;

function setup() {
  createCanvas(400, 400);
  colorMode(HSB);
  setupMuse();
}

function draw() {
  background(backgroundHue,90,80);
  // text display of alpha:
  noStroke();
  fill(0,0,0);
  textSize(10);
  text('ALPHA: ' + eeg.alpha.toFixed(0), 10, 60);
  // alpha smoothing: using linear interpolation to smooth the otherwise jumpy alpha values
  // every frame, the alpha value eases towards the current value by 1%
  alpha = lerp(alpha,eeg.alpha.toFixed(0),0.01);
  backgroundHue=map(alpha,0,100,0,255);
}