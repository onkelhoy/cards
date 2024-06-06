import { Deck, Pile, Sprite } from "card";
import { Hand } from "hand";
import { Vector } from "vector";

export class Table {
  constructor(events, canvas, players = 2, decks = 1, piles = 1) {
    this.deck = new Deck("images/deck.png", decks);
    this.screenwidth = canvas.width;
    this.screenheight = canvas.height;

    this.players = [];
    if (typeof players === "number")
    {
      for (let i=0; i<players; i++)
      {
        this.players.push(new Hand(events, i, canvas));
      }
    }
    else 
    {
      for (let id of players)
      {
        this.players.push(new Hand(events, id, canvas));
      }
    }

    this.players.forEach(player => player.addEventListener("drop", this.handledrop));
    this.piles = [];

    for (let i=0; i<piles; i++)
    {
      this.piles.push(new Pile([], Vector.Zero));
    }

    this.turn = this.players[0]?.id;
  }

  async initialize() {
    await this.deck.load();
    this.shuffle();

    let space = Sprite.width + 25; 
    if (space * (this.piles.length + 1) > this.screenwidth)
    {
      space = this.screenwidth / (this.piles.length + 1);
    }
    let start = Math.max(0, this.screenwidth/2 - (space * (this.piles.length + 1) / 2))
    let y = this.screenheight / 2 - Sprite.height / 2;
    this.deck.pile.position.set(start, y);

    this.piles.forEach((p, i) => {
      let x = start + (i + 1) * space;
      p.position.set(x, y);
    });

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
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
    this.deal(0);
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

  shuffle() {
    this.deck.shuffle();
  }

  draw(context) {

    this.deck.render(context);
    
    this.piles.forEach(pile => pile.render(context));

    this.players.forEach(player => {
      player.turn = player.id === this.turn;
      player.render(context);
    });
  }
}