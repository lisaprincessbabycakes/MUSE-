/* global createCanvas, io, colorMode, noStroke, background, fill, HSB, ellipse, mouseX, mouseY */
//by craig fahner
let socket = io();
let ellipseScale = 1;
let isTouchDevice;
let clientX;
let mouseIsDown = false;
let clientY;
let myIndex;
let touchers = []; // i was calling this 'touches' before but it conflicts with an array created when multi touch input is received by a mobile device
let myHue = Math.floor(Math.random() * 360);
let ellipseSize = 100 * window.devicePixelRatio;

socket.on("incomingTouch", data => {
  let alreadyExists = false; // create variable that checks if our client already has a "toucher" object assigned to them
  if (touchers.length > 0) {
    for (let i = 0; i < touchers.length; i++) {
      if (touchers[i].id == data.id) { // go through all the connected clients, see if any of their ids match the incoming ID
        alreadyExists = true; // if so, we store the new position and state of the existing toucher
        touchers[i].x = data.x;
        touchers[i].y = data.y;
        touchers[i].on = data.on;
      }
    }
  }
  if (alreadyExists == false) {
    touchers.push(data); // if this is an entirely new client, add the client to the touchers array
    console.log("received new touch: " + touchers[touchers.length - 1].id);
  }
});

socket.on("removeTouch", data => {
  let theIndex;
  for (let i = 0; i < touchers.length; i++) {
    if (touchers[i].id == data) { // the incoming message states which user id has disconnected, check to see if that id is associated with a "toucher"
      theIndex = i;
    }
  }
  if (theIndex!= null) {
    console.log("removing touch");
    console.log(touchers);
    touchers.splice(theIndex, 1); // take that toucher out of the array
    console.log(touchers);
  } else {
    console.log("no touches to delete");
  }
});

if ("ontouchstart" in document.documentElement) { // special handling for touch device vs mouse input
  isTouchDevice = true;
} else {
  isTouchDevice = false;
}

if (isTouchDevice) {
  document.addEventListener("touchstart", e => {
    let event = e.changedTouches[0]; // "touchstart" tracks touches from multiple fingers, just track a single touch
    sendPos(event.clientX, event.clientY, 1); // send position on touchstart
    mouseIsDown = true;
  });

  document.addEventListener("touchmove", e => {
    let event = e.changedTouches[0];
    sendPos(event.clientX, event.clientY, 1); // send position on touchmove
  });
  document.addEventListener("touchend", e => {
    let event = e.changedTouches[0];
    sendPos(event.clientX, event.clientY, 0); // send position on touchend, noting that the touch has ended
    mouseIsDown = false;
  });
} else {
  document.addEventListener("mousedown", e => { // below does the same for standard mouse input
    sendPos(e.clientX, e.clientY, 1);
    mouseIsDown = true;
  });

  document.addEventListener("mouseup", e => {
    mouseIsDown = false;
    sendPos(e.offsetX, e.offsetY, 0);
  });

  document.addEventListener("mousemove", e => {
    if (mouseIsDown) {
      sendPos(e.offsetX, e.offsetY, 1);
    }
  });
}

function sendPos(clientX, clientY, on) {
  let x = clientX / window.innerWidth;
  let y = clientY / window.innerHeight;
  let id = socket.id;
  let hue = myHue;
  socket.emit("touchChange", { x, y, on, hue, id }); // sends an object containing those 4 fields
}

// --- p5JS stuff ---

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  colorMode(HSB);
  noStroke();
}

function draw() {
  background(0);
  fill(255);
  //draw other peoples' touches
  for (let i = 0; i < touchers.length; i++) {
    if (touchers[i].id != socket.id) {
      fill(touchers[i].hue, 50, 90, 0.8);
      ellipse(
        touchers[i].x * window.innerWidth,
        touchers[i].y * window.innerHeight,
        ellipseSize * touchers[i].on,
        ellipseSize * touchers[i].on
      );
      fill(255);
    }
  }
  //draw my own touch
  if (mouseIsDown) {
    fill(myHue, 50, 90, 0.8);
    ellipse(
      mouseX,
      mouseY,
      ellipseSize * ellipseScale,
      ellipseSize * ellipseScale
    );
  }
}
