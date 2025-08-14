// src/render/Renderer.js
import { COLORS, BOMB_TYPES, BOMB_DATA, DPR } from '../constants.js';

export class Renderer {
  constructor(canvas, ui, input){
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ui = ui;
    this.input = input;
    this._dashSet = false;
  }

  draw(game, dim){
    const ctx = this.ctx;
    const { w, h, warpathTop, warpathBottom } = dim;

    // Clear
    ctx.clearRect(0,0,w,h);

    // Warpath background
    ctx.fillStyle = COLORS.WARPATH_BG;
    ctx.fillRect(0, warpathTop, w, warpathBottom - warpathTop);

    // Zone lines (avoid resetting dash each path)
    if(!this._dashSet){
      ctx.setLineDash([10*DPR, 10*DPR]);
      this._dashSet = true;
    }
    ctx.strokeStyle = COLORS.ZONE_LINE;
    ctx.lineWidth = 1 * DPR;
    ctx.beginPath(); ctx.moveTo(0,warpathTop); ctx.lineTo(w,warpathTop); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,warpathBottom); ctx.lineTo(w,warpathBottom); ctx.stroke();

    // Drones (two passes by color to minimize style switches)
    ctx.setLineDash([]); this._dashSet = false;
    ctx.fillStyle = game.players[0].color;
    for(const d of game.drones){ if(d.alive && d.owner.id===1) this._drawDrone(ctx,d); }
    ctx.fillStyle = game.players[1].color;
    for(const d of game.drones){ if(d.alive && d.owner.id===2) this._drawDrone(ctx,d); }

    // Bombs
    for(const b of game.bombs){ this._drawBomb(ctx, b, game.time); }

    // Target reticle
    const m = this.input.mouse;
    if(m.y>warpathTop && m.y<warpathBottom && game.active){
      const key = BOMB_TYPES[game.activeBombIndex];
      const type = BOMB_DATA[key];
      const player = game.players[0];
      const sys = player.bombSystems[key];
      const has = player.bombsRemaining[key] > 0;
      let color = sys.isOverheated ? 'rgba(150,150,150,.4)' : (has ? type.color : 'rgba(255,0,0,.5)');
      ctx.strokeStyle = color; ctx.lineWidth = 1 * DPR;
      ctx.beginPath(); ctx.arc(m.x, m.y, type.radius, 0, Math.PI*2); ctx.stroke();
    }
  }

  _drawDrone(ctx, d){
    ctx.save();
    ctx.translate(d.pos.x, d.pos.y);
    ctx.rotate(Math.atan2(d.vel.y, d.vel.x) + Math.PI/2);
    ctx.beginPath();
    const r = d.radius;
    ctx.moveTo(0, -r);
    ctx.lineTo(-r*0.7, r*0.7);
    ctx.lineTo(r*0.7, r*0.7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  _drawBomb(ctx, b, now){
    if(b.done) return;
    const elapsed = now - b.spawnTime;
    if(!b.exploded){
      ctx.strokeStyle = b.type.color; ctx.lineWidth = 1*DPR;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.type.radius, 0, Math.PI*2); ctx.stroke();
      // charging fill
      const progress = Math.min(1, elapsed / b.detonationTime);
      const col = b.type.color.replace(/, 0\.[0-9]+\)/, ', 0.2)');
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.type.radius*progress, 0, Math.PI*2); ctx.fill();
    }else{
      const progress = Math.min(1, b.explosionRadius / b.type.radius);
      const alpha = 1 - progress;
      const g = ctx.createRadialGradient(b.x,b.y,0, b.x,b.y,b.explosionRadius);
      g.addColorStop(0, b.type.color.replace(/, 0\.[0-9]+\)/, `, ${alpha*0.9})`));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(b.x,b.y,b.explosionRadius,0,Math.PI*2); ctx.fill();
    }
  }
}
