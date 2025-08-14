// src/game/Drone.js
import { DRONE_MAX_SPEED, DRONE_MAX_FORCE, DPR } from '../constants.js';
import { Vec2 } from '../core/Math.js';

export class Drone {
  constructor(x,y,owner,scale){
    this.owner = owner;
    this.pos = new Vec2(x,y);
    this.vel = new Vec2(Math.random()-0.5, owner.direction*(0.5+Math.random()*0.5));
    this.acc = new Vec2(0,0);
    this.vel.limit(DRONE_MAX_SPEED);
    this.alive = true;
    this.scale = scale;
    this.radius = 2 * DPR * this.scale;
  }

  flockFromGrid(grid){
    // Approximate boids using neighbors from spatial grid
    const perception = 40 * DPR;
    const sepRadius = 15 * DPR * this.scale;

    let count = 0;
    let ax=0, ay=0;   // alignment accumulator (velocity)
    let cx=0, cy=0;   // cohesion accumulator (positions)
    let sx=0, sy=0;   // separation accumulator (direction away)

    const neigh = grid.neighbors(this.pos.x, this.pos.y, perception);
    for(const other of neigh){
      if(other === this || !other.alive || other.owner.id !== this.owner.id) continue;
      const dx = this.pos.x - other.pos.x;
      const dy = this.pos.y - other.pos.y;
      const d2 = dx*dx + dy*dy;
      if(d2 === 0) continue;
      const d = Math.sqrt(d2);
      if(d < perception){
        if(d < sepRadius){
          // weighted by inverse distance
          const inv = 1 / d;
          sx += dx * inv;
          sy += dy * inv;
        }
        ax += other.vel.x;
        ay += other.vel.y;
        cx += other.pos.x;
        cy += other.pos.y;
        count++;
      }
    }
    if(count > 0){
      // cohesion
      cx /= count; cy /= count;
      let dx = cx - this.pos.x, dy = cy - this.pos.y;
      let mag = Math.hypot(dx,dy);
      if(mag>0){ dx/=mag; dy/=mag; }
      let desiredX = dx * DRONE_MAX_SPEED, desiredY = dy * DRONE_MAX_SPEED;
      let steerX = desiredX - this.vel.x, steerY = desiredY - this.vel.y;
      // limit
      mag = Math.hypot(steerX,steerY); if(mag>DRONE_MAX_FORCE){ steerX = steerX/mag*DRONE_MAX_FORCE; steerY = steerY/mag*DRONE_MAX_FORCE; }
      this.acc.x += steerX * 1.2;
      this.acc.y += steerY * 1.2;

      // alignment
      ax /= count; ay /= count;
      mag = Math.hypot(ax,ay); if(mag>0){ ax/=mag; ay/=mag; }
      desiredX = ax * DRONE_MAX_SPEED; desiredY = ay * DRONE_MAX_SPEED;
      steerX = desiredX - this.vel.x; steerY = desiredY - this.vel.y;
      mag = Math.hypot(steerX,steerY); if(mag>DRONE_MAX_FORCE){ steerX = steerX/mag*DRONE_MAX_FORCE; steerY = steerY/mag*DRONE_MAX_FORCE; }
      this.acc.x += steerX * 1.0;
      this.acc.y += steerY * 1.0;

      // separation
      // normalize (sx,sy)
      mag = Math.hypot(sx,sy); if(mag>0){ sx/=mag; sy/=mag; }
      desiredX = sx * DRONE_MAX_SPEED; desiredY = sy * DRONE_MAX_SPEED;
      steerX = desiredX - this.vel.x; steerY = desiredY - this.vel.y;
      mag = Math.hypot(steerX,steerY); if(mag>DRONE_MAX_FORCE){ steerX = steerX/mag*DRONE_MAX_FORCE; steerY = steerY/mag*DRONE_MAX_FORCE; }
      this.acc.x += steerX * 1.8;
      this.acc.y += steerY * 1.8;
    }
  }

  seekGoal(dim){
    const goalY = this.owner.direction === 1 ? dim.h + 50 : -50;
    const dx = 0;
    const dy = goalY - this.pos.y;
    let mag = Math.hypot(dx,dy);
    let nx=0, ny=0;
    if(mag>0){ nx = dx/mag; ny = dy/mag; }
    const desiredX = nx * DRONE_MAX_SPEED;
    const desiredY = ny * DRONE_MAX_SPEED;
    let steerX = desiredX - this.vel.x;
    let steerY = desiredY - this.vel.y;
    mag = Math.hypot(steerX,steerY);
    if(mag > DRONE_MAX_FORCE*0.8){
      steerX = steerX/mag * (DRONE_MAX_FORCE*0.8);
      steerY = steerY/mag * (DRONE_MAX_FORCE*0.8);
    }
    this.acc.x += steerX;
    this.acc.y += steerY;
  }

  update(){
    if(!this.alive) return;
    this.vel.add(this.acc).limit(DRONE_MAX_SPEED);
    this.pos.add(this.vel);
    this.acc.set(0,0);
  }
}
