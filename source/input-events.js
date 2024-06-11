import { Vector } from "vector";
import { logscreen } from "utils";

const defaultInitSettings = {
  pointerlock: {
    unadjustedMovement: true, // speed on movement is same
  },
}

const MouseButtonMap = {
  0: "left",
  1: "wheel",
  2: "right",
}

class Mouse extends EventTarget {
  constructor(canvas, config) {
    super();
    // x = 0, y = 0
    this.position = Vector.Zero;
    this.movement = Vector.Zero;
    this.config = config;

    this.lastpointerlock = performance.now() - 1000;

    this.clicked = false;
    this.verbose = false;
    this.click = {
      start: null,
      end: null,
      button: null
    };

    if (config.pointerlock)
    {
      canvas.addEventListener("click", this.handlepointersetup);
      document.addEventListener("pointerlockchange", this.handlepointerlockchange, false);
      document.addEventListener("pointerlockerror", this.handlepointerlockerror, false);
    }
    else
    {
      // this.position.set(canvas.offsetLeft + canvas.width/2, canvas.offsetTop + canvas.height/2);
      document.addEventListener("mousemove", this.handlemousemove);
    }
    canvas.addEventListener("mousedown", this.handlemousedown);
    canvas.addEventListener("mouseup", this.handlemouseup);
  }

  on(eventname, callback) {
    this.addEventListener(eventname, callback);
  }

  handlemousemove = (e) => {
    if (document.pointerLockElement)
    {
      this.position.add(e.movementX, e.movementY);
      this.movement.set(e.movementX, e.movementY);
    }
    else
    {
      const dx = this.position.x - e.clientX;
      const dy = this.position.y - e.clientY;
      this.position.set(e.clientX, e.clientY);
      this.movement.set(dx, dy);
    }
    this.dispatchEvent(new Event("move"));
  }
  handlemousedown = (e) => {
    this.clicked = true;
    this.click.start = performance.now();
    this.click.end = null;
    this.click.button = MouseButtonMap[e.target.button]; // 
    this.dispatchEvent(new Event("down"));
  }
  handlemouseup = (e) => {
    this.clicked = false;
    this.click.end = performance.now();
    this.click.button = null;
    this.dispatchEvent(new Event("up"));
  }

  draw(ctx, strokecolor="black", fillcolor="rgba(0,0,0,0.1)", thickness=1) {
    ctx.fillStyle=fillcolor;
    ctx.strokeStyle=strokecolor;
    ctx.strokeWidth = thickness;

    ctx.beginPath();
    ctx.arc(InputEvents.mouse.x, InputEvents.mouse.y, 10, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
  }

  // event handlers
  handlepointersetup = (e) => {
    if (document.pointerLockElement) return;
    const canvas = e.target;
    const {clientX, clientY} = e;
    const time = Math.max(0, 1500 - (performance.now() - this.lastpointerlock));
    this.position.set(clientX, clientY);

    clearTimeout(this.pointerlocktimer);
    this.pointerlocktimer = setTimeout(() => {
      
      // REFERENCE:: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API#handling_promise_and_non-promise_versions_of_requestpointerlock
      const promise = canvas.requestPointerLock(this.config.pointerlock);
        
      if (!promise && this.config.pointerlock.unadjustedMovement) {
        console.log("disabling mouse acceleration is not supported");
        return;
      }
    
      promise
        .then(() => {
          console.log("pointer-lock")
        })
        .catch((error) => {
          console.log('pointer lock error', error)
          if (error.name === "NotSupportedError" && this.config.pointerlock.unadjustedMovement) {
            // Some platforms may not support unadjusted movement.
            // You can request again a regular pointer lock.
            return canvas.requestPointerLock();
          }
        });
    }, time)
  }
  handlepointerlockchange = (e) => {
    this.lastpointerlock = performance.now();
    if (document.pointerLockElement) {
      console.log("The pointer lock status is now locked");
      document.addEventListener("mousemove", this.handlemousemove);
    } else {
      console.log("The pointer lock status is now unlocked");
      document.removeEventListener("mousemove", this.handlemousemove, false);
    }
  }
  handlepointerlockerror = (e) => {
    console.error('pointer lock failed', e);
  }
}
class Keyboard extends EventTarget {
  constructor() {
    super();

    this.keys = {};
    this.verbose = false;
    document.addEventListener("keydown", this.handlekeydown);
    document.addEventListener("keyup", this.handlekeyup);
  }

  on(key, callback) {
    this.addEventListener(key, callback);
  }
  key(name) {
    return this.keys[name];
  }

  handlekeydown = (e) => {
    const name = (e.key || e.code).toLowerCase();

    if (!this.keys[name])
    {
      this.keys[name] = {clicked: false};
    }

    if (this.keys[name].clicked === false)
    {
      this.keys[name].start = performance.now();
    }

    
    this.keys[name].clicked = true;
    this.keys[name].stop = null;
    
    if (this.verbose)
    {
      logscreen("keyup", name, this.keys[name]);
    }
    // this.dispatchEvent(new CustomEvent('key', { detail: {
    //   name,
    //   value: this.keys[name]
    // }}));
    this.dispatchEvent(new CustomEvent(`${name}-down`, { detail: {
      name,
      value: this.keys[name]
    }}));
    this.dispatchEvent(new CustomEvent(name, {
      name,
      value: this.keys[name]
    }));
  }
  handlekeyup = (e) => {
    const name = (e.key || e.code).toLowerCase();
    if (!this.keys[name])
    {
      throw new Error("keyup event fired but no key registered: " + name);
    }
    
    this.keys[name].clicked = false;
    this.keys[name].stop = performance.now();
    
    if (this.verbose)
    {
      logscreen("keyup", name, this.keys[name]);
    }

    this.dispatchEvent(new CustomEvent(`${name}-up`, { detail: {
      name,
      value: this.keys[name]
    }}));
    this.dispatchEvent(new CustomEvent(name, {
      name,
      value: this.keys[name]
    }));
  }
}
class ExtendedTouch {
  constructor(touch) {
    this.position = null;
    this.movement = null;

    this.start = performance.now();
    this.end = null;

    this.update(touch);
  }

  get id() {
    return this.identifier;
  }

  update(touch) {
    this.identifier = touch.identifier;
    this.screenX = touch.screenX;
    this.screenY = touch.screenY;
    this.clientX = touch.clientX;
    this.clientY = touch.clientY;
    this.pageX = touch.pageX;
    this.pageY = touch.pageY;
    this.radiusX = touch.radiusX;
    this.radiusY = touch.radiusY;
    this.rotationAngle = touch.rotationAngle;
    this.force = touch.force;
    this.target = touch.target;

    if (this.position === null)
    {
      this.movement = Vector.Zero;
      this.position = new Vector(this.clientX, this.clientY);
    }
    else 
    {
      const old = this.position.copy();
      this.position.set(this.clientX, this.clientY);
      this.movement = this.position.Sub(old);
    }
  }

  release() {
    this.end = performance.now();
    return this;
  }
}
class Touches extends EventTarget {
  constructor(canvas) {
    super();
    this.position = Vector.Zero; // first move 
    this.movement = Vector.Zero;
    this.mouse = null;

    this.touches = {};
    this.changedTouches = [];
    this.verbose = false;
    
    canvas.addEventListener("touchstart", this.handletouchstart);
    canvas.addEventListener("touchend",this. handletouchend);
    canvas.addEventListener("touchmove", this.handletouchmove);
    canvas.addEventListener("touchcancel", this.handletouchcancel);
  }

  // public function
  on(eventname, callback) {
    this.addEventListener(eventname, callback);
  }

  // event handlers 
  handletouchstart = (e) => {
    this.changedTouches = [];
    
    const oldmouse = this.mouse?.id;
    for (const eventtouch of e.changedTouches)
    {
      const touch = this.touchChange(eventtouch);
      this.mouse = touch;
      this.position.set(touch.position);
      this.movement.set(touch.movement);
    }
    
    
    const lastdown = oldmouse !== this.mouse.id;
    if (lastdown)
    {
      this.dispatchEvent(new Event("last-down"));
    }
    
    if (this.verbose)
    {
      logscreen("touch start", lastdown);
    }
    this.dispatchEvent(new Event("down"));
  }
  handletouchend = (e) => {
    this.changedTouches = [];

    for (const eventtouch of e.changedTouches)
    {
      const touch = this.touchChange(eventtouch);
      touch.release();
      delete this.touches[touch.id]

      if (touch === this.mouse)
      {
        this.position.set(touch.position);
        this.movement.set(touch.movement);
        this.mouse = null;
        this.dispatchEvent(new Event("last-up"));
      }
    }

    if (this.verbose)
    {
      logscreen("touch end");
    }
    this.dispatchEvent(new Event("up"));
  }
  handletouchmove = (e) => {
    this.changedTouches = [];

    for (const eventtouch of e.changedTouches)
    {
      const touch = this.touchChange(eventtouch);

      if (touch === this.mouse)
      {
        this.position.set(touch.position);
        this.movement.set(touch.movement);

        this.dispatchEvent(new Event("last-move"));
      }
    }

    this.dispatchEvent(new Event("move"));
  }
  handletouchcancel = (e) => {
    this.changedTouches = [];
    
    for (const eventtouch of e.changedTouches)
    {
      const touch = this.touchChange(eventtouch);
      touch.release();

      delete this.touches[touch.id]

      if (touch === this.mouse)
      {
        this.mouse = null;
        this.dispatchEvent(new Event("last-up"));
      }
    }
      
    this.position.set(0, 0);
    this.movement.set(0, 0);

    this.dispatchEvent(new Event("cancel"));
  }

  // helper 
  touchChange(touch) {
    const id = touch.identifier;
    if (this.touches[id])
    {
      this.touches[id].update(touch);
    }
    else 
    {
      this.touches[id] = new ExtendedTouch(touch);
    }

    this.changedTouches.push(this.touches[id]);
    return this.touches[id];
  }
}
export class InputEvents extends EventTarget {
  constructor(canvas, settings) {
    super();
    this.config = getSettings(settings);

    this.mouse = new Mouse(canvas, this.config);
    this.touch = new Touches(canvas);
    this.keyboard = new Keyboard();
    this.position = Vector.Zero;
    this.verbose = !!this.config.verbose;

    this.mouse.on("down", this.handledown);
    this.mouse.on("up", this.handleup);
    this.mouse.on("move", this.handlemove);

    this.touch.on("last-down", this.handledown);
    this.touch.on("last-up", this.handleup);
    this.touch.on("last-move", this.handlemove);
  }

  set verbose (value) {
    this.mouse.verbose = value;
    this.keyboard.verbose = value;
    this.touch.verbose = value;
  }

  handledown = (e) => {
    this.position = e.target.position;
    this.movement = e.target.movement;
    this.pressing = true;

    this.dispatchEvent(new Event("mouse-down"));
  }
  handleup = (e) => {
    this.position = e.target.position;
    this.movement = e.target.movement;
    this.pressing = false;

    this.dispatchEvent(new Event("mouse-up"));
  }
  handlemove = (e) => {
    this.position = e.target.position;
    this.movement = e.target.movement;

    this.dispatchEvent(new Event("mouse-move"));
  }

  key(name) {
    return this.keyboard.keys[name];
  }
  onkey(eventname, callback) {
    this.keyboard.on(eventname, callback);
  }

  on(eventname, callback) {
    switch (eventname)
    {
      case "mouse-move":
      case "mouse-up":
      case "mouse-down":
        this.addEventListener(eventname, callback);

      case "move":
      case "down":
      case "up":
        this.mouse.addEventListener(eventname, callback);
        this.touch.addEventListener(eventname, callback);

      case "cancel":
        this.touch.addEventListener(eventname, callback);

      default:
        this.keyboard.on(eventname, callback);
    }
  }
}

// new CustomEvent("move", {
//   detail: {
//     type: e.target instanceof Mouse ? "mouse" : "touch"
//   }
// })

// helper functions
function getSettings(settings) {
  const config = {
    // ...defaultInitSettings,
    ...(settings || {}),
  };

  if (settings?.pointerlock === null || settings?.pointerlock === false)
  {
    config.pointerlock = null;
  }
  // else
  // {
  //   config.pointerlock = {
  //     ...defaultInitSettings.pointerlock,
  //     ...(settings?.pointerlock || {}),
  //   }
  // }


  return config;
}