/**
 * @file this file is for all card related classes and functions 
 * @module card 
 * @author Henry Pap [onkelhoy@gmail.com]
 */

import { LoadImage } from "engine";
import { Vector } from "vector";

/**
 * @class 
 */
export class Sprite {

  static rows = 0;
  static cols = 0;
  static image = 0;
  static framewidth = 0;
  static frameheight = 0;

  static async initialize(image, rows, cols) {
    Sprite.rows = rows;
    Sprite.cols = cols;

    Sprite.image = await LoadImage(image);
    Sprite.framewidth = Sprite.image.width / Sprite.cols;
    Sprite.frameheight = Sprite.image.height / Sprite.rows;
  }

  static get width() {
    return Sprite.framewidth * 6;
  }
  static get height() {
    return Sprite.frameheight * 6;
  }

  static draw(context, index, x, y) {
    const framex = index % Sprite.cols;
    const framey = Math.floor(index / Sprite.cols);

    // Disable image smoothing
    context.imageSmoothingEnabled = false;

    context.drawImage(
      Sprite.image, 
      framex*Sprite.framewidth, 
      framey*Sprite.frameheight, 
      Sprite.framewidth, 
      Sprite.frameheight, 
      x, 
      y, 
      Sprite.width, 
      Sprite.height,
    );

    // Enable image smoothing
    context.imageSmoothingEnabled = true;
  }

  static renderButton(context, index = 0, x, y, pressed = false) {
    const i = 13 * 4 + 1 + index;
    const framex = i % Sprite.cols;
    const framey = Math.floor(i / Sprite.cols);

    // Disable image smoothing
    context.imageSmoothingEnabled = false;

    context.drawImage(
      Sprite.image, 
      framex*Sprite.framewidth, 
      framey*Sprite.frameheight + (pressed ? 11 : 0), 
      Sprite.framewidth, 
      11, 
      x, 
      y, 
      Sprite.width, 
      11*6,
    );

    // Enable image smoothing
    context.imageSmoothingEnabled = true;
  }
}

/**
 * @enum 
 */
export const CardSymbol = {
  "spades": 0,
  "clubs": 1,
  "diamonds": 2,
  "hearts": 3,
}
export const CardValue = ["ace", "king", "queen", "jack", 10, 9, 8, 7, 6, 5, 4, 3, 2];

export class Card {
  constructor(symbol, value, x = 0, y = 0) {
    this.position = new Vector(x, y);

    this.value = value;
    this.symbol = symbol;

    if (symbol === "back")
    {
      this.index = 52;
    }
    else 
    {
      this.index = CardSymbol[symbol] * 13;
      switch (value)
      {
        case "ace":
          break;
        case "king":
          this.index++;
          break;
        case "queen":
          this.index += 2;
          break;
        case "jack":
          this.index += 3;
          break;
        default:
          this.index += (14 - value);
      }
    }
  }

  toString() {
    return `${this.value} of ${this.symbol}`;
  }

  get width() {
    return Sprite.width;
  }
  get height() {
    return Sprite.height;
  }

  get rectangle() {
    return {
      x: this.position.x,
      y: this.position.y,
      w: this.width,
      h: this.height,
    }
  }

  static get backside () {
    return new Card("back");
  }

  render(context, backside = false) {
    if (backside)
    {
      Sprite.draw(context, 52, this.position.x, this.position.y);
    }
    else 
    {
      Sprite.draw(context, this.index, this.position.x, this.position.y);
    }
  }
}

const MAXANGLE = 0.03;
export class Pile {
  constructor(cards, position) {
    this.cards = cards.map(card => {
      return {
        card,
        angle: MAXANGLE - Math.random() * MAXANGLE*2,
        position: new Vector(5 - Math.random()*10, 5 - Math.random()*10),
      }
    });
    this.position = position;
  }

  remove() {
    return this.cards.splice(0, 1);
  }

  add(card) {
    this.cards.push({
      card,
      angle: MAXANGLE - Math.random() * MAXANGLE*2,
      position: new Vector(5 - Math.random()*10, 5 - Math.random()*10),
    });
  }

  render(context) {
    if (this.cards.length > 0)
    {
      context.save();
  
      // move to the center of the canvas
      // context.translate(this.position.x + Sprite.width/2, this.position.y + Sprite.height/2);
      context.translate(this.position.x, this.position.y);
      // simulate a pile of cards.. 
      for (let i=0; i<this.cards.length; i++)
      {
        // rotate the canvas to the specified degrees
        context.rotate(this.cards[i].angle);

        Sprite.draw(context, this.cards[i].card.index, this.cards[i].position.x, this.cards[i].position.y);
      }
  
      context.restore();
    }
  }
}

export class Deck {
  constructor(image, amount = 1) {
    this.imagesrc = image;
    this.amount = amount;
    this.available = [];
    this.cards = [];
    this.pile = new Pile([], Vector.Zero);
  }
  async load () {
    await Sprite.initialize(this.imagesrc, 5, 13);

    for (let i=0; i<this.amount; i++) {
    for (let symbol in CardSymbol)
    {
      for (let value of CardValue)
      {
        const card = new Card(symbol, value);
        this.available.push(card.index);
        this.cards.push(card);
        this.pile.add(Card.backside);
      }
    }}
  }

  get width() {
    return Sprite.width;
  }
  get height() {
    return Sprite.height;
  }

  /**
   * not render function but "draw a card" function
   */
  draw() {
    const next = this.available[0];
    this.available.splice(0, 1);
    this.pile.remove()

    return this.cards[next];
  }

  shuffle() {
    for (let i=0; i<this.available.length; i++)
    {
      const random = Math.floor(Math.random() * (this.available.length - 1));
      const temp = this.available[random]; // simple swap function
      
      this.available[random] = this.available[i];
      this.available[i] = temp;
    }
  }

  add(card) {
    this.available.push(card.index);
    this.pile.add(Card.backside);
  }

  render(context) {
    this.pile.render(context);
  }
}