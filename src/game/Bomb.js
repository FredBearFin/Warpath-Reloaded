// src/game/Bomb.js
import { BOMB_DATA } from '../constants.js';

export class Bomb {
  constructor(x,y,typeKey,owner){
    this.x=x; this.y=y; this.owner=owner;
    this.typeKey = typeKey;
    this.type = BOMB_DATA[typeKey];
    this.spawnTime = 0;
    this.detonationTime = 1500; // relative to spawn
    this.exploded = false;
    this.done = false;
    this.explosionRadius = 0;
  }
  arm(now){ this.spawnTime = now; }

  update(dt, game){
    if(this.done) return;
    const elapsed = game.time - this.spawnTime;
    if(!this.exploded && elapsed >= this.detonationTime){
      this.exploded = true;
      if(this.typeKey === 'heavy' && this.owner.id === 1) game.screenShake();
      // Use spatial grid to only check nearby drones
      const near = game.grid.neighbors(this.x, this.y, this.type.radius);
      for(const d of near){
        if(d.alive){
          const dx = d.pos.x - this.x, dy = d.pos.y - this.y;
          if(dx*dx + dy*dy < this.type.radius*this.type.radius){
            d.alive = false;
          }
        }
      }
    }
    if(this.exploded){
      this.explosionRadius += dt * 0.3;
      if(this.explosionRadius > this.type.radius) this.done = true;
    }
  }
}
