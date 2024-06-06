export class Vector {
  constructor(x, y, z = 0) {
    if (typeof x === "object")
    {
      this.x = x.x || 0;
      this.y = x.y || 0;
      this.z = x.z || 0;
    }
    else 
    {
      this.x = x;
      this.y = y;
      this.z = z;
    }
  }

  get magnitude() {
    return Vector.Magnitude(this);
  }
  get angle() {
    return Math.atan2(this.y, this.x);
  }

  set magnitude(value) {
    const angle = this.angle;
    this.x = Math.cos(angle) * value;
    this.y = Math.sin(angle) * value;
  }
  set angle(value) {
    const mag = this.magnitude;
    this.x = Math.cos(value) * mag;
    this.y = Math.sin(value) * mag;
  }

  // affectors
  /**
   * Sets vector to value
   * @param {Vector|number} v 
   * @param {undefined|number} y 
   * @param {undefined|number} z 
   * @returns Vector
   */
  set(v, y, z = 0) {
    const vv = Vector.toVector(v, y, z);
    this.x = vv.x;
    this.y = vv.y;
    this.z = vv.z;

    return this;
  }
  /**
   * Adds another vector to original
   * @param {Vector|number} v 
   * @param {undefined|number} y 
   * @param {undefined|number} z 
   * @returns Vector
   */
  add(v, y, z = 0) {
    const vv = Vector.toVector(v, y, z);
    this.x += vv.x;
    this.y += vv.y;
    this.z += vv.z;

    return this;
  }
  /**
   * Subtracts another vector to original
   * @param {Vector|number} v 
   * @param {undefined|number} y 
   * @param {undefined|number} z 
   * @returns Vector
   */
  sub(v, y, z = 0) {
    const vv = Vector.toVector(v, y, z);
    this.x -= vv.x;
    this.y -= vv.y;
    this.z -= vv.z;

    return this;
  }
  /**
   * Divides another vector to original
   * @param {Vector|number} v 
   * @param {undefined|number} y 
   * @param {undefined|number} z 
   * @returns Vector
   */
  divide(v, y, z = 0) {
    const vv = Vector.toVector(v, y, z);
    this.x /= vv.x;
    this.y /= vv.y;
    this.z /= vv.z;

    return this;
  }
  /**
   * Multiplies another vector to original
   * @param {Vector|number} v 
   * @param {undefined|number} y 
   * @param {undefined|number} z 
   * @returns Vector
   */
  mul(v, y, z = 0) {
    const vv = Vector.toVector(v, y, z);
    this.x *= vv.x;
    this.y *= vv.y;
    this.z *= vv.z;

    return this;
  }

  // copy
  /**
   * Adds 2 vectors without modifying the original
   * @param {Vector|number} v 
   * @param {undefined|number} y 
   * @param {undefined|number} z 
   * @returns new Vector
   */
  Add(v, y, z = 0) {
    const vv = Vector.toVector(v, y, z);
    const copy = Vector.Copy(this);
    copy.x += vv.x;
    copy.y += vv.y;
    copy.z += vv.z;

    return copy;
  }
    /**
   * Subtracts 2 vectors without modifying the original
   * @param {Vector|number} v 
   * @param {undefined|number} y 
   * @param {undefined|number} z 
   * @returns new Vector
   */
  Sub(v, y, z = 0) {
    const vv = Vector.toVector(v, y, z);
    const copy = Vector.Copy(this);
    copy.x -= vv.x;
    copy.y -= vv.y;
    copy.z -= vv.z;

    return copy;
  }
  /**
   * Divides 2 vectors without modifying the original
   * @param {Vector|number} v 
   * @param {undefined|number} y 
   * @param {undefined|number} z 
   * @returns new Vector
   */
  Divide(v, y, z = 0) {
    const vv = Vector.toVector(v, y, z);
    const copy = Vector.Copy(this);
    copy.x /= vv.x;
    copy.y /= vv.y;
    copy.z /= vv.z;

    return copy;
  }
  /**
   * Multiplies 2 vectors without modifying the original
   * @param {Vector|number} v 
   * @param {undefined|number} y 
   * @param {undefined|number} z 
   * @returns new Vector
   */
  Mul(v, y, z = 0) {
    const vv = Vector.toVector(v, y, z);
    const copy = Vector.Copy(this);
    copy.x *= vv.x;
    copy.y *= vv.y;
    copy.z *= vv.z;

    return copy;
  }
  get opposite() {
    return this.mul(-1);
  }
  get Opposite() {
    return Vector.toVector(this).opposite();
  }

  normalise() {
    const mag = this.magnitude;
    this.x /= mag;
    this.y /= mag;
    this.z /= mag;

    return this;
  }

  toString(settings = {z: false, round: true}) {
    let print = '';
    if (settings.round) print = `${Math.round(this.x * 100) / 100}, ${Math.round(this.y * 100) / 100}`;
    else print = `${this.x}, ${this.y}`;
    if (settings.z) 
    {
      if (settings.round) print += ", "+ Math.round(this.z * 100) / 100;
      else print += ", " + this.z;
    }
    return `[${print}]`;
  }

  dot(b) {
    return this.x * b.x + this.y * b.y + this.z * b.z;
  }

  draw(ctx, color = "black", r = 1) {
    ctx.beginPath();
      ctx.arc(this.x, this.y, r/2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    ctx.closePath();
  }

  copy() {
    return new Vector(this.x, this.y, this.z);
  }
  
  // static function 
  // mathematical
  static Multiply(a, b) {
    return new Vector(a).mul(b);
  }
  static Multiply(a, b) {
    return new Vector(a).divide(b);
  }
  static Add(a, b) {
    return new Vector(a).add(b);
  }
  static Subtract(a, b) {
    return new Vector(a).sub(b);
  }
  static CrossProduct(a, b) {
    return new Vector(
      a.y * b.z - a.z * b.y,
      a.z * b.x - a.x * b.z,
      a.x * b.y - a.y * b.x,
    )
  }
  static Cross(a, b) {
    return a.x * b.y - a.y * b.x;
  }
  static Magnitude(v) {
    return Math.sqrt(v.x*v.x + v.y*v.y);
  }
  static Distance(a, b) {
    return Vector.Subtract(a, b).magnitude;
  }
  static Perpendicular(a, b, windingorder="clickwise") {
    const v = Vector.Subtract(b, a);
    if (windingorder === "clockwise") return new Vector(-v.y, v.x);
    return new Vector(v.y, -v.x);
  }
  static Normalise(v) {
    const copy = new Vector(v);
    copy.normalise();
    return copy;
  }
  static Dot(a, b) {
    return Vector.toVector(a).dot(b);
  }

  // basic functions
  static toVector(v, y, z = 0) {
    if (typeof v === "number") 
    {
      return new Vector(v, y ?? v, z ?? v);
    }

    if (v instanceof Vector) 
    {
      return v;
    }
    if (typeof v === "object")
    {
      return new Vector(v);
    }

    throw new Error(`This ${v} could not be reshaped into a vector`);
  }
  static Copy(v) {
    return new Vector(v);
  }
  static get Zero() {
    return new Vector(0, 0, 0);
  }
  static get Random() {
    return new Vector(
      -1 + Math.random() * 2, 
      -1 + Math.random() * 2, 
      -1 + Math.random() * 2,
    );
  }

  static Draw(v, ctx, color = "black", r = 1) {
    const vv = Vector.toVector(v);
    vv.draw(ctx, color, r);
  }
}