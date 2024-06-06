import { Engine } from "engine";
import { InputEvents } from "input-events";
import { Table } from "table";

let engine, events, table;
async function load() {
  engine = new Engine();
  events = new InputEvents(engine.canvas);
  table = new Table(events, engine.canvas);
  await table.initialize();

  engine.loop(draw); // cool function
  // draw();
}

function draw() {
  engine.ctx.clearRect(0, 0, engine.canvas.width, engine.canvas.height);
  table.draw(engine.ctx);
}

window.onload = () => load();

