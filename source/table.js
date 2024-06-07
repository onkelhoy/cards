import { Deck, Pile, Sprite } from "card";
import { Hand } from "hand";
import { Vector } from "vector";
import { Button, EyeButton } from "button";

export class Table extends EventTarget {
  constructor(events, canvas, players = 2, decks = 1, piles = 1, online = false) {
    super();
    
    this.deck = new Deck("/images/spritesheet.png", events, decks);
    this.deck.addEventListener("click", this.handledeckclick);
    this.buttons = [new Button(canvas, events)];
    this.screenwidth = canvas.width;
    this.screenheight = canvas.height;

    this.players = [];
    if (typeof players === "number")
    {
      for (let i=0; i<players; i++)
      {
        this.players.push(new Hand(events, i, canvas));
        if (!online) 
        {
          this.players[i].show = false;
        }
      }
    }
    else 
    {
      for (let id of players)
      {
        this.players.push(new Hand(events, id, canvas));
        if (!online) 
        {
          this.players[this.players.length - 1].show = false;
        }
      }
    }

    this.players.forEach(player => player.addEventListener("drop", this.handledrop));
    this.piles = [];

    for (let i=0; i<piles; i++)
    {
      const pile = new Pile([], Vector.Zero, events);
      pile.addEventListener("click", this.handlepileclick);
      this.piles.push(pile);
    }

    this.turn = 0;
    if (!online) 
    {
      this.buttons.push(new EyeButton(canvas, events));
      this.buttons[1].addEventListener("click", this.handlereveal);
    }

    this.buttons[0].addEventListener("click", this.handlenext);
    this.online = online;
  }

  async initialize() {
    await this.deck.load();
    this.shuffle();

    let space = Sprite.width + 50; 
    if (space * (this.piles.length) > this.screenwidth)
    {
      space = this.screenwidth / (this.piles.length);
    }
    let start = Math.max(0, this.screenwidth/2 - (space * (this.piles.length) / 2) - 50)
    let y = this.screenheight / 2 - Sprite.height / 2;
    this.deck.pile.position.set(start, y);

    this.piles.forEach((p, i) => {
      let x = start + (i + 1) * space;
      p.position.set(x, y);
    });

    this.buttons[0].initialize(this.buttons.length, 0);
    if (this.buttons[1]) this.buttons[1].initialize(this.buttons.length, 1);

    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);

    this.deal(1);
    this.deal(1);
    this.deal(1);
    this.deal(1);
    this.deal(1);
    this.deal(1);
    this.deal(1);
  }

  deal(playerid) {
    if (playerid === undefined)
    {
      // deal 1 to all 
      for (let player of this.players)
      {
        player.add(this.deck.draw());
        this.piles[0].remove();
      }
    }
    else 
    {
      // deal 1 to playerid 
      for (let player of this.players)
      {
        if (player.id === playerid)
        {
          player.add(this.deck.draw());
          this.piles[0].remove();
          break;
        }
      }
    }
  }

  // event handlers 
  handledrop = (e) => {
    const { card } = e.detail;
    // figure out which pile
    let closestpile = null;
    let closestpiledistance = Number.MAX_SAFE_INTEGER;
    for (let pile of this.piles)
    {
      const distance = Vector.Distance(card.position, pile.position);
      if (distance < closestpiledistance)
      {
        closestpiledistance = distance;
        closestpile = pile;
      }
    }

    closestpile.add(card);
    // card.animate(closestpile.position);
  }
  handlenext = (e) => {
    this.turn++;
    if (this.buttons.length > 1)
    {
      this.players[this.turn%this.players.length].show = false;
      this.buttons[1].open = false;
    }
  }
  handlereveal = (e) => {
    this.players[this.turn%this.players.length].show = e.target.open;
  }
  handlepileclick = (e) => {
    console.log('pile-click');
    this.dispatchEvent(new CustomEvent("pile-click", { detail: { pile: e.target } }));
  }

  handledeckclick = (e) => {
    console.log('deck-click');
    this.dispatchEvent(new CustomEvent("deck-click", { detail: { deck: e.target } }));
  }

  shuffle() {
    this.deck.shuffle();
  }

  draw(context) {

    this.deck.render(context);
    
    this.piles.forEach(pile => pile.render(context));

    this.players.forEach(player => {
      player.turn = player.id === this.players[this.turn%this.players.length].id;
      player.render(context);
    });

    this.buttons.forEach(button => button.render(context));
  }
}