// src/main.js
import { Engine } from './core/Engine.js';
import { Renderer } from './render/Renderer.js';
import { UI } from './ui/ui.js';
import { Input } from './input/Input.js';
import { BOMB_TYPES } from './constants.js';
import { Game } from './game/Game.js';

const canvas = document.getElementById('gameCanvas');
const root = document.getElementById('game-root');

// Init modules
const ui = new UI(root);
const input = new Input(canvas);
const engine = new Engine(onUpdate, onRender);
engine.attachCanvas(canvas);

const game = new Game(engine.dim, ui);

// Wiring input -> game
input.onPlaceBomb = (x,y)=>{
  const key = BOMB_TYPES[game.activeBombIndex];
  game.placeBomb(x,y, game.players[0], key);
};
input.onDeploy = (waveType)=> game.deployDrones(game.players[0], waveType);
input.onChangeBomb = (dir)=>{
  game.activeBombIndex = (game.activeBombIndex + dir + BOMB_TYPES.length) % BOMB_TYPES.length;
};

ui.bindRestart(()=>{
  game.init();
});

// Start
game.init();
engine.start();

function onUpdate(dt){
  game.tick(dt);
  ui.update(game, game.time);
}
function onRender(ctx, dim){
  if(!renderer) renderer = new Renderer(canvas, ui, input);
  renderer.draw(game, dim);
}
let renderer = null;
