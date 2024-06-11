import { Engine } from "engine";
import { InputEvents } from "input-events";
import { Pile } from "card";
import { Table } from "table";

let engine, events, table;
async function load() {
  engine = new Engine();
  events = new InputEvents(engine.canvas);
  table = new Table(events, engine.canvas);
  await table.initialize();

  
  for (let player of table.players) {
    table.piles.push(new Pile());
    table.piles.push(new Pile());
    table.piles.push(new Pile());
  }

  engine.loop(draw); // cool function
  // draw();
}

function draw() {
  engine.ctx.clearRect(0, 0, engine.canvas.width, engine.canvas.height);
  table.draw(engine.ctx);
}

window.onload = () => load();

