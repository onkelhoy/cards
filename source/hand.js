import { Vector } from "vector";
import { isPointInRectangle } from "collision";
import { Sprite } from "card";

export class Hand extends EventTarget {
  constructor(events, id, canvas) {
    super();

    this.cards = [];
    this.selected = null;
    this.maybeselect = null;
    this.clickstart = Vector.Zero;
    this.highlight = [];
    this.id = id;
    this.turn = false;
    this.screenwidth = canvas.width;
    this.screenheight = canvas.height;

    events.on('mouse-down', this.handlemousedown);
    events.on('mouse-up', this.handlemouseup);
    events.on('mouse-move', this.handlemousemove);
  }

  // event handlers 
  /** deals with down event - idealy to select a card
   * @private
   * @param {*} e 
   */
  handlemousedown = (e) => {
    if (!this.turn) return;
    this.clickstart = e.target.position.copy();
    
    for (let i=this.cards.length-1; i>=0; i--) {
      const card = this.cards[i];
      if (isPointInRectangle(e.target.position, card.rectangle))
      {
        const original = card.position.copy()
        card.position.y -= 10;
        this.maybeselect = {
          card,
          offset: e.target.position.Sub(card.position),
          original,
        };
        break;
      }
    };
  }
  /** deals with up event - idealy to finish a action
   * @private
   * @param {*} e 
   */
  handlemouseup = (e) => {
    if (!this.turn) return;

    if (this.maybeselect)
    {
      this.maybeselect.card.position.set(this.maybeselect.original);
      this.maybeselect = null;
    }

    if (this.highlight.length > 0)
    {
      this.highlight.forEach(highlight => {
        highlight.card.position.set(highlight.original);
      });
      this.highlight = [];
    }

    if (this.selected)
    {
      if (this.selected.card.position.y < (this.screenheight - 200))
      {
        console.log('drop-zone')
        const index =  this.cards.findIndex(c => c.index === this.selected.card.index);
        this.cards.splice(index, 1);
        this.dispatchEvent(new CustomEvent('drop', { detail: { card: this.selected.card }}));
        this.setDeckPosition();
      }
      else 
      {
        // move back 
        console.log('move back');
        this.selected.card.position.set(this.selected.original);
      }
      this.selected = null;
    }
  }
  /** deals with move event - idealy when moving a card
   * @private
   * @param {*} e 
   */
  handlemousemove = (e) => {
    if (!this.turn) return;
    // if (!this.maybeselect && !this.selected) return;

    if (this.selected)
    {
      this.selected.card.position.set(e.target.position.Sub(this.selected.offset));
      const dpos = this.selected.original.Sub(this.selected.card.position);

      if (this.highlight.length > 0)
      {
        this.highlight.forEach(highlight => {
          highlight.card.position.set(highlight.original);
        });
        this.highlight = [];
      }
      
      // check if we should rearange 
      if (dpos.y < 80)
      {
        let closestleft = {
          card: null,
          distance: Number.MAX_SAFE_INTEGER
        }
        let closestright = {
          card: null,
          distance: Number.MAX_SAFE_INTEGER
        }
        for (let card of this.cards) {
          const rightdistance = card.position.x - e.target.position.x; 
          if (rightdistance > 0 && rightdistance < closestright.distance)
          {
            closestright.distance = rightdistance;
            closestright.card = card;
          } 
          const leftdistance = e.target.position.x - card.position.x
          if (leftdistance > 0 && leftdistance < closestleft.distance)
          {
            closestleft.distance = leftdistance;
            closestleft.card = card;
          }
        }

        if (closestleft.card)
        {
          this.highlight.push({card: closestleft.card, original: closestleft.card.position.copy()})
          closestleft.card.position.y -= 15;
          closestleft.card.position.x = this.selected.card.position.x - Sprite.width - 15;
        }
        if (closestright.card)
        {
          this.highlight.push({card: closestright.card, original: closestright.card.position.copy()})
          closestright.card.position.y -= 15;
          closestright.card.position.x = this.selected.card.position.x + Sprite.width + 15;
        }
      }
      return;
    }
    
    if (!this.maybeselect) return; 
    
    this.maybeselect.card.position.set(e.target.position.Sub(this.maybeselect.offset));
    const dpos = this.maybeselect.original.Sub(this.maybeselect.card.position);

    if (dpos.y > 40)
    {
      this.selected = {
        ...this.maybeselect
      };

      this.maybeselect = null;
    }
    else 
    {
      for (let i=this.cards.length-1; i>=0; i--) {
        const card = this.cards[i];
        if (card.index === this.maybeselect.card.index) 
        {
          continue;
        }

        if (isPointInRectangle(e.target.position, card.rectangle))
        {
          // we need to know which one should be the selected.. 
          // this new card or the current maybeselect ?

          // we need to calculate from the original position of maybeselect 
          const da = Math.abs(card.position.x + card.width/2 - e.target.position.x);
          const db = Math.abs(this.maybeselect.original.x + card.width/2 - e.target.position.x);

          if (da > db) continue; // let other cards also determine 

          this.maybeselect.card.position.set(this.maybeselect.original);

          const original = card.position.copy()
          card.position.y -= 10;
          this.maybeselect = {
            card,
            offset: e.target.position.Sub(card.position), 
            original,
          };
          break;
        }
      }
    }
  }

  add(card) {
    this.cards.push(card);
    this.setDeckPosition();
  }

  setDeckPosition() {
    let cardwidth = 0;
    if (this.cards[0])
    {
      cardwidth = this.cards[0].width
    }
    else if (this.selected)
    {
      cardwidth = this.selected.width;
    }
    else 
    {
      console.error('something went wrong', this.cards, this.selected)
      throw new Error("Could not establish card width");
    }
    
    let space = cardwidth + 15; 
    if (space * this.cards.length > (this.screenwidth - Sprite.width))
    {
      space = (this.screenwidth - Sprite.width) / this.cards.length;
    }
    let start = Math.max(0, this.screenwidth/2 - (space * this.cards.length / 2) - Sprite.width/2)

    this.cards.forEach((card, i) => {
      // console.log(card, this.cards);
      let x = start + i * space;
      let y = this.screenheight - 130;

      // // hightlight index [0, 1] - (left, right)
      // const hi = this.highlight.findIndex(v => v === i);
      // if (hi !== -1)
      // {
      //   // card.position.set(x, height - 65);
      //   y -= 15;
      //   if (hi === 0 && space < cardwidth)
      //   {
      //     x -= cardwidth;
      //   }
      // }
      card.position.set(x, y);
    });
  }

  render(context) {
    if (!this.turn) return;
    if (this.cards.length === 0 && !this.selected) return;

    this.cards.forEach(card => card.render(context));
    if (this.selected)
    {
      this.selected.card.render(context);
    }
    if (this.maybeselect) // double render but its okay
    {
      this.maybeselect.card.render(context);
    }

    this.highlight.forEach(h => h.card.render(context)); // also double render
  }
}