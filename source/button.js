import { Sprite } from "card";
import { isPointInRectangle } from "collision";

export class Button extends EventTarget {
  constructor(canvas, events) {
    super();
    this.h = 11*6;
    this.pressed = false;
    this.x = canvas.width;
    this.y = 20;

    events.on('mouse-down', this.handlemousedown);
    events.on('mouse-up', this.handlemouseup);
  }

  initialize(total, index) {
    this.w = Sprite.width;
    const space = this.w + 20;

    this.x = this.x - this.w - space * (total-1) + index * space - 20;
    // this.y -= this.h/2;
  }

  // events handlers 
  handlemousedown = (e) => {
    if (isPointInRectangle(e.target.position, this))
    {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      this.pressed = true;
      if (this.onpressdown) this.onpressdown();
    }
  }
  handlemouseup = (e) => {
    if (this.pressed)
    {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      this.dispatchEvent(new Event("click"));
    }
    this.pressed = false;
  }

  render(context) {
    Sprite.renderButton(context, 0, this.x, this.y, this.pressed);
  }
}

export class EyeButton extends Button {
  constructor(canvas, events) {
    super(canvas, events);
    this.open = false;
  }
  onpressdown() {
    this.open = !this.open;
  }

  render(context) {
    Sprite.renderButton(context, this.open ? 1 : 2, this.x, this.y, this.pressed);
  }
}