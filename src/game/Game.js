// src/game/Game.js
import { INITIAL_GAME_TIME_MS, INITIAL_DRONES, INITIAL_BOMBS, MAX_TOTAL_DRONES, DRONE_WAVE_SIZES, BOMB_TYPES, BOMB_OVERHEAT_COOLDOWN, COLORS } from '../constants.js';
import { Player } from './Player.js';
import { Drone } from './Drone.js';
import { Bomb } from './Bomb.js';
import { SpatialGrid } from '../core/SpatialGrid.js';

export class Game {
  constructor(dim, ui){
    this.players = [];
    this.drones = [];
    this.bombs = [];
    this.time = 0;
    this.gameTimer = INITIAL_GAME_TIME_MS;
    this.active = true;
    this.activeBombIndex = 1; // standard
    this.cooldowns = BOMB_OVERHEAT_COOLDOWN;
    this.dim = dim; // from engine
    this.ui = ui;
    this.grid = new SpatialGrid(48);
  }

  init(){
    // players: P1 up (-1), P2 down (+1)
    this.players = [ new Player(1, COLORS.P1_DRONE, -1), new Player(2, COLORS.P2_DRONE, 1) ];
    // override with initial constants in case Player defaults drift
    this.players[0].dronesRemaining = INITIAL_DRONES;
    this.players[1].dronesRemaining = INITIAL_DRONES;
    this.players[0].bombsRemaining = { ...INITIAL_BOMBS };
    this.players[1].bombsRemaining = { ...INITIAL_BOMBS };

    this.drones.length = 0;
    this.bombs.length = 0;
    this.time = 0;
    this.gameTimer = INITIAL_GAME_TIME_MS;
    this.active = true;
    this.ui.hideEnd();
  }

  tick(dt){
    if(!this.active) return;
    this.time += dt;
    this.gameTimer = Math.max(0, this.gameTimer - dt);

    // spatial grid rebuild
    this.grid.clear();
    for(const d of this.drones){ if(d.alive) this.grid.insert(d, d.pos.x, d.pos.y); }

    // players (cooldowns + AI)
    for(const p of this.players) p.tick(dt, this);

    // drones
    for(const d of this.drones){
      if(!d.alive) continue;
      d.flockFromGrid(this.grid);
      d.seekGoal(this.dim);
    }
    for(const d of this.drones) d.update();

    // bombs
    for(const b of this.bombs) b.update(dt, this);

    // cull drones that exit
    const w = this.dim.w, h = this.dim.h;
    const keepD = [];
    for(const d of this.drones){
      if(!d.alive) continue;
      if(d.owner.id===1 && d.pos.y < -d.radius){ this.players[0].score++; continue; }
      if(d.owner.id===2 && d.pos.y > h + d.radius){ this.players[1].score++; continue; }
      if(d.pos.x < -50 || d.pos.x > w + 50) continue;
      keepD.push(d);
    }
    this.drones = keepD;

    // cull bombs
    this.bombs = this.bombs.filter(b => !b.done);

    if(this.gameTimer <= 0) this.end();
  }

  deployDrones(player, waveType){
    const size = DRONE_WAVE_SIZES[waveType] || 0;
    if(!this.active || player.dronesRemaining < size) return;
    if(this.drones.length + size > MAX_TOTAL_DRONES) return;

    player.dronesRemaining -= size;
    const scale = (waveType === 'assault') ? 1.2 : 0.9;
    const cx = Math.random() * this.dim.w;
    const startY = (player.id===1) ? (this.dim.h + 50) : -50;

    for(let i=0;i<size;i++){
      const x = cx + (Math.random()-0.5) * 150;
      const y = startY + (Math.random()-0.5) * 150;
      this.drones.push(new Drone(x,y,player,scale));
    }
  }

  placeBomb(x,y,owner,typeKey){
    const sys = owner.bombSystems[typeKey];
    if(!this.active || sys.isOverheated || owner.bombsRemaining[typeKey] <= 0) return;
    owner.bombsRemaining[typeKey]--;
    sys.clip--;

    const b = new Bomb(x,y,typeKey,owner);
    b.arm(this.time);
    this.bombs.push(b);

    if(sys.clip <= 0){
      sys.isOverheated = true;
      sys.overheatStartTime = this.time;
      if(owner.id===1) this.screenShake();
    }
  }

  end(){
    if(!this.active) return;
    this.active = false;
    const p1 = this.players[0], p2 = this.players[1];
    if(p1.score > p2.score){
      this.ui.showEnd('VICTORY', `The clock has run out. You win by a score of ${p1.score} to ${p2.score}.`);
    } else if(p2.score > p1.score){
      this.ui.showEnd('DEFEAT', `The clock has run out. The enemy wins by a score of ${p2.score} to ${p1.score}.`);
    } else {
      this.ui.showEnd('STALEMATE', `The clock has run out. The final score is a draw: ${p1.score} to ${p1.score}.`);
    }
  }

  screenShake(){
    this.ui.screenShakeOn();
  }
}
